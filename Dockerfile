# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
# Only copy package.json and lockfile first for better layer caching
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV CI=true
# Install all dependencies (including dev) for build
RUN pnpm install
# Now copy the rest of the source files
COPY . .
RUN DATABASE_URL="postgresql://placeholder:5432" npx prisma generate
RUN pnpm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/prisma ./prisma

RUN corepack enable && corepack prepare pnpm@latest --activate
# Copy only production dependencies
RUN pnpm install

# Generate Prisma client in production stage
RUN DATABASE_URL="postgresql://placeholder:5432" npx prisma generate

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main.js"]
