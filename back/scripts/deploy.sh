#!/bin/bash

set -e
set -o pipefail

# tests
echo "👨🏻‍🔧 Launching tests"
npm run tf
echo "✅ Tests successfully passed"
echo ""

# build
echo "🚧 Building ./dist folder"
npm run build
echo "✅ ./dist folder successfully built"
echo ""

# migrate
echo "✈️ DB migration started"
npm run db:migrate:prod
echo "✅ Migration successful"
echo ""

# deploy
echo "🚀 Deployment started"
npm run vercel
echo "✅ Backend successfully deployed"
