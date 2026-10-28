"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { browserTimeZone, detectCountryFromBrowser } from "@/lib/browser-geo";

export function RecheckBrazilAccess() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "blocked">("checking");

  useEffect(() => {
    let cancelled = false;

    async function recheck() {
      try {
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
          router.replace("/");
          return;
        }
      } catch {
        if (cancelled) return;
      }
      setStatus("blocked");
    }

    void recheck();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status === "checking") {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Confirmando a conexão pelo seu navegador…
      </p>
    );
  }

  return null;
}
