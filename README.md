# Enquete de voto ranqueado — Presidência 2026

Enquete cívica **não oficial** com voto ranqueado (IRV), autenticação por e-mail via magic link, unicidade por HMAC-SHA256 e voto anônimo desvinculado. Pronto para Docker Compose e Coolify.

## Privacidade

- Tabela `participantes_verificados`: só o hash HMAC do e-mail (nunca o texto).
- Tabela `votos_computados`: ranking (JSON), voto oficial autodeclarado do 1º e do 2º turno (opcional) e timestamp truncado à hora, com UUID aleatório.
- Sem FK entre as duas tabelas.
- Link mágico opaco (`/acesso/<token>`); o e-mail fica criptografado só enquanto o link é válido (15 min, uso único).
- Corpo do voto: `{ ranking: string[], votoPrimeiroTurno?: string | null, votoSegundoTurno?: string | null }` — o e-mail fica na sessão httpOnly criptografada. O voto oficial é opcional (`branco`, `nulo`, `nao-votei`, id de candidato do 1º turno, ou `lula` / `flavio-bolsonaro` no 2º) e não entra na conta IRV. Serve para o agregado de migração.
- IP usado só para checar país (BR), **não armazenado**.
- Logs: não registre bodies, e-mails, tokens ou IPs. No Coolify/Traefik, desative log de request body e URLs completas com query/path sensível.

## Stack

- Next.js (App Router, TypeScript, `output: "standalone"`)
- PostgreSQL 16 + Prisma
- Resend (envio do link de acesso)
- `@hello-pangea/dnd` + botões sobe/desce
- `geoip-lite` (lookup offline)

## Desenvolvimento local

```bash
cp .env.example .env
# Ajuste SERVER_SECRET (32+ chars). Localmente o Postgres do compose usa a porta 15432.

docker compose up -d postgres
npm install
npx prisma migrate deploy
npm run dev
```

Com `ALLOW_NON_BR=true` (padrão no `.env.example`), a checagem de país é ignorada.

**E-mail:** o link de acesso sai pela API do Resend (`RESEND_API_KEY`). O remetente padrão é `onboarding@resend.dev`, que só entrega no e-mail da conta Resend. Para os demais destinatários, verifique um domínio e defina `RESEND_FROM`. Sem `RESEND_API_KEY`, o link só é impresso no console.

```bash
npm test
```

## Docker / Coolify

Deploy type: **Docker Compose**.

Variáveis obrigatórias:

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | Postgres |
| `SERVER_SECRET` | ≥ 32 caracteres (HMAC, criptografia, sessão) |
| `APP_URL` | URL pública (ex.: `https://enquete.seudominio.com`) |
| `TRUST_PROXY` | `true` no Coolify (Traefik) |

Obrigatório para enviar e-mail: `RESEND_API_KEY`. Opcional: `RESEND_FROM` (domínio verificado), `VOTING_CLOSES_AT`, `ALLOW_NON_BR` (**não** definir em produção).

Se o Coolify já gerencia o Postgres, aponte `DATABASE_URL` para ele e pode publicar só o serviço `app` (ou use o compose completo).

```bash
docker compose up --build
```

Na subida, o entrypoint roda `prisma migrate deploy` e inicia o servidor standalone.

## Rotas

- `/` — landing do voto ranqueado, aviso LGPD/cookies, depois e-mail
- `/acesso/[token]` — consome o link
- `/votar` — urna ranqueada
- `/resultado` — totais IRV (público, inclusive fora do BR)
- `/bloqueado` — fora do Brasil
- `POST /api/verificar`, `POST /api/voto`

## Candidatos

Lista do 1º turno TSE 2026 (13 nomes). O 1º turno oficial já ocorreu; o 2º turno oficial foi Lula (13) × Flávio Bolsonaro (22). A enquete mantém o campo completo do 1º turno.
