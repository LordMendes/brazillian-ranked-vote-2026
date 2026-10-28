import { describe, expect, it } from "vitest";
import { buildMigration } from "./migration";

describe("buildMigration", () => {
  it("counts ranked first preferences for each official vote and skips blanks", () => {
    const report = buildMigration([
      { ranking: ["zema", "lula"], source: "lula" },
      { ranking: ["lula", "zema"], source: "lula" },
      { ranking: ["flavio-bolsonaro"], source: "branco" },
      { ranking: ["lula"], source: null },
    ]);

    expect(report.answered).toBe(3);
    expect(report.omitted).toBe(1);
    expect(report.groups.map((group) => group.sourceId)).toEqual(["lula", "branco"]);

    const lula = report.groups[0]!;
    expect(lula.total).toBe(2);
    expect(lula.stayed).toBe(1);
    expect(lula.destinations.map((item) => item.candidateId)).toEqual(["lula", "zema"]);

    const branco = report.groups[1]!;
    expect(branco.stayed).toBeNull();
    expect(branco.destinations).toEqual([
      { candidateId: "flavio-bolsonaro", count: 1 },
    ]);
  });

  it("breaks destination ties by ballot number", () => {
    const report = buildMigration([
      { ranking: ["zema"], source: "nulo" },
      { ranking: ["lula"], source: "nulo" },
    ]);
    expect(report.groups[0]!.destinations.map((item) => item.candidateId)).toEqual([
      "lula",
      "zema",
    ]);
  });
});
