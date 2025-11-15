#!/bin/bash

# Build script for 9Anime Continuous Player extension

echo "🎬 Building 9Anime Continuous Player extension..."

# Clean previous build
rm -f 9anime-player.xpi
rm -f 9anime-player.zip

# Create XPI package (for Firefox)
zip -r 9anime-player.xpi \
  manifest.json \
  background.js \
  content.js \
  popup.html \
  popup.js \
  styles.css \
  icon.png \
  -x "*.git*" "*.sh" "*.md" "*.svg" ".claude/*"

echo "✅ Extension packaged as 9anime-player.xpi"
echo ""
echo "Installation instructions:"
echo "1. Open Firefox and go to about:debugging#/runtime/this-firefox"
echo "2. Click 'Load Temporary Add-on'"
echo "3. Select the 9anime-player.xpi file"
echo ""
echo "Or for permanent installation:"
echo "1. Go to about:addons"
echo "2. Click the gear icon → Install Add-on From File"
echo "3. Select the 9anime-player.xpi file"
echo ""
echo "Note: For permanent installation, you may need to disable signature"
echo "verification in about:config (xpinstall.signatures.required = false)"
echo ""
echo "🎉 Build complete! Happy anime watching!"
