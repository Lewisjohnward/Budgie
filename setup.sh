#!/usr/bin/env bash
set -e

if [ -f .env ]; then
    echo ".env already exists"
    exit 1
fi

cp .env.example .env

PAYLOAD_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 24)

sed -i "s/^PAYLOAD_SECRET=.*/PAYLOAD_SECRET=$PAYLOAD_SECRET/" .env
sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$POSTGRES_PASSWORD/" .env

echo "Created .env"
