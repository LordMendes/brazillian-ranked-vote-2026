import { describe, expect, it } from "vitest";
import { CANDIDATES, validateRanking } from "./candidates";

describe("validateRanking", () => {
  it("accepts a partial unique ranking", () => {
    const ids = [CANDIDATES[0]!.id, CANDIDATES[2]!.id];
    expect(validateRanking(ids)).toEqual(ids);
  });

  it("rejects empty, duplicates, and unknown ids", () => {
    expect(validateRanking([])).toBeNull();
    expect(validateRanking([CANDIDATES[0]!.id, CANDIDATES[0]!.id])).toBeNull();
    expect(validateRanking(["nao-existe"])).toBeNull();
  });

  it("lists 13 candidates", () => {
    expect(CANDIDATES).toHaveLength(13);
  });
});
