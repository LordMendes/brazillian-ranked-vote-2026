import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  countryFromGeoJsPayload,
  countryFromIpwhoPayload,
  isBrazilTimeZone,
} from "./browser-geo";
import { countryFromIp, extractClientIp } from "./geo";
import { hasValidGeoAccess, signGeoAccess } from "./geo-access";

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined }),
  headers: async () => new Headers(),
}));

beforeAll(() => {
  process.env.SERVER_SECRET = "test-secret-at-least-32-characters-long!!";
  process.env.TRUST_PROXY = "true";
  process.env.ALLOW_NON_BR = "false";
});

describe("extractClientIp", () => {
  it("skips private hops and keeps the visitor public IP", () => {
    const headers = new Headers({
      "x-forwarded-for": "10.0.0.4, 200.160.0.8, 172.16.0.2",
    });
    expect(extractClientIp(headers)).toBe("200.160.0.8");
  });

  it("reads cf-connecting-ip before the proxy chain", () => {
    const headers = new Headers({
      "cf-connecting-ip": "201.54.48.10",
      "x-forwarded-for": "10.1.1.1",
    });
    expect(extractClientIp(headers)).toBe("201.54.48.10");
  });
});

describe("countryFromIp", () => {
  it("classifies a well-known Brazilian address as BR", () => {
    expect(countryFromIp("200.160.0.8")).toBe("BR");
  });

  it("does not treat a US resolver as Brazil", () => {
    expect(countryFromIp("8.8.8.8")).toBe("US");
  });
});

describe("isBrazilTimeZone", () => {
  it("accepts the common Brazilian zones", () => {
    expect(isBrazilTimeZone("America/Sao_Paulo")).toBe(true);
    expect(isBrazilTimeZone("America/Manaus")).toBe(true);
    expect(isBrazilTimeZone("America/Noronha")).toBe(true);
  });

  it("rejects zones outside Brazil", () => {
    expect(isBrazilTimeZone("America/New_York")).toBe(false);
    expect(isBrazilTimeZone("UTC")).toBe(false);
    expect(isBrazilTimeZone("")).toBe(false);
  });
});

describe("browser country payloads", () => {
  it("reads geojs country codes", () => {
    expect(countryFromGeoJsPayload({ country: "br", ip: "1.2.3.4" })).toBe("BR");
    expect(countryFromGeoJsPayload({ country: "United States" })).toBe(null);
  });

  it("reads ipwho country codes", () => {
    expect(countryFromIpwhoPayload({ success: true, country_code: "BR" })).toBe("BR");
    expect(countryFromIpwhoPayload({ success: false, country_code: "BR" })).toBe(null);
  });
});

describe("geo access cookie", () => {
  const now = 1_700_000_000_000;

  it("accepts a freshly signed token", () => {
    expect(hasValidGeoAccess(signGeoAccess(now), now)).toBe(true);
  });

  it("rejects a tampered or expired token", () => {
    const token = signGeoAccess(now);
    expect(hasValidGeoAccess(token.replace("BR.", "US."), now)).toBe(false);
    expect(hasValidGeoAccess(signGeoAccess(now - 25 * 60 * 60 * 1000), now)).toBe(false);
  });
});
