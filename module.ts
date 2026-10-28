import { module } from "@prisma/composer";
import { envParam, envSecret } from "@prisma/composer-prisma-cloud";
import { postgres } from "@prisma/composer-prisma-cloud/orm";
import { appData } from "./src/data";
import web from "./service";

export default module("eleicao-2026", ({ provision }) => {
  const database = provision(
    postgres({
      name: "database",
      contract: appData,
      config: "./prisma.config.ts",
    }),
  );

  provision(web, {
    deps: { db: database },
    input: {
      serverSecret: envSecret("SERVER_SECRET"),
      resendApiKey: envSecret("RESEND_API_KEY"),
      trustProxy: true,
      resendFrom: envParam("RESEND_FROM"),
      allowNonBr: envParam("ALLOW_NON_BR"),
      votingClosesAt: envParam("VOTING_CLOSES_AT"),
    },
  });
});
