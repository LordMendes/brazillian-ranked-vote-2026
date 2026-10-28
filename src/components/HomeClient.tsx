"use client";

import { useEffect, useState } from "react";
import { Disclaimer } from "./Disclaimer";
import { EmailForm } from "./EmailForm";
import { CONSENT_COOKIE, CONSENT_VALUE } from "@/lib/consent-constants";

type Props = {
  banner?: string | null;
  votingOpen: boolean;
};

export function HomeClient({ banner, votingOpen }: Props) {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${CONSENT_COOKIE}=`));
    if (match?.split("=")[1] === CONSENT_VALUE) {
      setAccepted(true);
    }
  }, []);

  useEffect(() => {
    if (!banner) return;
    document.getElementById("participar")?.scrollIntoView();
  }, [banner]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      {banner && (
        <div
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
          role="status"
        >
          {banner}
        </div>
      )}

      {!accepted ? (
        <Disclaimer onAccepted={() => setAccepted(true)} />
      ) : votingOpen ? (
        <EmailForm />
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          A votação desta enquete está encerrada. Você ainda pode ver o{" "}
          <a href="/resultado" className="font-semibold text-emerald-700 underline dark:text-emerald-400">
            resultado agregado
          </a>
          .
        </div>
      )}
    </div>
  );
}
