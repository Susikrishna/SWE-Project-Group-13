#!/bin/bash
# =============================================================================
# start-all.sh — Start all backend services and frontend apps
# =============================================================================
# Usage:
#   ./start-all.sh           Start everything
#   ./start-all.sh --backend Start backend services only
#   ./start-all.sh --frontend Start frontend apps only
#
# Press Ctrl+C to stop all processes cleanly.
# =============================================================================

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

# ── Resolve project root (wherever this script lives) ────────────────────────
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Service definitions: "label|relative_path" ───────────────────────────────
BACKEND_SERVICES=(
  "auz-engine      | backend/services/auz-engine"
  "registry-service| backend/services/registry-service"
  "role-service    | backend/services/role-service"
  "user-service    | backend/services/user-service"
)

FRONTEND_APPS=(
  "registry-ui     | frontend/Admin-Registry-Management"
  "role-ui         | frontend/Admin-Role-Creation"
)

# ── PID tracking ─────────────────────────────────────────────────────────────
PIDS=()

# ── Graceful shutdown on Ctrl+C ──────────────────────────────────────────────
cleanup() {
  echo -e "\n${YELLOW}[start-all] Stopping all processes...${RESET}"
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  echo -e "${GREEN}[start-all] All processes stopped.${RESET}"
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── Helper: start one service ─────────────────────────────────────────────────
start_service() {
  local label="$1"
  local rel_path="$2"
  local dir="$ROOT/$rel_path"

  # Trim whitespace from label
  label="$(echo "$label" | xargs)"

  if [ ! -d "$dir" ]; then
    echo -e "${RED}[start-all] ✗ Directory not found: $dir — skipping $label${RESET}"
    return
  fi

  if [ ! -f "$dir/.env" ]; then
    echo -e "${YELLOW}[start-all] ⚠  No .env found in $rel_path — copy .env.example first!${RESET}"
  fi

  if [ ! -d "$dir/node_modules" ]; then
    echo -e "${CYAN}[start-all] Installing dependencies for ${BOLD}$label${RESET}${CYAN}...${RESET}"
    (cd "$dir" && npm install --silent)
  fi

  echo -e "${GREEN}[start-all] Starting ${BOLD}$label${RESET}${GREEN} (${rel_path})${RESET}"
  (cd "$dir" && npm run dev 2>&1 | sed "s/^/  [${label}] /") &
  PIDS+=($!)
}

# ── Parse args ────────────────────────────────────────────────────────────────
MODE="all"
if [[ "${1:-}" == "--backend" ]]; then MODE="backend"; fi
if [[ "${1:-}" == "--frontend" ]]; then MODE="frontend"; fi

# ── Banner ────────────────────────────────────────────────────────────────────
echo -e "${BOLD}${CYAN}"
echo "╔══════════════════════════════════════════╗"
echo "║        SWE Group 13 — Start All          ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${RESET}"

# ── Start services ────────────────────────────────────────────────────────────
if [[ "$MODE" == "all" || "$MODE" == "backend" ]]; then
  echo -e "${BOLD}── Backend Services ──────────────────────────${RESET}"
  for entry in "${BACKEND_SERVICES[@]}"; do
    label="${entry%%|*}"
    path="${entry##*|}"
    start_service "$label" "$(echo "$path" | xargs)"
  done
fi

if [[ "$MODE" == "all" || "$MODE" == "frontend" ]]; then
  echo -e "\n${BOLD}── Frontend Apps ─────────────────────────────${RESET}"
  for entry in "${FRONTEND_APPS[@]}"; do
    label="${entry%%|*}"
    path="${entry##*|}"
    start_service "$label" "$(echo "$path" | xargs)"
  done
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo -e "\n${GREEN}${BOLD}All processes started. Press Ctrl+C to stop everything.${RESET}\n"

wait
