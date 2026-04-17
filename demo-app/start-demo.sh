#!/bin/bash

# --- Configuration ---
# Update PATH to ensure node/npm/npx are found
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(node -v)/bin:$PATH"

# Colors for logging
CYAN='\033[0;36m'
GREEN='\033[0;32m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${CYAN}🚀 Starting Demo App...${NC}"

# Function to kill background processes on exit
cleanup() {
    echo -e "\n${PURPLE}🛑 Stopping Demo services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# 1. Start Demo Backend (Port 3007)
echo -e "${GREEN}🖥️  [1/2] Starting Demo Backend (Port 3007)...${NC}"
cd "$SCRIPT_DIR/backend" && npm run dev &
BACKEND_PID=$!

# 2. Start Demo Frontend (Port 5173)
echo -e "${GREEN}📱 [2/2] Starting Demo Frontend (Port 5173)...${NC}"
cd "$SCRIPT_DIR/frontend" && npm run dev &
FRONTEND_PID=$!

echo -e "\n${CYAN}✨ Demo app is spinning up!${NC}"
echo -e "---------------------------------------------------"
echo -e "🔗 Frontend:     ${GREEN}http://localhost:5173${NC}"
echo -e "🔗 Demo API:     ${GREEN}http://localhost:3007/demo-api${NC}"
echo -e "---------------------------------------------------"
echo -e "${PURPLE}Press Ctrl+C to stop the demo services.${NC}"



# Keep script running to maintain the trap
wait
