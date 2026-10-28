import { db } from "@/lib/db";
import { CANDIDATE_BY_ID } from "@/lib/candidates";
import { CandidateMark } from "@/components/CandidateMark";
import { MigrationReport } from "@/components/MigrationReport";
import { runIrv, type Ballot } from "@/lib/irv";

export const dynamic = "force-dynamic";

export default async function ResultadoPage() {
  const votes = await db.orm.public.VotoComputado.select(
    "ranking",
    "votoPrimeiroTurno",
    "votoSegundoTurno",
  ).all();

  const rows = votes.flatMap((vote) => {
    const ranking = vote.ranking;
    if (!Array.isArray(ranking) || !ranking.every((item) => typeof item === "string")) {
      return [];
    }
    return [
      {
        ranking,
        votoPrimeiroTurno: vote.votoPrimeiroTurno,
        votoSegundoTurno: vote.votoSegundoTurno,
      },
    ];
  });

  const ballots: Ballot[] = rows.map((row) => row.ranking);

  const result = runIrv(ballots);
  const winner = result.winnerId ? CANDIDATE_BY_ID[result.winnerId] : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Resultado agregado
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Contagem por segundo turno instantâneo (IRV). Apenas totais — nenhum
          voto individual é exibido. Enquete não oficial.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500">Total de cédulas</p>
        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          {result.totalBallots}
        </p>
        {winner ? (
          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <CandidateMark candidate={winner} size="sm" />
            <span>
              Vencedor IRV:{" "}
              <strong>
                {winner.nomeUrna} ({winner.numero})
              </strong>
            </span>
          </p>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">
            Ainda não há votos suficientes para declarar um vencedor.
          </p>
        )}
      </div>

      <MigrationReport rows={rows} />

      {result.rounds.length > 0 && (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Apuração por rodadas
        </h2>
        {result.rounds.map((round) => (
          <section
            key={round.round}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                Rodada {round.round}
              </h3>
              <p className="text-xs text-zinc-500">
                Cédulas ativas: {round.activeBallots} · maioria:{" "}
                {round.majorityThreshold}
              </p>
            </div>
            <ol className="space-y-2">
              {round.standings.map((s) => {
                const c = CANDIDATE_BY_ID[s.candidateId];
                const pct =
                  round.activeBallots > 0
                    ? ((s.votes / round.activeBallots) * 100).toFixed(1)
                    : "0.0";
                return (
                  <li key={s.candidateId} className="text-sm">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2 font-medium text-zinc-800 dark:text-zinc-100">
                        {c && <CandidateMark candidate={c} size="sm" />}
                        <span className="truncate">
                          {c?.nomeUrna ?? s.candidateId}{" "}
                          <span className="font-normal text-zinc-500">
                            ({c?.numero})
                          </span>
                        </span>
                      </span>
                      <span className="tabular-nums text-zinc-600 dark:text-zinc-400">
                        {s.votes} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
            {round.eliminated && (
              <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
                Eliminado: {CANDIDATE_BY_ID[round.eliminated]?.nomeUrna ?? round.eliminated}
              </p>
            )}
          </section>
        ))}
      </div>
      )}
    </div>
  );
}
