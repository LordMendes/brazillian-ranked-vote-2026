import { createHmac, createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

function requireSecret(): string {
  const secret = process.env.SERVER_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SERVER_SECRET must be set and at least 32 characters");
  }
  return secret;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Canonical form for uniqueness only (not for delivery).
 * - strips plus-aliases: user+tag@domain → user@domain
 * - Gmail/Googlemail: drops dots in the local part; googlemail.com → gmail.com
 */
export function canonicalizeEmail(email: string): string {
  const normalized = normalizeEmail(email);
  const at = normalized.lastIndexOf("@");
  if (at <= 0 || at === normalized.length - 1) return normalized;

  let local = normalized.slice(0, at);
  let domain = normalized.slice(at + 1);

  const plus = local.indexOf("+");
  if (plus !== -1) {
    local = local.slice(0, plus);
  }

  if (domain === "googlemail.com") {
    domain = "gmail.com";
  }
  if (domain === "gmail.com") {
    local = local.replace(/\./g, "");
  }

  return `${local}@${domain}`;
}

export function hashEmail(email: string): string {
  const canonical = canonicalizeEmail(email);
  return createHmac("sha256", requireSecret()).update(canonical).digest("hex");
}

export function hashToken(token: string): string {
  return createHmac("sha256", requireSecret()).update(token).digest("hex");
}

export function hashIp(ip: string): string {
  return createHmac("sha256", requireSecret()).update(ip).digest("hex");
}

function deriveKey(): Buffer {
  return scryptSync(requireSecret(), "ranked-choice-email-v1", 32);
}

/** Encrypt plaintext email for temporary storage in acessos_pendentes. */
export function encryptEmail(email: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(normalizeEmail(email), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64url");
}

export function decryptEmail(payload: string): string {
  const buf = Buffer.from(payload, "base64url");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ciphertext = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", deriveKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

export function truncateToHour(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setUTCMinutes(0, 0, 0);
  return d;
}

export function generateOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}
