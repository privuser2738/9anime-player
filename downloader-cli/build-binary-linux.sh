#!/bin/bash

echo "🔨 Building 9anime-downloader-cli binary for Linux..."
echo ""

# Install dependencies if needed (includes pkg)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build binary using npx (no global install needed)
echo "🏗️  Building binary..."
npx pkg . --targets node18-linux-x64 --output bin/9anime-dl

if [ $? -eq 0 ]; then
    chmod +x bin/9anime-dl
    echo ""
    echo "✅ Build complete!"
    echo "📍 Binary location: bin/9anime-dl"
    echo ""
    echo "To run:"
    echo "  ./bin/9anime-dl"
    echo ""
    echo "Or add to PATH:"
    echo "  sudo ln -s $(pwd)/bin/9anime-dl /usr/local/bin/9anime-dl"
    echo ""
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi
