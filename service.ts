import { secretString } from "@prisma/composer/arktype";
import nextjs from "@prisma/composer/nextjs";
import { compute } from "@prisma/composer-prisma-cloud";
import { postgres } from "@prisma/composer-prisma-cloud/orm";
import { type } from "arktype";
import { appData } from "./src/data";

export const webInput = type({
  serverSecret: secretString(),
  resendApiKey: secretString(),
  trustProxy: "boolean",
  "resendFrom?": "string",
  "allowNonBr?": "string",
  "votingClosesAt?": "string",
});

export default compute({
  name: "web",
  deps: { db: postgres(appData) },
  input: webInput,
  build: nextjs({ module: import.meta.url, appDir: "." }),
});
