#!/bin/bash
# TWS Stream-to-Blog: Start all local services
# Usage: bash start-local.sh

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
API_DIR="$PROJECT_DIR/services/local-api"
BLOG_DIR="$PROJECT_DIR/blog"

echo "========================================="
echo "  TWS Stream-to-Blog Local Services"
echo "========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

REDIS_PID=""
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down all services...${NC}"
    for pid in $API_PID $WORKER_PID $TUNNEL_PID $BLOG_PID $REDIS_PID; do
        [ -n "$pid" ] && kill "$pid" 2>/dev/null
    done
    wait 2>/dev/null
    echo -e "${GREEN}All services stopped.${NC}"
}
trap cleanup EXIT

# 1. Redis
echo -e "\n${GREEN}[1/5] Starting Redis...${NC}"
if redis-cli ping &>/dev/null; then
    echo "  Redis already running"
else
    redis-server --loglevel warning &
    REDIS_PID=$!
    sleep 1
    echo "  Redis started (PID: $REDIS_PID)"
fi

# 2. FastAPI
echo -e "${GREEN}[2/5] Starting FastAPI (port 8100)...${NC}"
cd "$API_DIR"
source .venv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 8100 &
API_PID=$!
sleep 2

# Verify health
if curl -sf -H "X-API-Key: $(grep -m1 '^API_KEY=' .env | cut -d= -f2-)" http://localhost:8100/health > /dev/null; then
    echo -e "  ${GREEN}FastAPI healthy${NC}"
else
    echo -e "  ${RED}FastAPI health check failed${NC}"
fi

# 3. ARQ Worker
echo -e "${GREEN}[3/5] Starting ARQ Worker...${NC}"
python -m arq src.worker.WorkerSettings &
WORKER_PID=$!
echo "  ARQ worker started (PID: $WORKER_PID)"

# 4. Cloudflare Tunnel
echo -e "${GREEN}[4/5] Starting Cloudflare Tunnel...${NC}"
cloudflared tunnel --url http://localhost:8100 --no-autoupdate &>/tmp/cloudflared.log &
TUNNEL_PID=$!
sleep 4

TUNNEL_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflared.log | head -1)
if [ -n "$TUNNEL_URL" ]; then
    echo -e "  ${GREEN}Tunnel URL: ${TUNNEL_URL}${NC}"
    echo ""
    echo -e "  ${YELLOW}>>> Copy this URL into your N8N LOCAL_API_URL variable <<<${NC}"
    echo ""
else
    echo -e "  ${YELLOW}Tunnel starting... check /tmp/cloudflared.log${NC}"
fi

# 5. Blog dev server (optional)
echo -e "${GREEN}[5/5] Starting Blog dev server (port 3000)...${NC}"
cd "$BLOG_DIR"
npx next dev --port 3000 &>/tmp/next-dev.log &
BLOG_PID=$!
sleep 3
echo -e "  ${GREEN}Blog running at http://localhost:3000${NC}"

echo ""
echo "========================================="
echo -e "  ${GREEN}All services running!${NC}"
echo "========================================="
echo ""
echo "  FastAPI:  http://localhost:8100"
echo "  Blog:     http://localhost:3000"
[ -n "$TUNNEL_URL" ] && echo "  Tunnel:   $TUNNEL_URL"
echo ""
echo "  Press Ctrl+C to stop all services"
echo ""

# Keep alive
wait
