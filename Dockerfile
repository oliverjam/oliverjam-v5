# syntax = docker/dockerfile:1

FROM oven/bun:1.0.25-slim as base

# LABEL fly_launch_runtime="Bun"
WORKDIR /app
ENV NODE_ENV="production"

#
# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
# RUN apt-get update -qq && \
#     apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

COPY --link . .
RUN bun install --ci
RUN bun run css

#
# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 8080
CMD [ "bun", "run", "start" ]
