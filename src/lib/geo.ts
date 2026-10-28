import geoip from "geoip-lite";
import { cookies, headers } from "next/headers";
import { GEO_COOKIE, hasValidGeoAccess } from "./geo-access";
import { allowNonBr, trustProxy, votingClosesAt } from "./platform";

function isPrivateIp(ip: string): boolean {
  if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true;
  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) return true;
  return false;
}

function normalizeIp(value: string): string {
  return value.trim().replace(/^::ffff:/, "");
}

function firstIpFromHeader(value: string): { publicIp: string | null; fallback: string | null } {
  let fallback: string | null = null;
  for (const part of value.split(",")) {
    const ip = normalizeIp(part);
    if (!ip) continue;
    if (!fallback) fallback = ip;
    if (!isPrivateIp(ip)) return { publicIp: ip, fallback };
  }
  return { publicIp: null, fallback };
}

const CLIENT_IP_HEADERS = [
  "cf-connecting-ip",
  "true-client-ip",
  "x-real-ip",
  "x-client-ip",
  "fly-client-ip",
  "x-forwarded-for",
];

export function extractClientIp(headerMap: Headers): string | null {
  if (!trustProxy()) return null;

  let fallback: string | null = null;
  for (const name of CLIENT_IP_HEADERS) {
    const raw = headerMap.get(name);
    if (!raw) continue;
    const found = firstIpFromHeader(raw);
    if (found.publicIp) return found.publicIp;
    if (!fallback && found.fallback) fallback = found.fallback;
  }
  return fallback;
}

export function countryFromIp(ip: string | null): string | null {
  if (!ip) return null;
  if (isPrivateIp(ip)) {
    if (allowNonBr() || process.env.NODE_ENV !== "production") {
      return "BR";
    }
    return null;
  }
  const lookup = geoip.lookup(ip);
  return lookup?.country ?? null;
}

export async function isBrazilAccessAllowed(): Promise<{
  allowed: boolean;
  country: string | null;
}> {
  if (allowNonBr()) {
    return { allowed: true, country: "BYPASS" };
  }

  const cookieStore = await cookies();
  if (hasValidGeoAccess(cookieStore.get(GEO_COOKIE)?.value)) {
    return { allowed: true, country: "BR" };
  }

  const headerStore = await headers();
  const ip = extractClientIp(headerStore);
  const country = countryFromIp(ip);
  // Host/proxy IPs (Prisma ewr, private hops) are not the visitor. Only a
  // positive BR match from a public client IP is trusted here.
  if (country === "BR") {
    return { allowed: true, country };
  }
  return { allowed: false, country };
}

export function isVotingOpen(): boolean {
  const closes = votingClosesAt();
  if (!closes) return true;
  const at = Date.parse(closes);
  if (Number.isNaN(at)) return true;
  return Date.now() < at;
}
