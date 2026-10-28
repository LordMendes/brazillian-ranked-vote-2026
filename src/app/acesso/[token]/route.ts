import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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
  const pending = await prisma.acessoPendente.findUnique({
    where: { tokenHash },
  });

  if (!pending || pending.expiresAt.getTime() < Date.now()) {
    if (pending) {
      await prisma.acessoPendente.delete({ where: { id: pending.id } }).catch(() => {});
    }
    return NextResponse.redirect(`${appUrl}/?erro=expirado`);
  }

  let email: string;
  try {
    email = decryptEmail(pending.emailEncrypted);
  } catch {
    await prisma.acessoPendente.delete({ where: { id: pending.id } }).catch(() => {});
    return NextResponse.redirect(`${appUrl}/?erro=link`);
  }

  // Single-use: delete before checking participation
  await prisma.acessoPendente.delete({ where: { id: pending.id } });

  const emailHash = hashEmail(email);
  const already = await prisma.participanteVerificado.findUnique({
    where: { emailHash },
    select: { id: true },
  });

  if (already) {
    return NextResponse.redirect(`${appUrl}/?erro=ja_participou`);
  }

  const session = await getVoteSession();
  session.email = email;
  session.verifiedAt = Date.now();
  await session.save();

  return NextResponse.redirect(`${appUrl}/votar`);
}
