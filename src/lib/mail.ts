import nodemailer from "nodemailer";
import { Resend } from "resend";
import { resendApiKey, resendFrom, useResend } from "./platform";

const DEFAULT_FROM = "Enquete Ranqueada <acesso@tortrad.com.br>";
const SUBJECT = "Seu link de acesso — Enquete de voto ranqueado 2026";

/** Local `next dev` delivers to MailHog. Prisma Compute and production use Resend. */
function usesMailhog(): boolean {
  return !useResend();
}

function textBody(link: string): string {
  return [
    "Você solicitou acesso à enquete de voto ranqueado (Presidência 2026).",
    "",
    "Abra o link abaixo para confirmar seu e-mail e votar. Ele expira em 15 minutos e só pode ser usado uma vez:",
    "",
    link,
    "",
    "Se você não solicitou este acesso, ignore este e-mail.",
    "",
    "Esta é uma enquete cívica não oficial — não é a urna do TSE.",
  ].join("\n");
}

function htmlBody(link: string): string {
  return `
      <p>Você solicitou acesso à <strong>enquete de voto ranqueado (Presidência 2026)</strong>.</p>
      <p><a href="${link}">Confirmar e-mail e votar</a></p>
      <p>O link expira em 15 minutos e só pode ser usado uma vez.</p>
      <p>Se você não solicitou este acesso, ignore este e-mail.</p>
      <p><em>Esta é uma enquete cívica não oficial — não é a urna do TSE.</em></p>
    `;
}

function rejectSend(name: string): Error {
  const failure = new Error("Failed to send magic link");
  failure.cause = { name };
  return failure;
}

async function sendViaMailhog(to: string, link: string): Promise<void> {
  const host = process.env.SMTP_HOST || "127.0.0.1";
  const port = Number(process.env.SMTP_PORT || "1025");
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: false,
    ignoreTLS: true,
    connectionTimeout: 3_000,
    greetingTimeout: 3_000,
    socketTimeout: 5_000,
  });

  try {
    await transport.sendMail({
      from: resendFrom(DEFAULT_FROM),
      to,
      subject: SUBJECT,
      text: textBody(link),
      html: htmlBody(link),
    });
  } catch {
    console.error("[mail] MailHog did not accept the message");
    throw rejectSend("mailhog_unavailable");
  }

  const uiPort = process.env.MAILHOG_UI_PORT || "8025";
  console.info(`[dev] magic link delivered to MailHog at http://localhost:${uiPort}`);
}

async function sendViaResend(to: string, link: string): Promise<void> {
  const apiKey = resendApiKey();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required in production");
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: resendFrom(DEFAULT_FROM),
    to,
    subject: SUBJECT,
    text: textBody(link),
    html: htmlBody(link),
  });

  if (error) {
    console.error("[mail] resend rejected the message", error.name);
    throw rejectSend(error.name);
  }
}

export async function sendMagicLink(to: string, link: string): Promise<void> {
  if (usesMailhog()) {
    await sendViaMailhog(to, link);
    return;
  }
  await sendViaResend(to, link);
}
