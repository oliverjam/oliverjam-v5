# syntax = docker/dockerfile:1

FROM oven/bun:1.1.15-slim as base

# LABEL fly_launch_runtime="Bun"
WORKDIR /app
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base as build
COPY --link . .
RUN bun install --ci
RUN bun run css

FROM base
COPY --from=build /app /app
EXPOSE 8080
CMD [ "bun", "run", "start" ]
