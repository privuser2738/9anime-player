#!/bin/bash

echo "🔄 Updating 9Anime Player Extension"
echo "====================================="
echo ""

# Just rebuild - web-ext will auto-reload it
echo "📦 Rebuilding extension..."
./build.sh

echo ""
echo "✅ Extension rebuilt!"
echo ""
echo "If you're using web-ext run:"
echo "  → Extension will auto-reload in Firefox"
echo ""
echo "If you loaded it manually (about:debugging):"
echo "  1. Go to: about:debugging#/runtime/this-firefox"
echo "  2. Click 'Reload' button next to the extension"
echo "  3. Refresh your anime page (Ctrl+Shift+R)"
echo ""
