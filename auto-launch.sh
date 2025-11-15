#!/bin/bash

# Auto-launch script that actually loads the extension automatically

echo "🚀 9Anime Player - Auto-Launch with Extension Pre-loaded"
echo "=========================================================="
echo ""

# Check if web-ext is installed
if command -v web-ext &> /dev/null; then
    echo "✅ web-ext found - using auto-reload mode"
    echo ""
    echo "Starting Firefox with extension auto-loaded..."
    echo "The extension will reload automatically when you edit files!"
    echo ""

    echo "Choose launch mode:"
    echo "1. New profile (clean, no other addons)"
    echo "2. Use existing Firefox profile (with your addons)"
    echo ""
    read -p "Enter choice (1 or 2): " choice

    if [ "$choice" = "2" ]; then
        echo ""
        echo "Available Firefox profiles:"
        echo ""

        # List Firefox profiles
        if [ -d "$HOME/.mozilla/firefox" ]; then
            ls -1 "$HOME/.mozilla/firefox" | grep -v "^Crash" | grep -v "^Pending" | nl
            echo ""
            read -p "Enter profile name (or press Enter for default): " profile_name

            if [ -n "$profile_name" ]; then
                echo "Launching with profile: $profile_name"
                web-ext run \
                    --start-url "https://9animetv.to/" \
                    --firefox-profile "$HOME/.mozilla/firefox/$profile_name" \
                    --keep-profile-changes \
                    --verbose \
                    --browser-console
            else
                echo "Launching with default profile..."
                web-ext run \
                    --start-url "https://9animetv.to/" \
                    --keep-profile-changes \
                    --verbose \
                    --browser-console
            fi
        else
            echo "❌ Firefox profiles directory not found"
            echo "Launching with new profile..."
            web-ext run \
                --start-url "https://9animetv.to/" \
                --verbose \
                --browser-console
        fi
    else
        echo "Launching with new clean profile..."
        web-ext run \
            --start-url "https://9animetv.to/" \
            --verbose \
            --browser-console
    fi

else
    echo "❌ web-ext not found"
    echo ""
    echo "Installing web-ext for auto-reload functionality..."
    echo ""

    # Check if npm is installed
    if command -v npm &> /dev/null; then
        echo "📦 Installing web-ext globally..."
        sudo npm install -g web-ext

        if [ $? -eq 0 ]; then
            echo "✅ web-ext installed successfully!"
            echo ""
            echo "Running launch again..."
            exec "$0"
        else
            echo "❌ Failed to install web-ext"
            echo ""
            echo "Manual installation:"
            echo "  npm install -g web-ext"
            echo ""
            echo "Or install locally:"
            echo "  cd $(pwd)"
            echo "  npm install web-ext"
            echo "  npx web-ext run --start-url 'https://9animetv.to/'"
        fi
    else
        echo "❌ npm not found. Please install Node.js first:"
        echo "  https://nodejs.org/"
        echo ""
        echo "Falling back to manual mode..."
        ./launch.sh
    fi
fi
