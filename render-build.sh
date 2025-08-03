#!/usr/bin/env bash
set -o errexit

echo "📦 Installing frontend..."
npm install --prefix frontend
npm run build --prefix frontend

echo "📦 Installing backend..."
npm install --prefix backend

