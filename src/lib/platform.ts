import web from "../../service";

type WebInput = ReturnType<typeof web.input>;

function composerInput(): WebInput | null {
  try {
    return web.input();
  } catch {
    return null;
  }
}

export function serverSecret(): string {
  const input = composerInput();
  const secret = input ? input.serverSecret.expose() : process.env.SERVER_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SERVER_SECRET must be set and at least 32 characters");
  }
  return secret;
}

export function resendApiKey(): string | undefined {
  const input = composerInput();
  if (input) return input.resendApiKey.expose();
  return process.env.RESEND_API_KEY;
}

export function resendFrom(fallback: string): string {
  const input = composerInput();
  if (input?.resendFrom) return input.resendFrom;
  return process.env.RESEND_FROM || fallback;
}

/** Compute sits behind Prisma's proxy, so the deployed service always trusts it. */
export function trustProxy(): boolean {
  const input = composerInput();
  if (input) return input.trustProxy;
  return process.env.TRUST_PROXY === "true";
}

export function allowNonBr(): boolean {
  const input = composerInput();
  if (input) return input.allowNonBr === "true";
  return process.env.ALLOW_NON_BR === "true";
}

export function votingClosesAt(): string | undefined {
  const input = composerInput();
  if (input) return input.votingClosesAt;
  return process.env.VOTING_CLOSES_AT;
}

export function useResend(): boolean {
  if (composerInput()) return true;
  return process.env.NODE_ENV === "production";
}

export function secureCookies(): boolean {
  if (composerInput()) return true;
  return process.env.NODE_ENV === "production";
}

/** Public URL of this deployment. Preview stages get their own origin. */
export function appOrigin(fallback?: string): string {
  try {
    return web.origin().replace(/\/$/, "");
  } catch {
    return (fallback || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  }
}
