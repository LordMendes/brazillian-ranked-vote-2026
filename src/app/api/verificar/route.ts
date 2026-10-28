import { NextResponse } from "next/server";
import { z } from "zod";
import { db, toTimestamp } from "@/lib/db";
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

    // Participation is recorded only when the ballot is stored. A used or
    // expired link, with no vote, does not block another request.
    const emailHash = hashEmail(email);
    const already = await db.orm.public.ParticipanteVerificado.select("id")
      .where({ emailHash })
      .first();
    if (already) {
      return NextResponse.json({
        ok: true,
        alreadyParticipated: true,
        message: "Este e-mail já registrou participação.",
      });
    }

    const token = generateOpaqueToken();
    const tokenHash = hashToken(token);
    const expiresAt = toTimestamp(new Date(Date.now() + 15 * 60_000));

    const pending = await db.orm.public.AcessoPendente.create({
      tokenHash,
      emailEncrypted: encryptEmail(email),
      expiresAt,
    });

    const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
    const link = `${appUrl}/acesso/${token}`;

    try {
      await sendMagicLink(email, link);
    } catch (err) {
      await db.orm.public.AcessoPendente.where({ id: pending.id })
        .delete()
        .catch(() => undefined);
      throw err;
    }

    return NextResponse.json({
      ok: true,
      alreadyParticipated: false,
      message:
        "Se o e-mail for válido, enviamos um link de acesso. Verifique sua caixa de entrada.",
    });
  } catch (err) {
    const cause =
      err instanceof Error && err.cause && typeof err.cause === "object"
        ? (err.cause as { name?: string }).name
        : undefined;
    if (process.env.NODE_ENV !== "production" && cause === "mailhog_unavailable") {
      return NextResponse.json(
        {
          error:
            `O MailHog não aceitou o e-mail. Confirme se o serviço está no ar (http://localhost:${process.env.MAILHOG_UI_PORT || "8025"}).`,
        },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: "Não foi possível processar a solicitação." },
      { status: 500 },
    );
  }
}
