# Multi-stage Dockerfile pour production optimisée
# Task 18: Déploiement Production - Phase 4

# Stage 1: Base image avec dependencies
FROM node:18-alpine AS base
LABEL maintainer="Dialect Game Team <team@dialect-game.com>"
LABEL version="1.0.0"
LABEL description="Dialect Game - Plateforme d'apprentissage collaborative"

# Install system dependencies
RUN apk add --no-cache \
    libc6-compat \
    curl \
    bash \
    git \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install pnpm globally
RUN npm install -g pnpm@8

# Stage 2: Dependencies installation
FROM base AS deps

# Install dependencies
RUN pnpm install --frozen-lockfile --prefer-offline

# Stage 3: Development dependencies for building
FROM base AS builder

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build arguments
ARG BUILD_ID
ARG VERSION
ARG COMMIT_SHA
ARG NODE_ENV=production

# Set environment variables for build
ENV BUILD_ID=${BUILD_ID}
ENV VERSION=${VERSION}
ENV COMMIT_SHA=${COMMIT_SHA}
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_TELEMETRY_DISABLED=1

# Generate build info
RUN echo "{\
  \"buildId\": \"${BUILD_ID}\",\
  \"version\": \"${VERSION}\",\
  \"commitSha\": \"${COMMIT_SHA}\",\
  \"buildTime\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\
  \"nodeVersion\": \"$(node --version)\",\
  \"environment\": \"${NODE_ENV}\"\
}" > public/build-info.json

# Build application
RUN pnpm run build:production

# Optimize and compress
RUN pnpm run optimize:production

# Stage 4: Runtime dependencies only
FROM base AS runtime-deps

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prefer-offline --prod

# Stage 5: Production runtime
FROM node:18-alpine AS runner

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set working directory
WORKDIR /app

# Copy runtime dependencies
COPY --from=runtime-deps /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Copy configuration files
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
COPY --chown=nextjs:nodejs nginx.conf ./
COPY --chown=nextjs:nodejs healthcheck.js ./

# Make entrypoint executable
RUN chmod +x docker-entrypoint.sh

# Install nginx for serving static files
RUN apk add --no-cache nginx && \
    mkdir -p /var/log/nginx /var/lib/nginx/tmp && \
    chown -R nextjs:nodejs /var/log/nginx /var/lib/nginx

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node healthcheck.js || exit 1

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Expose port
EXPOSE 3000

# Switch to non-root user
USER nextjs

# Start command
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]