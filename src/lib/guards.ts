import { NextResponse } from "next/server";
import { hasConsent } from "./consent";
import { isBrazilAccessAllowed, isVotingOpen } from "./geo";


export async function brazilApiGuard(): Promise<NextResponse | null> {
  const { allowed } = await isBrazilAccessAllowed();
  if (!allowed) {
    return NextResponse.json(
      { error: "Votação disponível apenas a partir do Brasil." },
      { status: 403 },
    );
  }
  return null;
}

export async function consentApiGuard(): Promise<NextResponse | null> {
  if (!(await hasConsent())) {
    return NextResponse.json(
      { error: "Aceite o aviso de privacidade antes de continuar." },
      { status: 403 },
    );
  }
  return null;
}

export function votingClosedApiGuard(): NextResponse | null {
  if (!isVotingOpen()) {
    return NextResponse.json(
      { error: "A votação desta enquete está encerrada." },
      { status: 403 },
    );
  }
  return null;
}
