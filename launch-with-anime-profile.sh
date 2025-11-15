#!/bin/bash

# Quick launch with anime profile
cd /home/aseio/source/9anime-player

echo "🎬 Launching with 'anime' profile..."

web-ext run \
  --firefox-profile "/home/aseio/.mozilla/firefox/xcaxkcjk.anime" \
  --start-url "https://9animetv.to/" \
  --verbose
