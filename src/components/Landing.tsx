import Link from "next/link";

const STEPS = [
  {
    title: "Cada cédula começa no 1º da ordem",
    text: "O voto conta para a pessoa que você colocou em primeiro, desde que ela ainda esteja na disputa.",
  },
  {
    title: "Maioria encerra a conta",
    text: "Se alguém passa de metade das cédulas ainda ativas, essa pessoa vence. Metade mais um, não apenas o primeiro lugar.",
  },
  {
    title: "Sem maioria, o último sai",
    text: "O candidato com menos votos na rodada é eliminado. A eleição não para para um segundo turno separado.",
  },
  {
    title: "O voto desce na sua lista",
    text: "A cédula de quem foi eliminado passa para a próxima preferência que ainda disputa. Quem você deixou de fora nunca recebe esse voto.",
  },
  {
    title: "Repete até haver um vencedor",
    text: "Se a sua lista acaba antes do fim, a cédula se esgota e deixa de entrar no cálculo da maioria.",
  },
];

export function Landing() {
  return (
    <div className="space-y-16">
      <section className="space-y-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          Enquete cívica não oficial
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Voto ranqueado para a Presidência 2026
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          Em vez de marcar um só nome, você ordena os candidatos do 1º turno.
          A apuração faz os turnos seguintes na hora: o voto acompanha a sua
          lista até alguém ter maioria. O método é o segundo turno instantâneo
          (IRV).
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/#participar"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Participar da enquete
          </Link>
          <Link
            href="/#como-funciona"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:border-emerald-600 hover:text-emerald-700 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
          >
            Ver como a conta funciona
          </Link>
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Como funciona
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            No voto único, marcar um candidato que não vai adiante encerra o
            efeito desse voto. No voto ranqueado, a ordem guarda as preferências
            seguintes. Você não precisa ordenar os 13 nomes: entra na cédula só
            quem você incluir.
          </p>
        </div>
        <ol className="space-y-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                {index + 1}
              </span>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Um exemplo, com nomes inventados
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Cem cédulas, três candidatos. Os números abaixo não são desta
            enquete. Servem só para mostrar a transferência.
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-3">
          <ExampleBallot order={["Ana", "Bruno"]} count={42} />
          <ExampleBallot order={["Bruno", "Carla"]} count={28} />
          <ExampleBallot order={["Carla", "Bruno"]} count={30} />
        </ul>

        <div className="space-y-4">
          <ExampleRound
            title="Rodada 1"
            note="100 cédulas ativas. A maioria é 51. Ninguém chega. Bruno, o último, sai."
            rows={[
              { name: "Ana", votes: "42", width: "42%" },
              { name: "Carla", votes: "30", width: "30%" },
              { name: "Bruno", votes: "28", width: "28%", eliminated: true },
            ]}
          />
          <ExampleRound
            title="Rodada 2"
            note="As 28 cédulas de Bruno tinham Carla em seguida. Elas passam para ela."
            rows={[
              { name: "Carla", votes: "58", width: "58%", winner: true },
              { name: "Ana", votes: "42", width: "42%" },
            ]}
          />
        </div>

        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100">
          No voto único, Ana venceria com 42%, sem maioria. No ranqueado, a
          segunda preferência de quem colocou Bruno em primeiro decide: Carla
          chega a 58% e ultrapassa a maioria.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          O que esta enquete compara
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          <p>
            O 1º turno oficial do TSE já ocorreu, com 13 candidaturas. O 2º
            turno oficial foi entre Lula (13) e Flávio Bolsonaro (22). Quem não
            votou em um desses dois precisou escolher de novo — ou o voto do 1º
            turno não seguiu para a decisão final.
          </p>
          <p>
            Aqui o campo é o mesmo do 1º turno, mas uma única ordem substitui
            os turnos. A apuração elimina e transfere até haver maioria. Não é
            a urna do TSE e não revota a eleição oficial.
          </p>
          <p>
            Na cédula há dois campos opcionais: em quem você votou no 1º turno
            oficial e em quem votou no 2º. Eles não mudam a sua ordem nem o
            vencedor ranqueado. No resultado agregado, cruzamos essa resposta
            com a 1ª preferência da enquete para ver para onde foram os votos
            de cada candidatura quando o eleitor pode ordenar o campo inteiro.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Sigilo
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          O e-mail só confirma que cada endereço participa uma vez. O texto do
          e-mail não fica na cédula. O ranking e, se você preencher, o voto
          oficial do 1º e do 2º turno são gravados sem esse vínculo. O
          resultado público mostra apenas totais.
        </p>
        <p className="text-sm">
          <Link
            href="/resultado"
            className="font-semibold text-emerald-700 underline dark:text-emerald-400"
          >
            Ver o resultado agregado
          </Link>
        </p>
      </section>
    </div>
  );
}

function ExampleBallot({ order, count }: { order: string[]; count: number }) {
  return (
    <li className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {count} cédulas
      </p>
      <ol className="mt-2 space-y-1">
        {order.map((name, index) => (
          <li key={name} className="text-sm text-zinc-800 dark:text-zinc-100">
            <span className="mr-2 font-bold text-emerald-700 dark:text-emerald-400">
              {index + 1}º
            </span>
            {name}
          </li>
        ))}
      </ol>
    </li>
  );
}

function ExampleRound({
  title,
  note,
  rows,
}: {
  title: string;
  note: string;
  rows: { name: string; votes: string; width: string; eliminated?: boolean; winner?: boolean }[];
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">{note}</p>
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li key={row.name}>
            <div className="mb-1 flex justify-between gap-2 text-sm">
              <span className="font-medium text-zinc-800 dark:text-zinc-100">
                {row.name}
                {row.eliminated ? " · eliminado" : ""}
                {row.winner ? " · maioria" : ""}
              </span>
              <span className="tabular-nums text-zinc-600 dark:text-zinc-400">
                {row.votes}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full ${
                  row.eliminated ? "bg-zinc-400 dark:bg-zinc-500" : "bg-emerald-500"
                }`}
                style={{ width: row.width }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
