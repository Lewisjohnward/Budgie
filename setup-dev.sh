#!/usr/bin/env bash
set -e

if [ ! -f backend/.env ]; then
    cp backend/.env.development backend/.env
    echo "Created backend/.env"
else
    echo "backend/.env already exists"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.development frontend/.env
    echo "Created frontend/.env"
else
    echo "frontend/.env already exists"
fi
