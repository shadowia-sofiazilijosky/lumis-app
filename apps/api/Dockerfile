# Single-stage build — simpler and more reliable than trying to get Nixpacks
# or a multi-stage COPY --from to understand a pnpm workspace's dist output
# and workspace:* symlinks correctly. Built from the MONOREPO ROOT as context
# (Railway config points there), since pnpm needs the whole workspace to
# resolve @lumis/shared-types.
FROM node:22-slim

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app

COPY . .

# `prisma generate` (our postinstall hook) only reads the schema — it never
# connects to the database — but prisma.config.ts's env("DATABASE_URL")
# throws if the var is merely absent. Railway's real secrets aren't injected
# at build time, so these placeholders exist purely to satisfy that check;
# Railway's actual runtime env vars override them when the container starts.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV DIRECT_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

RUN pnpm install --frozen-lockfile
RUN pnpm --filter api build
RUN test -f /app/apps/api/dist/main.js || (echo "dist/main.js missing after build" && exit 1)

WORKDIR /app/apps/api

ENV NODE_ENV=production

CMD ["node", "dist/main"]
