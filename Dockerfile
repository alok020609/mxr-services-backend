# Multi-stage build for optimization

# Stage 1: Dependencies
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Stage 2: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate

# Stage 3: Production
FROM node:18-alpine AS production
WORKDIR /app

# Install netcat for database connection checking in entrypoint script
RUN apk add --no-cache netcat-openbsd

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy dependencies and built files
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=nodejs:nodejs /app/src ./src
COPY --from=build --chown=nodejs:nodejs /app/prisma ./prisma
COPY --chown=nodejs:nodejs package*.json ./

# Copy and set up entrypoint script
COPY --chown=nodejs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Create necessary directories
RUN mkdir -p uploads logs && chown -R nodejs:nodejs uploads logs

USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use entrypoint script to run migrations before starting server
ENTRYPOINT ["./docker-entrypoint.sh"]


