#!/bin/bash

# Launch script for testing the extension in Firefox

echo "🚀 Launching Firefox with 9Anime Continuous Player extension..."
echo ""

# Check if Firefox is installed
if ! command -v firefox &> /dev/null; then
    echo "❌ Firefox is not installed or not in PATH"
    echo "Please install Firefox first"
    exit 1
fi

# Build the extension first
if [ ! -f "9anime-player.xpi" ]; then
    echo "📦 Building extension..."
    ./build.sh
fi

echo "📖 Opening Firefox debugging page..."
echo ""
echo "To install the extension:"
echo "1. Click 'Load Temporary Add-on' button"
echo "2. Navigate to: $(pwd)"
echo "3. Select 'manifest.json' file"
echo ""
echo "Then navigate to https://9animetv.to/ and start watching!"
echo ""

# Open Firefox to the debugging page
firefox "about:debugging#/runtime/this-firefox" &

# Wait a moment then open 9anime in a new tab
sleep 3
firefox "https://9animetv.to/" &

echo "✅ Firefox launched!"
echo ""
echo "🎬 Tips:"
echo "- The extension will auto-play videos and enter fullscreen"
echo "- Click the extension icon to adjust settings"
echo "- Transitions will appear 30 seconds before episodes end"
echo "- Enjoy continuous anime watching!"
