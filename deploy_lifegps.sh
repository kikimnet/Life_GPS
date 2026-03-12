#!/bin/bash
# =============================================================================
# deploy_lifegps.sh — Déployer LifeGPS sur Web-Mobile.Apps
# Exécuter depuis le VPS 187.124.92.41
# Usage : bash /opt/lifegps/deploy_lifegps.sh
# =============================================================================

set -e
APP_DIR="/opt/lifegps"

echo "🚀 Déploiement LifeGPS..."

cd $APP_DIR

# Build + démarrage du container
docker compose build --no-cache
docker compose up -d

echo ""
echo "✅ LifeGPS démarré !"
docker ps --filter "name=lifegps" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "📋 Logs (Ctrl+C pour quitter) :"
docker logs --tail=20 lifegps
