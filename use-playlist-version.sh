#!/bin/bash

echo "🎬 Switching to PLAYLIST version..."
echo ""

# Backup current
if [ -f "content.js" ]; then
    cp content.js content-previous.js.backup
    echo "✅ Backed up previous version"
fi

# Activate playlist version
cp content-playlist.js content.js
echo "✅ Activated playlist version"

echo ""
echo "📝 Playlist Version Features:"
echo "  ✅ Extracts ALL episode links from page"
echo "  ✅ Creates beautiful GUI playlist on right side"
echo "  ✅ Shows all episodes with play status"
echo "  ✅ Previous/Next/Play/Pause/Fullscreen controls"
echo "  ✅ Auto-advances to next episode when current ends"
echo "  ✅ LOOPS back to Episode 1 when reaching the end"
echo "  ✅ Keyboard shortcuts: ← → Space F"
echo "  ✅ Click any episode to jump to it"
echo ""

# Rebuild
echo "📦 Rebuilding..."
./build.sh

echo ""
echo "🎯 Test it:"
echo "web-ext run --keep-profile-changes --start-url 'https://9animetv.to/watch/swallowed-star-2nd-season-18018?ep=101318'"
echo ""
echo "✅ Playlist player ready!"
