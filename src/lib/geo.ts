import geoip from "geoip-lite";
import { headers } from "next/headers";
import { allowNonBr, trustProxy, votingClosesAt } from "./platform";

function isPrivateIp(ip: string): boolean {
  if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true;
  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) return true;
  return false;
}

export function extractClientIp(headerMap: Headers): string | null {
  if (trustProxy()) {
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

  const headerStore = await headers();
  const ip = extractClientIp(headerStore);
  const country = countryFromIp(ip);
  return { allowed: country === "BR", country };
}

export function isVotingOpen(): boolean {
  const closes = votingClosesAt();
  if (!closes) return true;
  const at = Date.parse(closes);
  if (Number.isNaN(at)) return true;
  return Date.now() < at;
}
