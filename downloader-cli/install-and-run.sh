#!/bin/bash

echo "📦 Installing 9anime-downloader-cli..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "You can now run the downloader with:"
echo "  node index.js"
echo ""
echo "Or install globally with:"
echo "  npm install -g ."
echo "  (Then run: 9anime-dl from anywhere)"
echo ""

read -p "Would you like to run it now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    node index.js
fi
