export type Candidate = {
  id: string;
  nomeUrna: string;
  numero: number;
  partido: string;
  sigla: string;
  foto: string;
  logo: string;
};

/** Official TSE first-round presidential field, alphabetical by nome de urna. */
export const CANDIDATES: Candidate[] = [
  { id: "clariana-barao", nomeUrna: "Clariana Barão", numero: 27, partido: "DC", sigla: "DC", foto: "/candidatos/clariana-barao.jpg", logo: "/partidos/dc.svg" },
  { id: "edmilson-costa", nomeUrna: "Edmilson Costa", numero: 21, partido: "PCB", sigla: "PCB", foto: "/candidatos/edmilson-costa.jpg", logo: "/partidos/pcb.svg" },
  { id: "augusto-cury", nomeUrna: "Escritor Augusto Cury", numero: 70, partido: "Avante", sigla: "Avante", foto: "/candidatos/augusto-cury.jpg", logo: "/partidos/avante.svg" },
  { id: "flavio-bolsonaro", nomeUrna: "Flávio Bolsonaro", numero: 22, partido: "PL", sigla: "PL", foto: "/candidatos/flavio-bolsonaro.jpg", logo: "/partidos/pl.svg" },
  { id: "hertz-dias", nomeUrna: "Hertz Dias", numero: 16, partido: "PSTU", sigla: "PSTU", foto: "/candidatos/hertz-dias.jpg", logo: "/partidos/pstu.png" },
  { id: "leonardo-avalanche", nomeUrna: "Leonardo Avalanche", numero: 28, partido: "PRTB", sigla: "PRTB", foto: "/candidatos/leonardo-avalanche.jpg", logo: "/partidos/prtb.png" },
  { id: "lula", nomeUrna: "Lula", numero: 13, partido: "PT / Brasil Pronto pra Mais", sigla: "PT", foto: "/candidatos/lula.jpg", logo: "/partidos/pt.svg" },
  { id: "renan-santos", nomeUrna: "Renan Santos", numero: 14, partido: "Missão", sigla: "Missão", foto: "/candidatos/renan-santos.jpg", logo: "/partidos/missao.svg" },
  { id: "ronaldo-caiado", nomeUrna: "Ronaldo Caiado", numero: 55, partido: "PSD", sigla: "PSD", foto: "/candidatos/ronaldo-caiado.jpg", logo: "/partidos/psd.svg" },
  { id: "rui-costa-pimenta", nomeUrna: "Rui Costa Pimenta", numero: 29, partido: "PCO", sigla: "PCO", foto: "/candidatos/rui-costa-pimenta.jpg", logo: "/partidos/pco.svg" },
  { id: "samara", nomeUrna: "Samara", numero: 80, partido: "UP", sigla: "UP", foto: "/candidatos/samara.jpg", logo: "/partidos/up.svg" },
  { id: "wilson-grassi", nomeUrna: "Veterinário Wilson Grassi", numero: 35, partido: "Democrata", sigla: "Democrata", foto: "/candidatos/wilson-grassi.jpg", logo: "/partidos/democrata.png" },
  { id: "zema", nomeUrna: "Zema", numero: 30, partido: "Novo", sigla: "Novo", foto: "/candidatos/zema.jpg", logo: "/partidos/novo.svg" },
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
