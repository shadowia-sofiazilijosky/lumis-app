# Single-stage build — simpler and more reliable than trying to get Nixpacks
# or a multi-stage COPY --from to understand a pnpm workspace's dist output
# and workspace:* symlinks correctly. Built from the MONOREPO ROOT as context
# (Railway config points there), since pnpm needs the whole workspace to
# resolve @lumis/shared-types.
#
# Pinned to a specific patch (not the floating `node:22-slim` tag) on
# purpose: @lumis/shared-types ships raw .ts source as its package.json
# "main" (no compiled JS), which only works because `node dist/main`
# `require()`s it directly. Newer 22.x patches turned on unflagged native
# TypeScript type-stripping, which treats any file using ESM `export`
# syntax as an ES module and then enforces strict ESM resolution — that
# rejects the extensionless directory imports (`export * from "./enums"`)
# used throughout shared-types's barrel files, crashing the container on
# boot ("ERR_UNSUPPORTED_DIR_IMPORT") the moment `node:22-slim` drifted to
# a patch with that behavior on by default. Pinning avoids the whole class
# of issue without rewriting shared-types's imports (which would in turn
# break `nest build`'s own tsc, since TypeScript rejects .ts-extension
# import specifiers unless `allowImportingTsExtensions` is set — a flag
# that requires `noEmit`, incompatible with a build that emits real JS).
FROM node:22.9.0-slim

# fonts-liberation: @napi-rs/canvas (PDF cover thumbnails) needs at least one
# real system font available to rasterize text — node:22-slim ships none.
RUN apt-get update && apt-get install -y --no-install-recommends fonts-liberation \
  && rm -rf /var/lib/apt/lists/*

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
