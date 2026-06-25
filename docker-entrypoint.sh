#!/bin/sh
set -e

echo "→ Applying database migrations..."
npx prisma migrate deploy

echo "→ Starting Next.js on 0.0.0.0:${PORT:-3000}..."
exec node_modules/.bin/next start -H 0.0.0.0 -p "${PORT:-3000}"
