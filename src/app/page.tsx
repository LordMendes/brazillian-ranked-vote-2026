import type { Metadata } from "next";
import { HomeClient } from "@/components/HomeClient";
import { Landing } from "@/components/Landing";
import { requireBrazilPage } from "@/lib/guards";
import { isVotingOpen } from "@/lib/geo";

export const metadata: Metadata = {
  title: "Voto ranqueado — Presidência 2026",
  description:
    "Enquete cívica não oficial. Ordene os candidatos do 1º turno; a apuração é por segundo turno instantâneo (IRV). O voto oficial é opcional e serve para ver a migração.",
};

type Search = Promise<{ erro?: string; encerrada?: string }>;

function bannerFromParams(params: { erro?: string; encerrada?: string }): string | null {
  if (params.encerrada === "1") {
    return "A votação desta enquete está encerrada.";
  }
  switch (params.erro) {
    case "ja_participou":
      return "Este e-mail já registrou participação.";
    case "expirado":
      return "Este link expirou ou já foi usado. Solicite um novo.";
    case "link":
      return "Link inválido. Solicite um novo acesso.";
    default:
      return null;
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Search;
}) {
  await requireBrazilPage();
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-3xl space-y-16">
      <Landing />

      <section id="participar" className="scroll-mt-8 space-y-4">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Participar da enquete
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Uma participação por e-mail. O link de acesso vale 15 minutos e só
            pode ser usado uma vez.
          </p>
        </div>
        <HomeClient banner={bannerFromParams(params)} votingOpen={isVotingOpen()} />
      </section>
    </div>
  );
}
