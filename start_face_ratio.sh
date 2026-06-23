#!/bin/bash
pkill -f node
unset NPM_CONFIG_PREFIX
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20.19
nvm use 20.19
export PORT=3002
export BASE_PATH=/
cd artifacts/face-ratio
pnpm install
pnpm run dev
