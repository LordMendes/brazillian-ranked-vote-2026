import { describe, expect, it } from "vitest";
import { VOTE_SESSION_MS, voteAccess } from "./vote-access";

const now = 1_700_000_000_000;

describe("voteAccess", () => {
  it("refuses a visit with no magic-link session", () => {
    expect(voteAccess({}, now)).toBe("missing");
    expect(voteAccess({ verifiedAt: now }, now)).toBe("missing");
  });

  it("refuses a session that was not stamped by the link", () => {
    expect(voteAccess({ email: "a@b.com" }, now)).toBe("expired");
  });

  it("allows a session inside the 30 minute window", () => {
    expect(voteAccess({ email: "a@b.com", verifiedAt: now - VOTE_SESSION_MS }, now)).toBe("ok");
  });

  it("expires the session without treating the email as used", () => {
    expect(
      voteAccess({ email: "a@b.com", verifiedAt: now - VOTE_SESSION_MS - 1 }, now),
    ).toBe("expired");
  });
});
