#!/bin/bash

echo "🎬 9Anime Player - Build & Auto-Install"
echo "========================================"
echo ""

# Step 1: Build extension
echo "📦 Building extension..."
./build.sh
echo ""

# Step 2: Choose profile
echo "Choose Firefox profile:"
echo "1. Default profile (your normal Firefox with all addons)"
echo "2. Anime profile (dedicated profile at ~/.mozilla/firefox/xcaxkcjk.anime)"
echo "3. New temporary profile (clean, no addons)"
echo ""
read -p "Enter choice (1/2/3): " choice

case $choice in
  1)
    echo ""
    echo "🚀 Installing & launching with DEFAULT profile..."
    echo "   (Your normal Firefox addons will be available)"
    echo ""
    web-ext run \
      --keep-profile-changes \
      --start-url "https://9animetv.to/" \
      --verbose
    ;;

  2)
    ANIME_PROFILE="/home/aseio/.mozilla/firefox/xcaxkcjk.anime"

    if [ ! -d "$ANIME_PROFILE" ]; then
      echo ""
      echo "❌ Anime profile not found!"
      echo "Creating it now..."
      ./create-anime-profile.sh
      echo ""
      echo "Now run: ./setup-anime-addons.sh"
      echo "Then run this script again"
      exit 1
    fi

    echo ""
    echo "🚀 Installing & launching with ANIME profile..."
    echo "   (Using: $ANIME_PROFILE)"
    echo ""
    web-ext run \
      --firefox-profile "$ANIME_PROFILE" \
      --start-url "https://9animetv.to/" \
      --verbose
    ;;

  3)
    echo ""
    echo "🚀 Installing & launching with NEW temporary profile..."
    echo "   (Clean Firefox, no other addons)"
    echo ""
    web-ext run \
      --start-url "https://9animetv.to/" \
      --verbose
    ;;

  *)
    echo "Invalid choice. Exiting."
    exit 1
    ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ℹ️  Extension auto-reloads when you edit files!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
