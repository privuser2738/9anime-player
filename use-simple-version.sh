#!/bin/bash

# Script to switch to the simple click-based version

echo "🔄 Switching to SIMPLE version..."
echo ""

# Backup current content.js
if [ -f "content.js" ]; then
    cp content.js content-complex.js.backup
    echo "✅ Backed up complex version to: content-complex.js.backup"
fi

# Copy simple version to content.js
cp content-simple.js content.js
echo "✅ Activated simple version"

echo ""
echo "📝 Simple Version Features:"
echo "  ✅ Auto-clicks play button on page load"
echo "  ✅ Finds next episode from episode list"
echo "  ✅ Auto-advances after video ends (or 20min timer)"
echo "  ✅ Simulates clicks to bypass restrictions"
echo "  ✅ Simple URL-based navigation"
echo ""

# Rebuild extension
echo "📦 Rebuilding extension..."
./build.sh

echo ""
echo "🎯 Next Steps:"
echo "1. Reload extension in Firefox:"
echo "   about:debugging#/runtime/this-firefox → Reload"
echo ""
echo "2. Or use web-ext auto-reload:"
echo "   web-ext run --start-url 'https://9animetv.to/watch/swallowed-star-2nd-season-18018?ep=101318'"
echo ""
echo "3. Check console for: [9Anime AutoPlay] messages"
echo ""
echo "✅ Simple version ready!"
