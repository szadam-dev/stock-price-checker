FROM node:20.18.0-alpine AS base
# Initial pnpm setup
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY . /app
WORKDIR /app

# Multi layering - PRD only dependencies
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Multi layering - Bundle generation
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build:prd

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

# After container init, the terminal won't be able to auto fetch pnpm without user interaction, preinstalling.
RUN corepack install --global pnpm@9.12.0
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

EXPOSE 8081

CMD [ "pnpm", "start:prd" ]
