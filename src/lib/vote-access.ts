/** How long a magic-link session can open the ballot. */
export const VOTE_SESSION_MS = 30 * 60 * 1000;

export const VOTE_SESSION_SEC = VOTE_SESSION_MS / 1000;

export type VoteAccess = "ok" | "missing" | "expired";

/**
 * The ballot is reachable only after /acesso/[token] seals a session.
 * The address is not consumed here — that happens when the vote is stored.
 */
export function voteAccess(
  session: { email?: string; verifiedAt?: number },
  now = Date.now(),
): VoteAccess {
  if (!session.email) return "missing";
  if (typeof session.verifiedAt !== "number") return "expired";
  if (now - session.verifiedAt > VOTE_SESSION_MS) return "expired";
  return "ok";
}
