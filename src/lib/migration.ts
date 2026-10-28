import { CANDIDATE_BY_ID } from "./candidates";
import { isCandidateId, labelForOfficialVote } from "./official-vote";

export type MigrationBallot = {
  ranking: string[];
  source: string | null;
};

export type DestinationCount = {
  candidateId: string;
  count: number;
};

export type MigrationGroup = {
  sourceId: string;
  total: number;
  /** Ballots whose ranked 1st choice is the same candidate. Null for branco, nulo, and não votei. */
  stayed: number | null;
  destinations: DestinationCount[];
};

export type MigrationReport = {
  answered: number;
  omitted: number;
  groups: MigrationGroup[];
};

function compareDestinations(a: DestinationCount, b: DestinationCount): number {
  if (b.count !== a.count) return b.count - a.count;
  const numberA = CANDIDATE_BY_ID[a.candidateId]?.numero ?? Number.MAX_SAFE_INTEGER;
  const numberB = CANDIDATE_BY_ID[b.candidateId]?.numero ?? Number.MAX_SAFE_INTEGER;
  return numberA - numberB;
}

/**
 * Groups anonymous ballots by the voter's declared official-election choice
 * and counts where the ranked ballot put its first preference.
 * Skipped optional answers are omitted from the groups.
 */
export function buildMigration(ballots: MigrationBallot[]): MigrationReport {
  const bySource = new Map<string, { total: number; stayed: number; dest: Map<string, number> }>();
  let omitted = 0;

  for (const ballot of ballots) {
    const source = ballot.source;
    if (!source) {
      omitted += 1;
      continue;
    }
    const first = ballot.ranking[0];
    if (!first) {
      omitted += 1;
      continue;
    }

    const group = bySource.get(source) ?? {
      total: 0,
      stayed: 0,
      dest: new Map<string, number>(),
    };
    group.total += 1;
    if (first === source) group.stayed += 1;
    group.dest.set(first, (group.dest.get(first) ?? 0) + 1);
    bySource.set(source, group);
  }

  const groups: MigrationGroup[] = [...bySource.entries()]
    .map(([sourceId, group]) => ({
      sourceId,
      total: group.total,
      stayed: isCandidateId(sourceId) ? group.stayed : null,
      destinations: [...group.dest.entries()]
        .map(([candidateId, count]) => ({ candidateId, count }))
        .sort(compareDestinations),
    }))
    .sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      return labelForOfficialVote(a.sourceId).localeCompare(
        labelForOfficialVote(b.sourceId),
        "pt-BR",
      );
    });

  const answered = groups.reduce((sum, group) => sum + group.total, 0);
  return { answered, omitted, groups };
}
