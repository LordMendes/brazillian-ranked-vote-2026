import Link from "next/link";
import { RecheckBrazilAccess } from "@/components/RecheckBrazilAccess";

export default function BloqueadoPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 text-center">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Acesso restrito ao Brasil
      </h1>
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        A participação nesta enquete só é permitida a partir de conexões no
        Brasil. O país é verificado no seu navegador e o IP não é armazenado. O
        resultado agregado permanece público.
      </p>
      <RecheckBrazilAccess />
      <Link
        href="/resultado"
        className="inline-block rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
      >
        Ver resultado
      </Link>
    </div>
  );
}
