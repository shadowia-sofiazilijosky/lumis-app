# Single-stage build — simpler and more reliable than trying to get Nixpacks
# or a multi-stage COPY --from to understand a pnpm workspace's dist output
# and workspace:* symlinks correctly. Built from the MONOREPO ROOT as context
# (Railway config points there), since pnpm needs the whole workspace to
# resolve @lumis/shared-types.
FROM node:22-slim

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

# @lumis/shared-types must be compiled to real CommonJS (dist/) BEFORE the
# API is built or run. It previously shipped raw .ts source as its package
# "main", which only "worked" because `node dist/main` require()'d that .ts
# file directly at runtime — fragile by construction, and it broke outright
# the moment a routine `node:22-slim` image update turned on unflagged
# native TypeScript type-stripping: that treats a file using ESM `export`
# syntax as an ES module and enforces strict ESM resolution, which rejects
# the extensionless directory imports (`export * from "./enums"`) used
# throughout shared-types's barrel files, crashing the container on boot
# with ERR_UNSUPPORTED_DIR_IMPORT. Compiling to plain CommonJS sidesteps
# the whole class of issue — CJS require() has always supported
# extensionless directory imports, unlike strict ESM.
RUN pnpm --filter @lumis/shared-types build

RUN pnpm --filter api build
RUN test -f /app/apps/api/dist/main.js || (echo "dist/main.js missing after build" && exit 1)

WORKDIR /app/apps/api

ENV NODE_ENV=production

CMD ["node", "dist/main"]
