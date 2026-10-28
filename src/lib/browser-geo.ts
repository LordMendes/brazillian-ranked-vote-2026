export const BRAZIL_TIME_ZONES = new Set([
  "America/Araguaina",
  "America/Bahia",
  "America/Belem",
  "America/Boa_Vista",
  "America/Campo_Grande",
  "America/Cuiaba",
  "America/Eirunepe",
  "America/Fortaleza",
  "America/Maceio",
  "America/Manaus",
  "America/Noronha",
  "America/Porto_Velho",
  "America/Recife",
  "America/Rio_Branco",
  "America/Santarem",
  "America/Sao_Paulo",
  "Brazil/Acre",
  "Brazil/DeNoronha",
  "Brazil/East",
  "Brazil/West",
]);

export function isBrazilTimeZone(timeZone: string | null | undefined): boolean {
  if (!timeZone) return false;
  if (BRAZIL_TIME_ZONES.has(timeZone)) return true;
  return timeZone.startsWith("Brazil/");
}

function twoLetterCountry(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const country = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(country) ? country : null;
}

export function countryFromGeoJsPayload(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  return twoLetterCountry((data as { country?: unknown }).country);
}

export function countryFromIpwhoPayload(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const row = data as { success?: unknown; country_code?: unknown };
  if (row.success === false) return null;
  return twoLetterCountry(row.country_code);
}

async function fetchCountry(
  url: string,
  parse: (data: unknown) => string | null,
): Promise<string | null> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) return null;
  return parse(await response.json());
}

/**
 * Country of the visitor's own public IP. Must run in the browser so the
 * lookup sees the user, not the Prisma host in ewr.
 */
export async function detectCountryFromBrowser(): Promise<string | null> {
  try {
    const geoJs = await fetchCountry(
      "https://get.geojs.io/v1/ip/country.json",
      countryFromGeoJsPayload,
    );
    if (geoJs) return geoJs;
  } catch {
    // try the next resolver
  }
  try {
    return await fetchCountry(
      "https://ipwho.is/?fields=success,country_code",
      countryFromIpwhoPayload,
    );
  } catch {
    return null;
  }
}

export function browserTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}
