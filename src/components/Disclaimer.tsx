"use client";

import { useState } from "react";
import { CONSENT_COOKIE, CONSENT_VALUE } from "@/lib/consent-constants";

type Props = {
  onAccepted: () => void;
};

export function Disclaimer({ onAccepted }: Props) {
  const [checked, setChecked] = useState(false);

  function accept() {
    if (!checked) return;
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${CONSENT_COOKIE}=${CONSENT_VALUE}; path=/; max-age=${maxAge}; SameSite=Lax`;
    onAccepted();
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Privacidade, cookies e uso de dados
      </h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          <strong>Como garantimos seu sigilo:</strong> seu e-mail é utilizado
          estritamente para validar que você é um participante único e não será
          associado às suas opções de voto. Ao votar, geramos uma assinatura
          criptográfica irreversível para registrar sua participação e salvamos
          sua ordem de preferências de forma totalmente anônima e desvinculada.
          Não compartilhamos nem comercializamos seus dados.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            O e-mail serve apenas como verificação de unicidade (uma participação
            por endereço). O texto do e-mail não fica armazenado junto ao voto.
          </li>
          <li>
            O ranking é gravado sem qualquer vínculo com a pessoa que votou. O
            mesmo vale para o voto oficial do 1º e do 2º turno, se você optar
            por informá-lo: ele fica na cédula anônima e só aparece em totais
            de migração.
          </li>
          <li>
            O endereço IP é consultado apenas para verificar se o acesso parte do
            Brasil e <strong>não é armazenado</strong>.
          </li>
          <li>
            Usamos apenas cookies essenciais: o registro do seu consentimento e a
            sessão temporária após o link de e-mail (válida por 30 minutos).
          </li>
          <li>
            Esta é uma <strong>enquete cívica não oficial</strong>. Não substitui
            a urna eletrônica do TSE.
          </li>
        </ul>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-zinc-800 dark:text-zinc-200">
        <input
          type="checkbox"
          className="mt-1 size-4 accent-emerald-600"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <span>
          Li e aceito o aviso de privacidade, o uso de cookies essenciais e o
          tratamento descrito acima para participar da enquete.
        </span>
      </label>

      <button
        type="button"
        disabled={!checked}
        onClick={accept}
        className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-700"
      >
        Continuar
      </button>
    </section>
  );
}
