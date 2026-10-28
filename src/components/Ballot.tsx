"use client";

import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import type { Candidate } from "@/lib/candidates";
import { CandidateMark } from "@/components/CandidateMark";
import { firstRoundOptions, secondRoundOptions } from "@/lib/official-vote";
import { useRouter } from "next/navigation";

type Props = {
  candidates: Candidate[];
};

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed!);
  return result;
}

export function Ballot({ candidates }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [available, setAvailable] = useState<Candidate[]>(candidates);
  const [ranked, setRanked] = useState<Candidate[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [votoPrimeiroTurno, setVotoPrimeiroTurno] = useState("");
  const [votoSegundoTurno, setVotoSegundoTurno] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  function onDragEnd(result: DropResult) {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === "available") {
        setAvailable(reorder(available, source.index, destination.index));
      } else {
        setRanked(reorder(ranked, source.index, destination.index));
      }
      return;
    }

    if (source.droppableId === "available" && destination.droppableId === "ranked") {
      const nextAvailable = [...available];
      const [moved] = nextAvailable.splice(source.index, 1);
      const nextRanked = [...ranked];
      nextRanked.splice(destination.index, 0, moved!);
      setAvailable(nextAvailable);
      setRanked(nextRanked);
      return;
    }

    if (source.droppableId === "ranked" && destination.droppableId === "available") {
      const nextRanked = [...ranked];
      const [moved] = nextRanked.splice(source.index, 1);
      const nextAvailable = [...available];
      nextAvailable.splice(destination.index, 0, moved!);
      setRanked(nextRanked);
      setAvailable(nextAvailable);
    }
  }

  function moveUp(index: number) {
    if (index <= 0) return;
    setRanked(reorder(ranked, index, index - 1));
  }

  function moveDown(index: number) {
    if (index >= ranked.length - 1) return;
    setRanked(reorder(ranked, index, index + 1));
  }

  function addToRanked(id: string) {
    const item = available.find((c) => c.id === id);
    if (!item) return;
    setAvailable(available.filter((c) => c.id !== id));
    setRanked([...ranked, item]);
  }

  function removeFromRanked(id: string) {
    const item = ranked.find((c) => c.id === id);
    if (!item) return;
    setRanked(ranked.filter((c) => c.id !== id));
    setAvailable(
      [...available, item].sort((a, b) => a.nomeUrna.localeCompare(b.nomeUrna, "pt-BR")),
    );
  }

  async function submit() {
    if (ranked.length < 1) {
      setError("Inclua ao menos um candidato na sua ordem.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/voto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ranking: ranked.map((c) => c.id),
          votoPrimeiroTurno: votoPrimeiroTurno || null,
          votoSegundoTurno: votoSegundoTurno || null,
        }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Não foi possível registrar o voto.");
        return;
      }
      router.push("/obrigado");
    } catch {
      setStatus("error");
      setError("Falha de rede. Tente novamente.");
    }
  }

  if (!mounted) {
    return (
      <div className="mx-auto w-full max-w-3xl py-12 text-center text-sm text-zinc-500">
        Carregando urna…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Arraste candidatos para <strong>Sua ordem</strong> (1º = preferência
        máxima). Quem ficar de fora não entra no seu voto. Use as setas no
        celular.
      </p>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-4 md:grid-cols-2">
          <ListColumn
            droppableId="available"
            title="Candidatos"
            items={available}
            empty="Todos estão na sua ordem."
            onPrimaryAction={addToRanked}
            primaryLabel="Incluir"
          />
          <ListColumn
            droppableId="ranked"
            title="Sua ordem"
            items={ranked}
            showRank
            empty="Arraste ou inclua ao menos um candidato."
            onPrimaryAction={removeFromRanked}
            primaryLabel="Remover"
            onMoveUp={moveUp}
            onMoveDown={moveDown}
          />
        </div>
      </DragDropContext>

      <fieldset className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <legend className="px-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Voto na eleição oficial{" "}
          <span className="font-normal text-zinc-500">(opcional)</span>
        </legend>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Informe em quem você votou no 1º e no 2º turno do TSE, se quiser.
          Isso não muda a sua ordem nem a apuração ranqueada. O resultado
          agregado usa a resposta para ver para onde foram os votos de cada
          candidatura nesta enquete. Pode deixar em branco.
        </p>
        <OfficialSelect
          id="voto-primeiro-turno"
          label="1º turno oficial"
          hint="Os 13 candidatos do 1º turno, ou branco, nulo e não votei."
          value={votoPrimeiroTurno}
          onChange={setVotoPrimeiroTurno}
          options={firstRoundOptions()}
          disabled={status === "loading"}
        />
        <OfficialSelect
          id="voto-segundo-turno"
          label="2º turno oficial"
          hint="O 2º turno oficial foi entre Lula (13) e Flávio Bolsonaro (22)."
          value={votoSegundoTurno}
          onChange={setVotoSegundoTurno}
          options={secondRoundOptions()}
          disabled={status === "loading"}
        />
      </fieldset>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={status === "loading" || ranked.length < 1}
        className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Enviando voto…" : "Confirmar voto ranqueado"}
      </button>
    </div>
  );
}

function OfficialSelect({
  id,
  label,
  hint,
  value,
  onChange,
  options,
  disabled,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
  disabled: boolean;
}) {
  return (
    <label htmlFor={id} className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
      {label}
      <span className="mt-1 block text-xs font-normal text-zinc-500">{hint}</span>
      <select
        id={id}
        value={value}
        disabled={disabled}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-emerald-500 focus:ring-2 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
      >
        <option value="">Não quero responder</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ListColumn({
  droppableId,
  title,
  items,
  empty,
  showRank,
  onPrimaryAction,
  primaryLabel,
  onMoveUp,
  onMoveDown,
}: {
  droppableId: string;
  title: string;
  items: Candidate[];
  empty: string;
  showRank?: boolean;
  onPrimaryAction: (id: string) => void;
  primaryLabel: string;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
}) {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="mb-3 shrink-0 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h2>
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <ul
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex min-h-40 flex-1 flex-col gap-2 rounded-xl p-1 transition ${
              snapshot.isDraggingOver ? "bg-emerald-50 dark:bg-emerald-950/40" : ""
            }`}
          >
            {items.length === 0 && (
              <li className="px-2 py-6 text-center text-sm text-zinc-400">{empty}</li>
            )}
            {items.map((c, index) => (
              <Draggable key={c.id} draggableId={c.id} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <li
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    className={`flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 ${
                      dragSnapshot.isDragging ? "shadow-lg ring-2 ring-emerald-400" : ""
                    }`}
                  >
                    {showRank && (
                      <span className="w-6 shrink-0 text-center text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        {index + 1}
                      </span>
                    )}
                    <CandidateMark candidate={c} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-50">
                        {c.nomeUrna}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {c.numero} · {c.partido}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      {onMoveUp && (
                        <button
                          type="button"
                          aria-label="Subir"
                          onClick={() => onMoveUp(index)}
                          className="rounded bg-zinc-200 px-1.5 text-xs dark:bg-zinc-700"
                        >
                          ▲
                        </button>
                      )}
                      {onMoveDown && (
                        <button
                          type="button"
                          aria-label="Descer"
                          onClick={() => onMoveDown(index)}
                          className="rounded bg-zinc-200 px-1.5 text-xs dark:bg-zinc-700"
                        >
                          ▼
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onPrimaryAction(c.id)}
                        className="rounded bg-zinc-200 px-1.5 text-[10px] font-semibold dark:bg-zinc-700"
                      >
                        {primaryLabel}
                      </button>
                    </div>
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </section>
  );
}
