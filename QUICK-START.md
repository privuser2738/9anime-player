# Quick Start Guide

## Fastest Way to Get Started

### 1. Install the Extension

```bash
# Navigate to the extension directory
cd /home/aseio/source/9anime-player

# Run the launch script
./launch.sh
```

Or manually:

1. Open Firefox
2. Go to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select `manifest.json` from this folder

### 2. Start Watching

1. Navigate to [https://9animetv.to/](https://9animetv.to/)
2. Click on any anime
3. The extension will automatically:
   - Play the video
   - Enter fullscreen
   - Progress through episodes
   - Transition to new anime when series ends

## Key Features at a Glance

✅ **Auto-play episodes** - No manual clicking between episodes
✅ **Auto-fullscreen** - Automatically enters and maintains fullscreen
✅ **Beautiful transitions** - Smooth overlays showing next anime (30s before end)
✅ **Genre-based selection** - Picks similar anime when series ends
✅ **Display-aware** - Stays on your current display (not forced to display 1)
✅ **Nonstop playback** - Perfect for TV display watching

## Controls

Click the extension icon (🎬) in Firefox toolbar to:
- Enable/disable auto-play
- Toggle auto-fullscreen
- Toggle transition overlays

## Files Overview

- `manifest.json` - Extension configuration
- `content.js` - Main logic (video control, episode detection)
- `background.js` - State management
- `popup.html/js` - Extension popup UI
- `styles.css` - Beautiful transition styles
- `build.sh` - Package extension as XPI
- `launch.sh` - Quick launch for testing

## Customization

### Change Transition Timing

Edit `content.js` line 167:
```javascript
if (timeRemaining <= 30 && ...) {  // Change 30 to your preferred seconds
```

Edit `content.js` line 265:
```javascript
setTimeout(() => { ... }, 15000);  // Change 15000 (15s) to your preferred delay
```

### Change Overlay Appearance

Edit `styles.css` - modify colors, fonts, animations, etc.

### Modify Genre Logic

Edit `content.js` function `navigateToRandomAnime()` (line ~285)

## Troubleshooting

**Video won't auto-play?**
- Allow auto-play in Firefox settings
- Check extension permissions

**Fullscreen not working?**
- Grant fullscreen permission when prompted
- Try manual fullscreen first (F11)

**Episode detection failing?**
- 9anime may have changed their structure
- Check browser console (F12) for errors
- Extension may need updates

**Transitions not showing?**
- Enable in extension popup
- Check z-index in styles.css
- Verify site scripts aren't blocking

## Display Management

The extension respects your current display. It will NOT force playback to display 1.

Fullscreen will be maintained on whichever display the Firefox window is currently on.

## Need Help?

1. Read the full README.md
2. Check browser console for errors (F12)
3. Verify extension is enabled (extension icon should be colored)
4. Ensure 9animetv.to is accessible

---

**Happy continuous anime watching! 🎬📺✨**
