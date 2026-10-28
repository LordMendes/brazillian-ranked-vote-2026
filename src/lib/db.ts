import postgres, { type PostgresClient } from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";
import type { Contract } from "../../prisma/contract";
import contractJson from "../../prisma/contract.json" with { type: "json" };
import web from "../../service";

const contract = contractFromJson<Contract>(contractJson);

type Db = PostgresClient<Contract>;

let composerDb: Db | undefined;
let localDb: Db | undefined;

function current(): Db {
  if (composerDb) return composerDb;
  try {
    composerDb = web.load().db.client;
    return composerDb;
  } catch (err) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      if (err instanceof Error) throw err;
      throw new Error("DATABASE_URL must be set");
    }
    localDb ??= postgres({ contract, url });
    return localDb;
  }
}

export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const real = current();
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(real) : value;
  },
});

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
