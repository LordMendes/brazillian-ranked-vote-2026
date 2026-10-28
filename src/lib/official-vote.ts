import { CANDIDATE_BY_ID, CANDIDATES, type Candidate } from "./candidates";

/** Answers that are not a candidate name. Stored on the anonymous ballot. */
export const OFFICIAL_EXTRAS = [
  { id: "branco", label: "Branco" },
  { id: "nulo", label: "Nulo" },
  { id: "nao-votei", label: "Não votei" },
] as const;

/** Official runoff was Lula (13) × Flávio Bolsonaro (22). */
export const SECOND_ROUND_CANDIDATE_IDS = ["lula", "flavio-bolsonaro"] as const;

export type OfficialOption = { id: string; label: string };

export type ParsedOfficialVote =
  | { ok: true; value: string | null }
  | { ok: false };

function candidateOption(candidate: Candidate): OfficialOption {
  return {
    id: candidate.id,
    label: `${candidate.nomeUrna} (${candidate.numero})`,
  };
}

export function firstRoundOptions(): OfficialOption[] {
  return [
    ...CANDIDATES.map(candidateOption),
    ...OFFICIAL_EXTRAS,
  ];
}

export function secondRoundOptions(): OfficialOption[] {
  return [
    ...SECOND_ROUND_CANDIDATE_IDS.map((id) => candidateOption(CANDIDATE_BY_ID[id]!)),
    ...OFFICIAL_EXTRAS,
  ];
}

export const FIRST_ROUND_VOTE_IDS = new Set(firstRoundOptions().map((option) => option.id));
export const SECOND_ROUND_VOTE_IDS = new Set(secondRoundOptions().map((option) => option.id));

/**
 * Empty, null, or omitted means the voter skipped the optional question.
 * Any other value must be one of the allowed ids.
 */
export function parseOfficialVote(
  value: unknown,
  allowed: ReadonlySet<string>,
): ParsedOfficialVote {
  if (value === undefined || value === null) return { ok: true, value: null };
  if (typeof value !== "string") return { ok: false };
  const trimmed = value.trim();
  if (trimmed === "") return { ok: true, value: null };
  if (!allowed.has(trimmed)) return { ok: false };
  return { ok: true, value: trimmed };
}

export function labelForOfficialVote(id: string): string {
  const extra = OFFICIAL_EXTRAS.find((item) => item.id === id);
  if (extra) return extra.label;
  const candidate = CANDIDATE_BY_ID[id];
  if (candidate) return `${candidate.nomeUrna} (${candidate.numero})`;
  return id;
}

export function isCandidateId(id: string): boolean {
  return Boolean(CANDIDATE_BY_ID[id]);
}
