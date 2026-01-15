#!/bin/bash
# Deployment Health Check Script
# Run this on your Proxmox server to diagnose issues

echo "=========================================="
echo "  Southern ERP - Deployment Health Check"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check Docker Compose
echo "1. Checking Docker Compose..."
if command -v docker-compose &> /dev/null || command -v docker compose &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker Compose is installed"
else
    echo -e "${RED}✗${NC} Docker Compose not found!"
    exit 1
fi

# 2. Check Container Status
echo ""
echo "2. Checking Container Status..."
if docker compose ps &> /dev/null; then
    docker compose ps
    UP_COUNT=$(docker compose ps | grep -c "Up")
    echo -e "${GREEN}✓${NC} Found $UP_COUNT running containers"
else
    echo -e "${RED}✗${NC} Cannot check containers. Are you in the right directory?"
    exit 1
fi

# 3. Check Backend Health
echo ""
echo "3. Checking Backend Health Endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/health 2>/dev/null)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓${NC} Backend is responding (HTTP $HEALTH_RESPONSE)"
    curl -s http://localhost:8000/api/v1/health | head -5
else
    echo -e "${RED}✗${NC} Backend not responding (HTTP $HEALTH_RESPONSE)"
    echo "   Check: docker compose logs backend"
fi

# 4. Check Environment Variables
echo ""
echo "4. Checking Critical Environment Variables..."
if docker compose exec -T backend env 2>/dev/null | grep -q "POSTGRES_PASSWORD"; then
    POSTGRES_SET=$(docker compose exec -T backend env 2>/dev/null | grep "POSTGRES_PASSWORD" | cut -d'=' -f2)
    if [ "$POSTGRES_SET" != "root" ] && [ -n "$POSTGRES_SET" ]; then
        echo -e "${GREEN}✓${NC} POSTGRES_PASSWORD is set (not default)"
    else
        echo -e "${YELLOW}⚠${NC} POSTGRES_PASSWORD is using default 'root'"
    fi
else
    echo -e "${RED}✗${NC} POSTGRES_PASSWORD not found in environment"
fi

if docker compose exec -T backend env 2>/dev/null | grep -q "SECRET_KEY"; then
    SECRET_SET=$(docker compose exec -T backend env 2>/dev/null | grep "SECRET_KEY" | cut -d'=' -f2)
    if [ "$SECRET_SET" != "dev-secret-key-change-in-production" ] && [ -n "$SECRET_SET" ]; then
        echo -e "${GREEN}✓${NC} SECRET_KEY is set (not default)"
    else
        echo -e "${YELLOW}⚠${NC} SECRET_KEY is using default value"
    fi
else
    echo -e "${RED}✗${NC} SECRET_KEY not found in environment"
fi

CORS_ORIGINS=$(docker compose exec -T backend env 2>/dev/null | grep "CORS_ORIGINS" | cut -d'=' -f2)
if [ "$CORS_ORIGINS" = "*" ]; then
    echo -e "${YELLOW}⚠${NC} CORS_ORIGINS is set to '*' (not secure for production)"
elif [ -n "$CORS_ORIGINS" ]; then
    echo -e "${GREEN}✓${NC} CORS_ORIGINS is set: $CORS_ORIGINS"
else
    echo -e "${RED}✗${NC} CORS_ORIGINS not set"
fi

ENV_MODE=$(docker compose exec -T backend env 2>/dev/null | grep "ENVIRONMENT" | cut -d'=' -f2)
if [ "$ENV_MODE" = "production" ]; then
    echo -e "${GREEN}✓${NC} ENVIRONMENT is set to production"
else
    echo -e "${YELLOW}⚠${NC} ENVIRONMENT is set to: ${ENV_MODE:-development}"
fi

# 5. Check Database Connections
echo ""
echo "5. Testing Database Connections..."
DB_TEST=$(docker compose exec -T backend python -c "from core.database import engines; print('OK')" 2>&1)
if [ "$DB_TEST" = "OK" ]; then
    echo -e "${GREEN}✓${NC} Database connections are working"
else
    echo -e "${RED}✗${NC} Database connection error:"
    echo "   $DB_TEST"
fi

# 6. Check Recent Logs for Errors
echo ""
echo "6. Checking Recent Backend Logs for Errors..."
ERROR_COUNT=$(docker compose logs backend --tail 50 2>/dev/null | grep -i "error\|exception\|failed" | wc -l)
if [ "$ERROR_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No recent errors in logs"
else
    echo -e "${YELLOW}⚠${NC} Found $ERROR_COUNT potential errors in last 50 log lines:"
    docker compose logs backend --tail 50 2>/dev/null | grep -i "error\|exception\|failed" | tail -5
fi

# 7. Check Port Accessibility
echo ""
echo "7. Checking Port Accessibility..."
if netstat -tuln 2>/dev/null | grep -q ":8000" || ss -tuln 2>/dev/null | grep -q ":8000"; then
    echo -e "${GREEN}✓${NC} Port 8000 is listening"
else
    echo -e "${RED}✗${NC} Port 8000 is not accessible"
fi

# 8. Check .env File
echo ""
echo "8. Checking .env File..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    if [ -r ".env" ]; then
        echo -e "${GREEN}✓${NC} .env file is readable"
    else
        echo -e "${RED}✗${NC} .env file is not readable (check permissions)"
    fi
else
    echo -e "${YELLOW}⚠${NC} .env file not found (using docker-compose.yml environment)"
fi

echo ""
echo "=========================================="
echo "  Health Check Complete"
echo "=========================================="
echo ""
echo "If you see errors above, check:"
echo "  1. docker compose logs backend"
echo "  2. docker compose ps"
echo "  3. Verify .env file settings"
echo "  4. Check CORS_ORIGINS matches your frontend URL"
echo ""
