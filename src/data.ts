import { dataContract } from "@prisma/composer-prisma-cloud/orm";
import type { Contract } from "../prisma/contract";
import contractJson from "../prisma/contract.json" with { type: "json" };

/** Shared by the database resource and the web service so deploy can match them. */
export const appData = dataContract<Contract>(contractJson);
