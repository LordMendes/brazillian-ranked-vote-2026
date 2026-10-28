import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isBrazilTimeZone } from "@/lib/browser-geo";
import { countryFromIp, extractClientIp, isBrazilAccessAllowed } from "@/lib/geo";
import { GEO_COOKIE, GEO_TTL_MS, signGeoAccess } from "@/lib/geo-access";
import { allowNonBr, secureCookies } from "@/lib/platform";

const bodySchema = z.object({
  timeZone: z.string().max(80).optional(),
  country: z
    .string()
    .length(2)
    .regex(/^[A-Za-z]{2}$/)
    .optional()
    .nullable(),
});

async function grantAccess() {
  const store = await cookies();
  store.set(GEO_COOKIE, signGeoAccess(), {
    httpOnly: true,
    secure: secureCookies(),
    sameSite: "lax",
    path: "/",
    maxAge: GEO_TTL_MS / 1000,
  });
}

export async function GET() {
  const { allowed, country } = await isBrazilAccessAllowed();
  return NextResponse.json({ allowed, country });
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    json = {};
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ allowed: false, error: "Requisição inválida." }, { status: 400 });
  }

  const reported = parsed.data.country?.toUpperCase() ?? null;
  const timeZone = parsed.data.timeZone ?? null;
  const ipCountry = countryFromIp(extractClientIp(await headers()));

  const allowed =
    allowNonBr() ||
    reported === "BR" ||
    isBrazilTimeZone(timeZone) ||
    ipCountry === "BR";

  if (allowed) {
    await grantAccess();
  }

  return NextResponse.json({
    allowed,
    country: reported ?? (isBrazilTimeZone(timeZone) ? "BR" : ipCountry),
  });
}
