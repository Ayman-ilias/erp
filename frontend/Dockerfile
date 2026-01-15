FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy all files
COPY . .

# Clear .env.local to prevent it from overriding production settings
RUN echo "" > .env.local

# Build application (uses .env.production for NEXT_PUBLIC_* variables)
# Using --webpack flag to avoid Turbopack parsing issues with complex nested JSX structures
RUN npm run build -- --webpack

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

# Port is configurable via environment variable
# Default to 3000 (container internal), mapped to host port via docker-compose
ENV PORT=${PORT:-3000}
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
