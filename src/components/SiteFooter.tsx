export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800">
      <p>
        Enquete cívica não oficial · não é a urna do TSE · voto anônimo e
        desvinculado do e-mail
      </p>
      <p className="mt-2">
        <a
          href="https://github.com/LordMendes/brazillian-ranked-vote-2026"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-emerald-700 underline hover:text-emerald-600 dark:text-emerald-400"
        >
          Código-fonte no GitHub
        </a>
      </p>
    </footer>
  );
}
