import { NextResponse } from "next/server";
import { db, timestampToDate } from "@/lib/db";
import { decryptEmail, hashEmail, hashToken } from "@/lib/crypto";
import { getVoteSession } from "@/lib/session";
import { isBrazilAccessAllowed, isVotingOpen } from "@/lib/geo";

type Params = { params: Promise<{ token: string }> };

export async function GET(request: Request, { params }: Params) {
  const { allowed } = await isBrazilAccessAllowed();
  const appUrl = (process.env.APP_URL || new URL(request.url).origin).replace(/\/$/, "");

  if (!allowed) {
    return NextResponse.redirect(`${appUrl}/bloqueado`);
  }

  if (!isVotingOpen()) {
    return NextResponse.redirect(`${appUrl}/?encerrada=1`);
  }

  const { token } = await params;
  if (!token || token.length < 20) {
    return NextResponse.redirect(`${appUrl}/?erro=link`);
  }

  const tokenHash = hashToken(token);
  const pending = await db.orm.public.AcessoPendente.where({ tokenHash }).first();

  if (!pending || timestampToDate(pending.expiresAt).getTime() < Date.now()) {
    if (pending) {
      await db.orm.public.AcessoPendente.where({ id: pending.id }).delete().catch(() => {});
    }
    return NextResponse.redirect(`${appUrl}/?erro=expirado`);
  }

  let email: string;
  try {
    email = decryptEmail(pending.emailEncrypted);
  } catch {
    await db.orm.public.AcessoPendente.where({ id: pending.id }).delete().catch(() => {});
    return NextResponse.redirect(`${appUrl}/?erro=link`);
  }

  // Single-use: delete before checking participation
  await db.orm.public.AcessoPendente.where({ id: pending.id }).delete();

  const emailHash = hashEmail(email);
  const already = await db.orm.public.ParticipanteVerificado.select("id")
    .where({ emailHash })
    .first();

  if (already) {
    return NextResponse.redirect(`${appUrl}/?erro=ja_participou`);
  }

  const session = await getVoteSession();
  session.email = email;
  session.verifiedAt = Date.now();
  await session.save();

  return NextResponse.redirect(`${appUrl}/votar`);
}
