import Link from "next/link";

export default function ObrigadoPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 text-center">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Voto registrado
      </h1>
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Sua ordem de preferências foi salva de forma anônima e desvinculada do
        e-mail. Se você informou o voto oficial do 1º ou do 2º turno, ele foi
        gravado na mesma cédula anônima, só para os totais de migração. Obrigado
        por participar desta enquete cívica não oficial.
      </p>
      <Link
        href="/resultado"
        className="inline-block rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
      >
        Ver resultado agregado
      </Link>
    </div>
  );
}
