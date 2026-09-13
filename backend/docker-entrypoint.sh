#!/bin/sh
set -e

npx prisma migrate deploy --schema=src/shared/prisma/schema.prisma

exec node dist/index.js
