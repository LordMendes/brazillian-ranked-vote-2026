import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { secureCookies, serverSecret } from "./platform";
import { VOTE_SESSION_SEC } from "./vote-access";

export type VoteSession = {
  email?: string;
  verifiedAt?: number;
};

function sessionOptions(): SessionOptions {
  return {
    cookieName: "enquete_sessao",
    password: serverSecret(),
    ttl: VOTE_SESSION_SEC,
    cookieOptions: {
      httpOnly: true,
      secure: secureCookies(),
      sameSite: "lax",
      path: "/",
    },
  };
}

export async function getVoteSession() {
  const cookieStore = await cookies();
  return getIronSession<VoteSession>(cookieStore, sessionOptions());
}
