"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { browserTimeZone, detectCountryFromBrowser } from "@/lib/browser-geo";

type Props = {
  children: React.ReactNode;
};

export function BrazilAccessGate({ children }: Props) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function confirm() {
      try {
        const existing = await fetch("/api/geo");
        const current = (await existing.json()) as { allowed?: boolean };
        if (cancelled) return;
        if (current.allowed) {
          setAllowed(true);
          return;
        }

        const country = await detectCountryFromBrowser();
        const response = await fetch("/api/geo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            country,
            timeZone: browserTimeZone(),
          }),
        });
        const result = (await response.json()) as { allowed?: boolean };
        if (cancelled) return;
        if (result.allowed) {
          setAllowed(true);
          return;
        }
      } catch {
        if (cancelled) return;
      }
      router.replace("/bloqueado");
    }

    void confirm();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!allowed) {
    return (
      <p className="mx-auto max-w-lg text-center text-sm text-zinc-600 dark:text-zinc-400">
        Confirmando se o acesso parte do Brasil…
      </p>
    );
  }

  return children;
}
