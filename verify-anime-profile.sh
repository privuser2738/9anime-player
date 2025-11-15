#!/bin/bash

echo "🔍 Verifying 'anime' profile setup"
echo "===================================="
echo ""

PROFILE_DIR="/home/aseio/.mozilla/firefox/xcaxkcjk.anime"

if [ ! -d "$PROFILE_DIR" ]; then
    echo "❌ Profile directory not found!"
    echo "Location: $PROFILE_DIR"
    echo ""
    echo "Run: ./create-anime-profile.sh"
    exit 1
fi

echo "✅ Profile exists: $PROFILE_DIR"
echo ""

# Check for extensions directory
EXT_DIR="$PROFILE_DIR/extensions"

if [ -d "$EXT_DIR" ]; then
    echo "✅ Extensions directory exists"
    echo ""

    # List installed extensions
    EXTENSION_COUNT=$(ls -1 "$EXT_DIR" 2>/dev/null | wc -l)

    if [ $EXTENSION_COUNT -gt 0 ]; then
        echo "📦 Installed extensions ($EXTENSION_COUNT):"
        ls -1 "$EXT_DIR"
        echo ""
    else
        echo "⚠️  No extensions installed yet"
        echo ""
    fi
else
    echo "⚠️  No extensions directory (no addons installed yet)"
    echo ""
fi

# Check for prefs file
PREFS_FILE="$PROFILE_DIR/prefs.js"

if [ -f "$PREFS_FILE" ]; then
    echo "✅ Preferences file exists"

    # Check if profile has been used
    if grep -q "browser.startup.homepage" "$PREFS_FILE" 2>/dev/null; then
        echo "✅ Profile has been configured"
    fi
else
    echo "⚠️  No preferences file (profile never used)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STATUS SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "$EXT_DIR" ] && [ $EXTENSION_COUNT -gt 0 ]; then
    echo "✅ Profile is ready to use!"
    echo ""
    echo "Launch with: ./launch-with-anime-profile.sh"
else
    echo "⚠️  Profile needs addon setup"
    echo ""
    echo "Run: ./setup-anime-addons.sh"
    echo "Then install uBlock Origin and other extensions"
fi

echo ""
