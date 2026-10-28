import { buildMigration, type MigrationBallot, type MigrationGroup } from "@/lib/migration";
import { labelForOfficialVote } from "@/lib/official-vote";

type Row = {
  ranking: string[];
  votoPrimeiroTurno: string | null;
  votoSegundoTurno: string | null;
};

function percent(count: number, total: number): string {
  if (total <= 0) return "0.0";
  return ((count / total) * 100).toFixed(1);
}

export function MigrationReport({ rows }: { rows: Row[] }) {
  const firstRound = buildMigration(
    rows.map(
      (row): MigrationBallot => ({
        ranking: row.ranking,
        source: row.votoPrimeiroTurno,
      }),
    ),
  );
  const secondRound = buildMigration(
    rows.map(
      (row): MigrationBallot => ({
        ranking: row.ranking,
        source: row.votoSegundoTurno,
      }),
    ),
  );
  const total = rows.length;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Para onde foram os votos oficiais
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Cruza o voto declarado na eleição do TSE com a 1ª preferência desta
          enquete ranqueada. É a leitura de migração: em quem a pessoa votou no
          turno oficial e para quem esse voto foi quando ela pôde ordenar o
          campo inteiro. O campo é opcional, autodeclarado e não altera o
          vencedor acima. Só entram totais.
        </p>
      </div>

      <RoundMigration
        title="A partir do 1º turno oficial"
        answered={firstRound.answered}
        total={total}
        groups={firstRound.groups}
        empty="Nenhuma cédula informou o voto do 1º turno oficial."
      />
      <RoundMigration
        title="A partir do 2º turno oficial"
        answered={secondRound.answered}
        total={total}
        groups={secondRound.groups}
        empty="Nenhuma cédula informou o voto do 2º turno oficial."
      />
    </section>
  );
}

function RoundMigration({
  title,
  answered,
  total,
  groups,
  empty,
}: {
  title: string;
  answered: number;
  total: number;
  groups: MigrationGroup[];
  empty: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
        <p className="text-xs text-zinc-500">
          {answered} de {total} cédulas informaram este turno.
        </p>
      </div>
      {groups.length === 0 ? (
        <p className="rounded-2xl border border-zinc-200 bg-white px-4 py-5 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
          {empty}
        </p>
      ) : (
        groups.map((group) => <GroupCard key={group.sourceId} group={group} />)
      )}
    </div>
  );
}

function GroupCard({ group }: { group: MigrationGroup }) {
  const top = group.destinations[0];

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">
          {labelForOfficialVote(group.sourceId)}
        </h4>
        <p className="text-xs text-zinc-500">
          {group.total} {group.total === 1 ? "cédula" : "cédulas"}
        </p>
      </div>
      {top && (
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          Principal destino na enquete:{" "}
          <strong>{labelForOfficialVote(top.candidateId)}</strong> ({top.count} ·{" "}
          {percent(top.count, group.total)}%)
        </p>
      )}
      {group.stayed !== null && (
        <p className="mt-1 text-xs text-zinc-500">
          {group.stayed} de {group.total} ({percent(group.stayed, group.total)}%)
          mantiveram esta candidatura como 1ª preferência.
        </p>
      )}
      <ul className="mt-4 space-y-2">
        {group.destinations.map((destination) => {
          const width = percent(destination.count, group.total);
          return (
            <li key={destination.candidateId} className="text-sm">
              <div className="mb-1 flex justify-between gap-2">
                <span className="font-medium text-zinc-800 dark:text-zinc-100">
                  {labelForOfficialVote(destination.candidateId)}
                </span>
                <span className="tabular-nums text-zinc-600 dark:text-zinc-400">
                  {destination.count} ({width}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
