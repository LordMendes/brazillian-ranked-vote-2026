import { createHmac, timingSafeEqual } from "crypto";
import { serverSecret } from "./platform";

export const GEO_COOKIE = "enquete_geo";
export const GEO_TTL_MS = 24 * 60 * 60 * 1000;

export function signGeoAccess(now = Date.now()): string {
  const issuedAt = String(now);
  const sig = createHmac("sha256", serverSecret())
    .update(`geo:BR:${issuedAt}`)
    .digest("base64url");
  return `BR.${issuedAt}.${sig}`;
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function hasValidGeoAccess(
  value: string | undefined,
  now = Date.now(),
): boolean {
  if (!value) return false;
  const [country, issuedAt, sig] = value.split(".");
  if (country !== "BR" || !issuedAt || !sig) return false;

  const ts = Number(issuedAt);
  if (!Number.isFinite(ts) || now - ts > GEO_TTL_MS || now + 60_000 < ts) {
    return false;
  }

  const expected = createHmac("sha256", serverSecret())
    .update(`geo:BR:${issuedAt}`)
    .digest("base64url");
  return safeEqual(sig, expected);
}
