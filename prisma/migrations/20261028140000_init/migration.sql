-- CreateTable
CREATE TABLE "participantes_verificados" (
    "id" UUID NOT NULL,
    "email_hash" TEXT NOT NULL,
    "data_verificacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participantes_verificados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votos_computados" (
    "id" UUID NOT NULL,
    "ranking" JSONB NOT NULL,
    "data_submissao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "votos_computados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acessos_pendentes" (
    "id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "email_encrypted" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acessos_pendentes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "participantes_verificados_email_hash_key" ON "participantes_verificados"("email_hash");

-- CreateIndex
CREATE UNIQUE INDEX "acessos_pendentes_token_hash_key" ON "acessos_pendentes"("token_hash");
