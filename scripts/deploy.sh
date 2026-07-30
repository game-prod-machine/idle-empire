#!/bin/bash
# Deploy to itch.io via Butler
set -e

ITCH_USER="${ITCH_USER:-your-itch-username}"
ITCH_GAME="${ITCH_GAME:-your-game-slug}"
CHANNEL="html5"

npm run build
butler push dist/ "$ITCH_USER/$ITCH_GAME:$CHANNEL" --userversion "$(date +%s)"
echo "🚀 Deployed to https://$ITCH_USER.itch.io/$ITCH_GAME"
