import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  encryptEmail,
  generateOpaqueToken,
  hashEmail,
  hashIp,
  hashToken,
  normalizeEmail,
} from "@/lib/crypto";
import { sendMagicLink } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";
import { brazilApiGuard, consentApiGuard, votingClosedApiGuard } from "@/lib/guards";
import { extractClientIp } from "@/lib/geo";
import { headers } from "next/headers";

const bodySchema = z.object({
  email: z.string().email().max(254),
});

export async function POST(request: Request) {
  try {
    const blocked = await brazilApiGuard();
    if (blocked) return blocked;

    const noConsent = await consentApiGuard();
    if (noConsent) return noConsent;

    const closed = votingClosedApiGuard();
    if (closed) return closed;

    const headerStore = await headers();
    const ip = extractClientIp(headerStore) ?? "unknown";
    const ipLimit = rateLimit(`verify:ip:${hashIp(ip)}`, 10, 15 * 60_000);
    if (!ipLimit.ok) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente mais tarde." },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSec) } },
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
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }

    const email = normalizeEmail(parsed.data.email);
    const emailLimit = rateLimit(`verify:email:${hashEmail(email)}`, 3, 15 * 60_000);
    if (!emailLimit.ok) {
      return NextResponse.json(
        { error: "Aguarde alguns minutos antes de solicitar outro link." },
        { status: 429 },
      );
    }

    const emailHash = hashEmail(email);
    const already = await prisma.participanteVerificado.findUnique({
      where: { emailHash },
      select: { id: true },
    });
    if (already) {
      return NextResponse.json({
        ok: true,
        alreadyParticipated: true,
        message: "Este e-mail já registrou participação.",
      });
    }

    const token = generateOpaqueToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 15 * 60_000);

    await prisma.acessoPendente.create({
      data: {
        tokenHash,
        emailEncrypted: encryptEmail(email),
        expiresAt,
      },
    });

    const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
    const link = `${appUrl}/acesso/${token}`;

    await sendMagicLink(email, link);

    return NextResponse.json({
      ok: true,
      alreadyParticipated: false,
      message:
        "Se o e-mail for válido, enviamos um link de acesso. Verifique sua caixa de entrada.",
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível processar a solicitação." },
      { status: 500 },
    );
  }
}
