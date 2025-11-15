#!/bin/bash

echo "🔧 Setting up addons in 'anime' profile"
echo "========================================"
echo ""

PROFILE_DIR="/home/aseio/.mozilla/firefox/xcaxkcjk.anime"

echo "Profile location: $PROFILE_DIR"
echo ""

if [ ! -d "$PROFILE_DIR" ]; then
    echo "❌ Profile directory not found!"
    echo "Run ./create-anime-profile.sh first"
    exit 1
fi

echo "Step 1: Opening Firefox with 'anime' profile..."
echo ""
echo "Firefox will open in a moment."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 INSTALL THESE ADDONS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. uBlock Origin"
echo "   https://addons.mozilla.org/firefox/addon/ublock-origin/"
echo ""
echo "2. AdBlock Plus (optional)"
echo "   https://addons.mozilla.org/firefox/addon/adblock-plus/"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Once installed, CLOSE Firefox completely."
echo "Then run: ./launch-with-anime-profile.sh"
echo ""
echo "Opening Firefox now..."
sleep 2

# Open Firefox with the anime profile
firefox -P anime &

echo ""
echo "✅ Firefox opened with 'anime' profile"
echo ""
echo "After installing addons and closing Firefox:"
echo "  ./launch-with-anime-profile.sh"
echo ""
