"use client";

import { FormEvent, useState } from "react";

export function EmailForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as {
        message?: string;
        error?: string;
        alreadyParticipated?: boolean;
      };

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Não foi possível enviar o link.");
        return;
      }

      setStatus("ok");
      setMessage(
        data.alreadyParticipated
          ? data.message || "Este e-mail já registrou participação."
          : data.message ||
              "Se o e-mail for válido, enviamos um link de acesso. Verifique sua caixa de entrada.",
      );
    } catch {
      setStatus("error");
      setMessage("Falha de rede. Tente novamente.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
    >
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Receber link de acesso
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Enviaremos um link único para o seu e-mail. Ele confirma que você tem
        acesso à caixa postal e impede votos duplicados.
      </p>

      <label className="mt-4 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
        E-mail
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 outline-none ring-emerald-500 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
          placeholder="voce@exemplo.com"
        />
      </label>

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
      >
        {status === "loading" ? "Enviando…" : "Enviar link"}
      </button>

      {message && (
        <p
          className={`mt-4 text-sm ${
            status === "error"
              ? "text-red-600 dark:text-red-400"
              : "text-emerald-700 dark:text-emerald-400"
          }`}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}
