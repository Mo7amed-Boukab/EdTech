# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies needed for build 
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client and Build
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Setup security (non-root user)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN mkdir -p logs && chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

# Start application
CMD sh -c "npx prisma migrate deploy && if [ \"$SEED_DB\" = \"true\" ]; then npm run seed:prod; fi && node dist/server.js"
