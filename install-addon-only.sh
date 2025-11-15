#!/bin/bash

echo "📦 Installing 9Anime Player Extension to Firefox"
echo "=================================================="
echo ""

# Step 1: Build extension
echo "Step 1: Building extension..."
./build.sh
echo ""

# Get the absolute path to the extension
EXT_DIR=$(pwd)
XPI_FILE="$EXT_DIR/9anime-player.xpi"
MANIFEST_FILE="$EXT_DIR/manifest.json"

echo "Extension location:"
echo "  Directory: $EXT_DIR"
echo "  XPI file:  $XPI_FILE"
echo ""

# Step 2: Choose installation method
echo "Choose installation method:"
echo ""
echo "1. Temporary (until Firefox closes)"
echo "   - Quick and easy"
echo "   - Need to reinstall when Firefox restarts"
echo ""
echo "2. Permanent (stays installed)"
echo "   - Requires disabling signature verification"
echo "   - Extension persists across restarts"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
  1)
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "TEMPORARY INSTALLATION"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Step 2: Opening Firefox debugging page..."
    firefox "about:debugging#/runtime/this-firefox" &
    sleep 2

    echo ""
    echo "Step 3: In Firefox that just opened:"
    echo ""
    echo "  1. Click 'Load Temporary Add-on' button"
    echo ""
    echo "  2. Navigate to and select:"
    echo "     $MANIFEST_FILE"
    echo ""
    echo "  3. Extension will be loaded!"
    echo ""
    echo "✅ Extension is now installed (temporary)"
    echo ""
    echo "Note: Extension will be removed when Firefox closes."
    echo "      Run this script again to reinstall."
    ;;

  2)
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "PERMANENT INSTALLATION"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "⚠️  Warning: This requires disabling Firefox signature verification"
    echo "    This is a security feature. Only proceed if you understand the risks."
    echo ""
    read -p "Continue? (y/n): " confirm

    if [ "$confirm" != "y" ]; then
      echo "Installation cancelled."
      exit 0
    fi

    echo ""
    echo "Step 2: Disable signature verification..."
    echo ""
    echo "  1. Open Firefox (if not already open)"
    echo "  2. Type in address bar: about:config"
    echo "  3. Click 'Accept the Risk and Continue'"
    echo "  4. Search for: xpinstall.signatures.required"
    echo "  5. Click the toggle to set it to: false"
    echo ""
    read -p "Press Enter when you've completed the above steps..."

    echo ""
    echo "Step 3: Opening Firefox add-ons page..."
    firefox "about:addons" &
    sleep 2

    echo ""
    echo "Step 4: In Firefox add-ons page:"
    echo ""
    echo "  1. Click the ⚙️ gear icon"
    echo "  2. Select 'Install Add-on From File...'"
    echo "  3. Navigate to and select:"
    echo "     $XPI_FILE"
    echo "  4. Click 'Add' when prompted"
    echo ""
    echo "✅ Extension is now permanently installed!"
    echo ""
    echo "To restore security (after installation):"
    echo "  1. Go to: about:config"
    echo "  2. Set xpinstall.signatures.required back to: true"
    ;;

  *)
    echo "Invalid choice. Exiting."
    exit 1
    ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 QUICK REFERENCE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Extension files:"
echo "  📁 Source:   $EXT_DIR"
echo "  📦 Package:  $XPI_FILE"
echo "  📄 Manifest: $MANIFEST_FILE"
echo ""
echo "To update after making changes:"
echo "  ./update.sh"
echo ""
echo "To reinstall:"
echo "  ./install-addon-only.sh"
echo ""
echo "✅ Done!"
