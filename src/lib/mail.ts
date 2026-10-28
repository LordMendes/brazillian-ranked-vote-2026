import nodemailer from "nodemailer";

export async function sendMagicLink(to: string, link: string): Promise<void> {
  const host = process.env.SMTP_HOST;

  if (!host) {
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_NON_BR !== "true") {
      // In production without SMTP we still avoid logging the email;
      // the caller should have rejected earlier, but fail closed.
      throw new Error("SMTP_HOST is required in production");
    }
    // Development: print link only (no email address) to the server console.
    console.info("[dev] magic link ready:", link);
    return;
  }

  const port = Number(process.env.SMTP_PORT || "587");
  const transporter = nodemailer.createTransport({
    host,
    port,
    // MailHog (1025) and typical submission ports are plain SMTP; only 465 is TLS-on-connect.
    secure: port === 465,
    ignoreTLS: port === 1025 || port === 11025,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "Enquete Ranqueada <noreply@localhost>",
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
}
