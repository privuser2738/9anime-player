# Hot Reload Testing Guide

## Setup for Real-Time Development

### Method 1: Temporary Add-on (Recommended for Testing)

1. **Open Firefox debugging page**:
   ```
   about:debugging#/runtime/this-firefox
   ```

2. **Load the extension**:
   - Click "Load Temporary Add-on"
   - Navigate to: `/home/aseio/source/9anime-player/`
   - Select `manifest.json`

3. **Hot Reload Process**:
   - Edit any file (`content.js`, `styles.css`, etc.)
   - Go back to `about:debugging#/runtime/this-firefox`
   - Click "Reload" button next to the extension
   - Refresh the 9anime page (F5)

### Method 2: web-ext CLI (Auto Hot Reload)

Install web-ext for automatic reloading:

```bash
# Install web-ext globally
npm install -g web-ext

# OR install locally
cd /home/aseio/source/9anime-player
npm install web-ext

# Run with auto-reload
web-ext run --verbose
```

This will:
- Open Firefox with the extension loaded
- Auto-reload when files change
- Show real-time logs

## Real-Time Debugging Workflow

### Step 1: Run the Debug Inspector

1. Open Firefox and go to any 9anime watch page:
   ```
   https://9animetv.to/watch/[any-anime]?ep=[episode-id]
   ```

2. Open Developer Console (F12)

3. Copy and paste the contents of `debug-inspector.js` into the console

4. Press Enter and examine the output

### Step 2: Check Extension Logs

In the same console, filter for extension messages:
```javascript
// Type this in console to see only extension logs:
console.log('Extension logs will appear with [9Anime Player] prefix');
```

Look for:
- `[9Anime Player] Content script loaded`
- `[9Anime Player] Video element found after X attempts!`
- `[9Anime Player] Extracted info: {...}`
- `[9Anime Player] Fullscreen activated successfully!`

### Step 3: Test Navigation

Skip to near the end of an episode (or modify the code to trigger sooner):

```javascript
// Run in console to test navigation immediately:
document.dispatchEvent(new Event('DOMContentLoaded'));
```

## Quick Edit-Test Cycle

1. **Edit file** (e.g., `content.js`)
2. **Save** (Ctrl+S)
3. **Reload extension** (about:debugging → Reload button)
4. **Refresh 9anime page** (F5)
5. **Check console** for new logs
6. **Repeat**

## Common Issues

### Extension not reloading properly
- **Solution**: Click "Remove" then "Load Temporary Add-on" again

### Changes not taking effect
- **Solution**: Hard refresh the page (Ctrl+Shift+R)

### Console shows old logs
- **Solution**: Click "Clear Console" button or type `console.clear()`

## Testing Checklist

- [ ] Video detection works (check console for "Video element found")
- [ ] Fullscreen activates after clicking page
- [ ] Episode info is extracted correctly
- [ ] Next button is found
- [ ] Transition overlay appears
- [ ] Navigation to next episode works

## Useful Console Commands

```javascript
// Check if video exists
document.querySelector('video')

// Check all iframes
document.querySelectorAll('iframe')

// Find Next button
Array.from(document.querySelectorAll('a, button'))
  .filter(el => el.textContent.toLowerCase().includes('next'))

// Trigger fullscreen manually
document.documentElement.requestFullscreen()

// Check current episode from URL
new URLSearchParams(window.location.search).get('ep')
```

## Debug Mode

To enable verbose logging, add this to `content.js` at the top:
```javascript
const DEBUG = true;
```

Then wrap detailed logs:
```javascript
if (DEBUG) console.log('Detailed debug info:', ...);
```
