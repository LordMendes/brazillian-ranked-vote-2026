import Link from "next/link";
import { redirect } from "next/navigation";
import { Ballot } from "@/components/Ballot";
import { CANDIDATES } from "@/lib/candidates";
import { requireBrazilPage } from "@/lib/guards";
import { hasConsent } from "@/lib/consent";
import { isVotingOpen } from "@/lib/geo";
import { getVoteSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { hashEmail } from "@/lib/crypto";

export default async function VotarPage() {
  await requireBrazilPage();

  if (!(await hasConsent())) {
    redirect("/");
  }

  if (!isVotingOpen()) {
    redirect("/?encerrada=1");
  }

  const session = await getVoteSession();
  if (!session.email) {
    redirect("/?erro=link");
  }

  const already = await prisma.participanteVerificado.findUnique({
    where: { emailHash: hashEmail(session.email) },
    select: { id: true },
  });
  if (already) {
    session.destroy();
    await session.save();
    redirect("/?erro=ja_participou");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Monte sua ordem de preferência
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Enquete não oficial · seu e-mail não será ligado ao ranking nem ao
          voto oficial, se você informá-lo
        </p>
        <p className="text-sm">
          <Link
            href="/#como-funciona"
            className="font-semibold text-emerald-700 underline dark:text-emerald-400"
          >
            Como funciona o voto ranqueado
          </Link>
        </p>
      </div>
      <Ballot candidates={CANDIDATES} />
    </div>
  );
}
