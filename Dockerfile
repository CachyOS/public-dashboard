# Base image
FROM oven/bun:1.2-slim AS base
WORKDIR /app

# Dependencies
FROM base AS deps

WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lock ./
RUN bun --bun install

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_APP_VERSION
RUN bun --bun run build

# Production
FROM base AS production
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy the standalone build output and static files
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

# Expose the port the app runs on
EXPOSE 3000

# Configure the server
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "--bun", "server.js"]
