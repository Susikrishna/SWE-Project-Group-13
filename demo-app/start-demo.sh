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

echo -e "${CYAN}🚀 Starting Distributed Demo App (Module Federation)...${NC}"

# Function to kill background processes on exit
cleanup() {
    echo -e "\n${PURPLE}🛑 Stopping Demo services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID $MFE_DASH_PID $MFE_ADMIN_PID $MFE_ANALYTICS_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# 1. Start Demo Backend (Port 3007)
echo -e "${GREEN}🖥️  [1/5] Starting Demo Backend (Port 3007)...${NC}"
cd "$SCRIPT_DIR/backend" && npm run dev 2>&1 | sed "s/^/  [backend]   /" &
BACKEND_PID=$!

# 2. Build & Serve Dashboard MFE Remote (Port 5010)
echo -e "${GREEN}📦 [2/5] Building & Serving Dashboard MFE (Port 5010)...${NC}"
cd "$SCRIPT_DIR/mfe-dashboard" && (npm run build && npm run preview) 2>&1 | sed "s/^/  [dashboard] /" &
MFE_DASH_PID=$!

# 3. Build & Serve Admin MFE Remote (Port 5011)
echo -e "${GREEN}📦 [3/5] Building & Serving Admin MFE (Port 5011)...${NC}"
cd "$SCRIPT_DIR/mfe-admin" && (npm run build && npm run preview) 2>&1 | sed "s/^/  [admin]     /" &
MFE_ADMIN_PID=$!

# 4. Build & Serve Analytics MFE Remote (Port 5012)
echo -e "${GREEN}📦 [4/5] Building & Serving Analytics MFE (Port 5012)...${NC}"
cd "$SCRIPT_DIR/mfe-analytics" && (npm run build && npm run preview) 2>&1 | sed "s/^/  [analytics] /" &
MFE_ANALYTICS_PID=$!

# 5. Start Demo Shell Frontend (Port 5173)
echo -e "${GREEN}📱 [5/5] Starting Demo Shell Frontend (Port 5173)...${NC}"
cd "$SCRIPT_DIR/frontend" && npm run dev 2>&1 | sed "s/^/  [shell]     /" &
FRONTEND_PID=$!

echo -e "\n${CYAN}✨ Distributed Demo app is spinning up!${NC}"
echo -e "---------------------------------------------------"
echo -e "🔗 Shell Frontend:     ${GREEN}http://localhost:5173${NC}"
echo -e "🔗 Demo API:           ${GREEN}http://localhost:3007/demo-api${NC}"
echo -e "🔗 Remote Dashboard:   ${GREEN}http://localhost:5010/assets/remoteEntry.js${NC}"
echo -e "🔗 Remote Admin:       ${GREEN}http://localhost:5011/assets/remoteEntry.js${NC}"
echo -e "🔗 Remote Analytics:   ${GREEN}http://localhost:5012/assets/remoteEntry.js${NC}"
echo -e "---------------------------------------------------"
echo -e "${PURPLE}Press Ctrl+C to stop the demo services.${NC}"

# Keep script running to maintain the trap
wait

