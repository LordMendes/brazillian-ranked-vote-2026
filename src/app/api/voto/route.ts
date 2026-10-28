import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashEmail, hashIp, truncateToHour } from "@/lib/crypto";
import { validateRanking } from "@/lib/candidates";
import {
  FIRST_ROUND_VOTE_IDS,
  SECOND_ROUND_VOTE_IDS,
  parseOfficialVote,
} from "@/lib/official-vote";
import { rateLimit } from "@/lib/rate-limit";
import { brazilApiGuard, consentApiGuard, votingClosedApiGuard } from "@/lib/guards";
import { getVoteSession } from "@/lib/session";
import { extractClientIp } from "@/lib/geo";
import { headers } from "next/headers";

const optionalVote = z.union([z.string().max(80), z.null()]).optional();

const bodySchema = z.object({
  ranking: z.array(z.string()).min(1).max(13),
  votoPrimeiroTurno: optionalVote,
  votoSegundoTurno: optionalVote,
});

export async function POST(request: Request) {
  try {
    const blocked = await brazilApiGuard();
    if (blocked) return blocked;

    const noConsent = await consentApiGuard();
    if (noConsent) return noConsent;

    const closed = votingClosedApiGuard();
    if (closed) return closed;

    const session = await getVoteSession();
    if (!session.email) {
      return NextResponse.json(
        { error: "Sessão inválida. Solicite um novo link de acesso." },
        { status: 401 },
      );
    }

    const headerStore = await headers();
    const ip = extractClientIp(headerStore) ?? "unknown";
    const ipLimit = rateLimit(`vote:ip:${hashIp(ip)}`, 20, 15 * 60_000);
    if (!ipLimit.ok) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente mais tarde." },
        { status: 429 },
      );
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados do voto inválidos." }, { status: 400 });
    }

    const ranking = validateRanking(parsed.data.ranking);
    if (!ranking) {
      return NextResponse.json({ error: "Ranking inválido." }, { status: 400 });
    }

    const primeiro = parseOfficialVote(
      parsed.data.votoPrimeiroTurno,
      FIRST_ROUND_VOTE_IDS,
    );
    if (!primeiro.ok) {
      return NextResponse.json({ error: "Voto do 1º turno inválido." }, { status: 400 });
    }

    const segundo = parseOfficialVote(
      parsed.data.votoSegundoTurno,
      SECOND_ROUND_VOTE_IDS,
    );
    if (!segundo.ok) {
      return NextResponse.json({ error: "Voto do 2º turno inválido." }, { status: 400 });
    }

    const emailHash = hashEmail(session.email);

    try {
      await prisma.$transaction(async (tx) => {
        await tx.participanteVerificado.create({
          data: { emailHash },
        });
        await tx.votoComputado.create({
          data: {
            ranking,
            dataSubmissao: truncateToHour(),
            votoPrimeiroTurno: primeiro.value,
            votoSegundoTurno: segundo.value,
          },
        });
      });
    } catch (err: unknown) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: unknown }).code)
          : "";
      if (code === "P2002") {
        session.destroy();
        await session.save();
        return NextResponse.json(
          { error: "Este e-mail já registrou participação." },
          { status: 409 },
        );
      }
      throw err;
    }

    session.destroy();
    await session.save();

    return NextResponse.json({
      ok: true,
      message: "Seu voto foi registrado de forma anônima. Obrigado por participar.",
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível registrar o voto." },
      { status: 500 },
    );
  }
}
