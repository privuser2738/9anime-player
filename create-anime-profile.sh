#!/bin/bash

echo "🎬 Creating dedicated 'anime' Firefox profile..."
echo ""

# Create profile using Firefox profile manager
echo "Step 1: Creating profile..."
firefox -CreateProfile "anime"

if [ $? -eq 0 ]; then
    echo "✅ Profile 'anime' created successfully"
else
    echo "⚠️  Profile may already exist or creation failed"
fi

echo ""
echo "Step 2: Finding profile directory..."

# Find the profile directory
PROFILE_DIR=$(find ~/.mozilla/firefox -maxdepth 1 -name "*.anime" -type d | head -1)

if [ -z "$PROFILE_DIR" ]; then
    echo "⚠️  Profile directory not found. Listing all profiles:"
    ls -1 ~/.mozilla/firefox/ | grep -E "\..*"
    echo ""
    echo "Please manually find the .anime profile above"
    PROFILE_DIR="~/.mozilla/firefox/XXXXX.anime"
else
    echo "✅ Found profile: $PROFILE_DIR"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SETUP INSTRUCTIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Step 3: Install your addons in the anime profile"
echo ""
echo "Run this command:"
echo "  firefox -P anime"
echo ""
echo "This will open Firefox with the 'anime' profile."
echo ""
echo "Then install your addons:"
echo "  1. uBlock Origin"
echo "  2. AdBlock Plus"
echo "  3. Any other extensions you want"
echo ""
echo "Close Firefox when done."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 USAGE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Once addons are installed, use this command to test:"
echo ""
echo "  web-ext run \\"
echo "    --firefox-profile \"$PROFILE_DIR\" \\"
echo "    --start-url 'https://9animetv.to/watch/swallowed-star-2nd-season-18018?ep=101318'"
echo ""
echo "Or use the quick launch script (will be created)..."
echo ""

# Create quick launch script
cat > launch-with-anime-profile.sh << LAUNCH_EOF
#!/bin/bash

# Quick launch with anime profile
cd /home/aseio/source/9anime-player

echo "🎬 Launching with 'anime' profile..."

web-ext run \\
  --firefox-profile "$PROFILE_DIR" \\
  --start-url "https://9animetv.to/" \\
  --verbose
LAUNCH_EOF

chmod +x launch-with-anime-profile.sh

echo "✅ Created: launch-with-anime-profile.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Setup addons (one time):"
echo "   firefox -P anime"
echo ""
echo "2. Launch extension with anime profile:"
echo "   ./launch-with-anime-profile.sh"
echo ""
echo "Your addons will be saved in the profile and available every time!"
echo ""
echo "✅ Done!"
