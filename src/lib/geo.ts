import geoip from "geoip-lite";
import { headers } from "next/headers";

function isPrivateIp(ip: string): boolean {
  if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true;
  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) return true;
  return false;
}

export function extractClientIp(headerMap: Headers): string | null {
  const trustProxy = process.env.TRUST_PROXY === "true";
  if (trustProxy) {
    const xff = headerMap.get("x-forwarded-for");
    if (xff) {
      const first = xff.split(",")[0]?.trim();
      if (first) return first.replace(/^::ffff:/, "");
    }
    const realIp = headerMap.get("x-real-ip")?.trim();
    if (realIp) return realIp.replace(/^::ffff:/, "");
  }
  return null;
}

export function countryFromIp(ip: string | null): string | null {
  if (!ip) return null;
  if (isPrivateIp(ip)) {
    // Local requests: treat as BR when ALLOW_NON_BR or in development
    if (process.env.ALLOW_NON_BR === "true" || process.env.NODE_ENV !== "production") {
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
  if (process.env.ALLOW_NON_BR === "true") {
    return { allowed: true, country: "BYPASS" };
  }

  const headerStore = await headers();
  const ip = extractClientIp(headerStore);
  const country = countryFromIp(ip);
  return { allowed: country === "BR", country };
}

export function isVotingOpen(): boolean {
  const closes = process.env.VOTING_CLOSES_AT;
  if (!closes) return true;
  const at = Date.parse(closes);
  if (Number.isNaN(at)) return true;
  return Date.now() < at;
}
