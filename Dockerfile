# Production image for the Next.js app.
# The Prisma pg driver adapter is pure JS, so no query-engine binaries / openssl
# juggling is needed. Pages that read the DB are force-dynamic, so the build
# itself does not need a database.
FROM node:20-alpine

WORKDIR /app

# Install all dependencies (dev deps are needed for the build and the Prisma CLI).
COPY package.json package-lock.json ./
RUN npm ci

# App source
COPY . .

# Generate the Prisma client, then build.
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Apply migrations, then start the server (see docker-entrypoint.sh).
CMD ["sh", "/app/docker-entrypoint.sh"]
