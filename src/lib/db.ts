import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";
import type { Contract } from "../../prisma/contract.d";
import contractJson from "../../prisma/contract.json" with { type: "json" };

const contract = contractFromJson<Contract>(contractJson);

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL must be set");
  }
  return postgres({ contract, url });
}

const globalForDb = globalThis as unknown as { db?: ReturnType<typeof createDb> };

export const db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}

/** `timestamp(3)` has no offset. Store the UTC clock time Prisma 6 wrote. */
export function toTimestamp(date: Date): string {
  return date.toISOString().replace(/Z$/, "");
}

export function timestampToDate(value: string): Date {
  return new Date(value.endsWith("Z") ? value : `${value}Z`);
}

export function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "sqlState" in err &&
    (err as { sqlState: unknown }).sqlState === "23505"
  );
}
