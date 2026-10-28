import { describe, expect, it, beforeAll } from "vitest";
import {
  normalizeEmail,
  canonicalizeEmail,
  hashEmail,
  encryptEmail,
  decryptEmail,
  truncateToHour,
} from "./crypto";

beforeAll(() => {
  process.env.SERVER_SECRET = "test-secret-at-least-32-characters-long!!";
});

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Foo@Example.COM ")).toBe("foo@example.com");
  });
});

describe("canonicalizeEmail", () => {
  it("strips plus aliases on any domain", () => {
    expect(canonicalizeEmail("user+vote@empresa.com.br")).toBe("user@empresa.com.br");
  });

  it("collapses gmail dots and googlemail", () => {
    expect(canonicalizeEmail("u.s.e.r+tag@googlemail.com")).toBe("user@gmail.com");
    expect(canonicalizeEmail("user@gmail.com")).toBe("user@gmail.com");
  });
});

describe("hashEmail", () => {
  it("is stable for the same email", () => {
    expect(hashEmail("a@b.com")).toBe(hashEmail(" A@B.COM "));
  });

  it("treats plus aliases as the same participant", () => {
    expect(hashEmail("a+1@b.com")).toBe(hashEmail("a+2@b.com"));
    expect(hashEmail("a+1@b.com")).toBe(hashEmail("a@b.com"));
  });

  it("treats gmail aliases as the same participant", () => {
    expect(hashEmail("j.oao+xyz@gmail.com")).toBe(hashEmail("joao@gmail.com"));
  });

  it("differs for different emails", () => {
    expect(hashEmail("a@b.com")).not.toBe(hashEmail("c@d.com"));
  });
});

describe("encryptEmail / decryptEmail", () => {
  it("round-trips the delivery address including plus alias", () => {
    const email = "eleitor+teste@exemplo.com.br";
    const enc = encryptEmail(email);
    expect(enc).not.toContain(email);
    expect(decryptEmail(enc)).toBe(email);
  });
});

describe("truncateToHour", () => {
  it("zeros minutes seconds and ms in UTC", () => {
    const d = truncateToHour(new Date("2026-10-28T14:32:01.452Z"));
    expect(d.toISOString()).toBe("2026-10-28T14:00:00.000Z");
  });
});
