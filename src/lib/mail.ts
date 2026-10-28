import { Resend } from "resend";

const DEFAULT_FROM = "Enquete Ranqueada <onboarding@resend.dev>";

export async function sendMagicLink(to: string, link: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_NON_BR !== "true") {
      throw new Error("RESEND_API_KEY is required in production");
    }
    // Development: print link only (no email address) to the server console.
    console.info("[dev] magic link ready:", link);
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM || DEFAULT_FROM,
    to,
    subject: "Seu link de acesso — Enquete de voto ranqueado 2026",
    text: [
      "Você solicitou acesso à enquete de voto ranqueado (Presidência 2026).",
      "",
      "Abra o link abaixo para confirmar seu e-mail e votar. Ele expira em 15 minutos e só pode ser usado uma vez:",
      "",
      link,
      "",
      "Se você não solicitou este acesso, ignore este e-mail.",
      "",
      "Esta é uma enquete cívica não oficial — não é a urna do TSE.",
    ].join("\n"),
    html: `
      <p>Você solicitou acesso à <strong>enquete de voto ranqueado (Presidência 2026)</strong>.</p>
      <p><a href="${link}">Confirmar e-mail e votar</a></p>
      <p>O link expira em 15 minutos e só pode ser usado uma vez.</p>
      <p>Se você não solicitou este acesso, ignore este e-mail.</p>
      <p><em>Esta é uma enquete cívica não oficial — não é a urna do TSE.</em></p>
    `,
  });

  if (error) {
    console.error("[mail] resend rejected the message", error.name);
    throw new Error("Failed to send magic link");
  }
}
