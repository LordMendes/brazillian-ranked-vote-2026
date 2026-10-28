import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { VOTE_SESSION_SEC } from "./vote-access";

export type VoteSession = {
  email?: string;
  verifiedAt?: number;
};

function sessionOptions(): SessionOptions {
  const password = process.env.SERVER_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SERVER_SECRET must be set and at least 32 characters");
  }
  return {
    cookieName: "enquete_sessao",
    password,
    ttl: VOTE_SESSION_SEC,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  };
}

export async function getVoteSession() {
  const cookieStore = await cookies();
  return getIronSession<VoteSession>(cookieStore, sessionOptions());
}
