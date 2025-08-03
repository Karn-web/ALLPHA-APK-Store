#!/usr/bin/env bash
set -o errexit

# Install and build frontend
npm install --prefix frontend
npm run build --prefix frontend

# Install backend dependencies
npm install --prefix backend
