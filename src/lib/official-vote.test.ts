import { describe, expect, it } from "vitest";
import {
  FIRST_ROUND_VOTE_IDS,
  SECOND_ROUND_VOTE_IDS,
  parseOfficialVote,
} from "./official-vote";

describe("parseOfficialVote", () => {
  it("treats empty answers as skipped", () => {
    expect(parseOfficialVote(undefined, FIRST_ROUND_VOTE_IDS)).toEqual({
      ok: true,
      value: null,
    });
    expect(parseOfficialVote(null, FIRST_ROUND_VOTE_IDS)).toEqual({
      ok: true,
      value: null,
    });
    expect(parseOfficialVote("  ", FIRST_ROUND_VOTE_IDS)).toEqual({
      ok: true,
      value: null,
    });
  });

  it("accepts any first-round candidate and the extra ballots", () => {
    expect(parseOfficialVote("zema", FIRST_ROUND_VOTE_IDS)).toEqual({
      ok: true,
      value: "zema",
    });
    expect(parseOfficialVote("branco", FIRST_ROUND_VOTE_IDS)).toEqual({
      ok: true,
      value: "branco",
    });
  });

  it("limits the second round to the official runoff", () => {
    expect(parseOfficialVote("lula", SECOND_ROUND_VOTE_IDS)).toEqual({
      ok: true,
      value: "lula",
    });
    expect(parseOfficialVote("flavio-bolsonaro", SECOND_ROUND_VOTE_IDS).ok).toBe(true);
    expect(parseOfficialVote("zema", SECOND_ROUND_VOTE_IDS)).toEqual({ ok: false });
    expect(parseOfficialVote("nao-votei", SECOND_ROUND_VOTE_IDS)).toEqual({
      ok: true,
      value: "nao-votei",
    });
  });

  it("rejects unknown values", () => {
    expect(parseOfficialVote("alguem", FIRST_ROUND_VOTE_IDS)).toEqual({ ok: false });
    expect(parseOfficialVote(13, FIRST_ROUND_VOTE_IDS)).toEqual({ ok: false });
  });
});
