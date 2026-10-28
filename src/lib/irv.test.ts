import { describe, expect, it } from "vitest";
import { runIrv } from "./irv";

describe("runIrv", () => {
  it("elects a majority winner in round 1", () => {
    const result = runIrv([
      ["lula", "zema"],
      ["lula", "ronaldo-caiado"],
      ["flavio-bolsonaro", "lula"],
    ]);
    expect(result.winnerId).toBe("lula");
    expect(result.rounds).toHaveLength(1);
    expect(result.rounds[0]!.eliminated).toBeNull();
  });

  it("transfers votes after elimination", () => {
    const result = runIrv([
      ["lula", "zema"],
      ["lula", "zema"],
      ["flavio-bolsonaro", "lula"],
      ["flavio-bolsonaro", "lula"],
      ["zema", "lula"],
    ]);
    // Round 1: Lula 2, Flavio 2, Zema 1 → eliminate Zema → Lula gets transfer → 3
    expect(result.rounds.length).toBeGreaterThan(1);
    expect(result.rounds[0]!.eliminated).toBe("zema");
    expect(result.winnerId).toBe("lula");
  });

  it("handles exhausted ballots leaving the denominator", () => {
    const result = runIrv([
      ["lula"],
      ["lula"],
      ["flavio-bolsonaro"],
      ["zema"], // exhausted once Zema is out if no further prefs — alone last
    ]);
    expect(result.totalBallots).toBe(4);
    expect(result.winnerId).toBeTruthy();
  });

  it("breaks elimination ties by first preferences then higher ballot number", () => {
    // Equal round votes for zema (30) and samara (80); same first prefs (1 each).
    // Higher number (samara 80) is eliminated first.
    const result = runIrv([
      ["lula", "zema"],
      ["lula", "samara"],
      ["flavio-bolsonaro", "lula"],
      ["zema", "lula"],
      ["samara", "flavio-bolsonaro"],
    ]);
    const firstElimination = result.rounds.find((r) => r.eliminated)?.eliminated;
    expect(firstElimination).toBe("samara");
  });

  it("returns null winner for empty input", () => {
    expect(runIrv([]).winnerId).toBeNull();
  });
});
