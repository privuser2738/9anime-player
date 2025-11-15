#!/bin/bash

echo "🎲 Switching to AUTO-JUMP version..."
echo ""

# Backup current
if [ -f "content.js" ]; then
    cp content.js content-previous.js.backup
    echo "✅ Backed up previous version"
fi

# Activate auto-jump version
cp content-autojump.js content.js
echo "✅ Activated auto-jump version"

echo ""
echo "🎲 AUTO-JUMP FEATURES:"
echo "  ✅ Genre selection (40+ genres)"
echo "  ✅ Plays 3-8 RANDOM episodes per anime"
echo "  ✅ Random order (e.g., ep 12, 24, 1, 55)"
echo "  ✅ Jumps to random anime from selected genres"
echo "  ✅ Infinite random playback!"
echo ""

# Rebuild
echo "📦 Rebuilding..."
./build.sh

echo ""
echo "🎯 HOW TO USE:"
echo "1. Launch extension"
echo "2. Click '🎯 Genres' button"
echo "3. Select genres (Action, Comedy, etc.)"
echo "4. Click 'Apply'"
echo "5. Enable '🎲 Auto-Jump' checkbox"
echo "6. Watch as it plays random episodes from random anime!"
echo ""
echo "✅ Auto-jump version ready!"
