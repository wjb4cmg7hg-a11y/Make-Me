#!/bin/bash
unset NPM_CONFIG_PREFIX
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20.19
nvm use 20.19
export PORT=3001
cd artifacts/api-server
pnpm install
pnpm run dev
