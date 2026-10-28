export type Candidate = {
  id: string;
  nomeUrna: string;
  numero: number;
  partido: string;
};

/** Official TSE first-round presidential field, alphabetical by nome de urna. */
export const CANDIDATES: Candidate[] = [
  { id: "clariana-barao", nomeUrna: "Clariana Barão", numero: 27, partido: "DC" },
  { id: "edmilson-costa", nomeUrna: "Edmilson Costa", numero: 21, partido: "PCB" },
  { id: "augusto-cury", nomeUrna: "Escritor Augusto Cury", numero: 70, partido: "Avante" },
  { id: "flavio-bolsonaro", nomeUrna: "Flávio Bolsonaro", numero: 22, partido: "PL" },
  { id: "hertz-dias", nomeUrna: "Hertz Dias", numero: 16, partido: "PSTU" },
  { id: "leonardo-avalanche", nomeUrna: "Leonardo Avalanche", numero: 28, partido: "PRTB" },
  { id: "lula", nomeUrna: "Lula", numero: 13, partido: "PT / Brasil Pronto pra Mais" },
  { id: "renan-santos", nomeUrna: "Renan Santos", numero: 14, partido: "Missão" },
  { id: "ronaldo-caiado", nomeUrna: "Ronaldo Caiado", numero: 55, partido: "PSD" },
  { id: "rui-costa-pimenta", nomeUrna: "Rui Costa Pimenta", numero: 29, partido: "PCO" },
  { id: "samara", nomeUrna: "Samara", numero: 80, partido: "UP" },
  { id: "wilson-grassi", nomeUrna: "Veterinário Wilson Grassi", numero: 35, partido: "Democrata" },
  { id: "zema", nomeUrna: "Zema", numero: 30, partido: "Novo" },
];

export const CANDIDATE_BY_ID = Object.fromEntries(
  CANDIDATES.map((c) => [c.id, c]),
) as Record<string, Candidate>;

export const CANDIDATE_IDS = new Set(CANDIDATES.map((c) => c.id));

export function validateRanking(ranking: unknown): string[] | null {
  if (!Array.isArray(ranking) || ranking.length === 0) return null;
  if (ranking.length > CANDIDATES.length) return null;

  const seen = new Set<string>();
  for (const id of ranking) {
    if (typeof id !== "string" || !CANDIDATE_IDS.has(id) || seen.has(id)) {
      return null;
    }
    seen.add(id);
  }
  return ranking as string[];
}
