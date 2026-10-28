import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="font-semibold text-zinc-900 dark:text-zinc-50">
          Enquete ranqueada 2026
        </Link>
        <nav className="flex flex-wrap justify-end gap-x-4 gap-y-1 text-sm">
          <Link
            href="/#como-funciona"
            className="text-zinc-600 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-400"
          >
            Como funciona
          </Link>
          <Link
            href="/#participar"
            className="text-zinc-600 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-400"
          >
            Participar
          </Link>
          <Link
            href="/resultado"
            className="text-zinc-600 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-400"
          >
            Resultado
          </Link>
        </nav>
      </div>
    </header>
  );
}
