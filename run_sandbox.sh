#!/bin/bash
set -e
echo "Unsetting NPM_CONFIG_PREFIX..."
unset NPM_CONFIG_PREFIX
echo "Sourcing nvm..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
echo "Installing and using Node.js 22..."
nvm install 22
nvm use 22
echo "Current Node.js version:"
node -v
echo "Starting face-ratio server..."
export PORT=22567
export BASE_PATH=/
pnpm --filter @workspace/face-ratio run dev
