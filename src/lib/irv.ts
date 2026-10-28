import { CANDIDATE_BY_ID } from "./candidates";

export type Ballot = string[];

export type RoundStanding = {
  candidateId: string;
  votes: number;
};

export type IrvRound = {
  round: number;
  standings: RoundStanding[];
  eliminated: string | null;
  activeBallots: number;
  majorityThreshold: number;
};

export type IrvResult = {
  winnerId: string | null;
  rounds: IrvRound[];
  totalBallots: number;
  exhaustedFinal: number;
};

function firstPreference(ballot: Ballot, remaining: Set<string>): string | null {
  for (const id of ballot) {
    if (remaining.has(id)) return id;
  }
  return null;
}

function countVotes(
  ballots: Ballot[],
  remaining: Set<string>,
): { counts: Map<string, number>; active: number } {
  const counts = new Map<string, number>();
  for (const id of remaining) counts.set(id, 0);

  let active = 0;
  for (const ballot of ballots) {
    const choice = firstPreference(ballot, remaining);
    if (choice) {
      counts.set(choice, (counts.get(choice) ?? 0) + 1);
      active += 1;
    }
  }
  return { counts, active };
}

/**
 * Instant-runoff: eliminate last place until someone has a majority of
 * ballots still in play. Tie-break on elimination: fewer votes this round,
 * then fewer first preferences overall, then higher ballot number.
 */
export function runIrv(ballots: Ballot[]): IrvResult {
  const totalBallots = ballots.length;
  if (totalBallots === 0) {
    return { winnerId: null, rounds: [], totalBallots: 0, exhaustedFinal: 0 };
  }

  const firstPrefs = new Map<string, number>();
  for (const ballot of ballots) {
    const first = ballot[0];
    if (first) firstPrefs.set(first, (firstPrefs.get(first) ?? 0) + 1);
  }

  const remaining = new Set(
    [...new Set(ballots.flat())].filter((id) => CANDIDATE_BY_ID[id]),
  );
  if (remaining.size === 0) {
    return { winnerId: null, rounds: [], totalBallots, exhaustedFinal: totalBallots };
  }

  const rounds: IrvRound[] = [];
  let roundNum = 0;

  while (remaining.size > 0) {
    roundNum += 1;
    const { counts, active } = countVotes(ballots, remaining);
    const majorityThreshold = Math.floor(active / 2) + 1;

    const standings: RoundStanding[] = [...remaining]
      .map((candidateId) => ({
        candidateId,
        votes: counts.get(candidateId) ?? 0,
      }))
      .sort((a, b) => {
        if (b.votes !== a.votes) return b.votes - a.votes;
        return (
          (CANDIDATE_BY_ID[a.candidateId]?.numero ?? 0) -
          (CANDIDATE_BY_ID[b.candidateId]?.numero ?? 0)
        );
      });

    const leader = standings[0];
    if (leader && leader.votes >= majorityThreshold && active > 0) {
      rounds.push({
        round: roundNum,
        standings,
        eliminated: null,
        activeBallots: active,
        majorityThreshold,
      });
      return {
        winnerId: leader.candidateId,
        rounds,
        totalBallots,
        exhaustedFinal: totalBallots - active,
      };
    }

    if (remaining.size === 1) {
      rounds.push({
        round: roundNum,
        standings,
        eliminated: null,
        activeBallots: active,
        majorityThreshold,
      });
      return {
        winnerId: standings[0]?.candidateId ?? null,
        rounds,
        totalBallots,
        exhaustedFinal: totalBallots - active,
      };
    }

    // Eliminate last place with tie-breakers
    const sortedForElimination = [...standings].sort((a, b) => {
      if (a.votes !== b.votes) return a.votes - b.votes;
      const fa = firstPrefs.get(a.candidateId) ?? 0;
      const fb = firstPrefs.get(b.candidateId) ?? 0;
      if (fa !== fb) return fa - fb;
      const na = CANDIDATE_BY_ID[a.candidateId]?.numero ?? 0;
      const nb = CANDIDATE_BY_ID[b.candidateId]?.numero ?? 0;
      return nb - na; // higher ballot number eliminated first
    });

    const eliminated = sortedForElimination[0]!.candidateId;
    rounds.push({
      round: roundNum,
      standings,
      eliminated,
      activeBallots: active,
      majorityThreshold,
    });
    remaining.delete(eliminated);
  }

  return {
    winnerId: null,
    rounds,
    totalBallots,
    exhaustedFinal: totalBallots,
  };
}
