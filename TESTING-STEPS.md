# Step-by-Step Testing Guide

## 🎯 Goal
Get the extension working and identify why autoplay/fullscreen/navigation aren't working.

## 📋 Testing Process

### STEP 1: Load Extension Properly

**Option A: Auto-load with web-ext (RECOMMENDED)**
```bash
cd /home/aseio/source/9anime-player

# Install web-ext if not installed
npm install -g web-ext

# Run with auto-reload
web-ext run --start-url "https://9animetv.to/watch/demon-slayer-kimetsu-no-yaiba-47?ep=952"
```
This will:
- Open Firefox automatically
- Load the extension automatically
- Open the test page
- Auto-reload when you edit files

**Option B: Manual load**
```bash
# 1. Open Firefox
firefox "about:debugging#/runtime/this-firefox"

# 2. Click "Load Temporary Add-on"
# 3. Navigate to: /home/aseio/source/9anime-player/
# 4. Select: manifest.json
# 5. Open a new tab: https://9animetv.to/watch/demon-slayer-kimetsu-no-yaiba-47?ep=952
```

### STEP 2: Open Developer Console

1. Press **F12** on the 9anime watch page
2. Click the **Console** tab
3. Look for messages starting with `[9Anime Player]`

**Expected output:**
```
[9Anime Player] Content script loaded
[9Anime Player] URL: https://9animetv.to/watch/...
[9Anime Player] Frame: main
[9Anime Player DEBUG] Document readyState: ...
```

**If you see nothing** → Extension is NOT loaded or content script not injecting!

### STEP 3: Run Diagnostic Test

1. Copy the entire contents of `diagnostic-test.js`
2. Paste into the Console
3. Press Enter
4. Examine the output

**What to look for:**
- ✅ Video found (in main doc or iframe)
- ✅ On watch page
- ✅ Next button found
- ✅ Episode ID found

### STEP 4: Identify Issues

Based on diagnostic output:

#### Issue: "Content script NOT injected"
**Solution:**
```bash
# 1. Rebuild extension
./build.sh

# 2. Reload in Firefox
# Go to: about:debugging#/runtime/this-firefox
# Click "Reload" next to extension

# 3. Hard refresh page
# Press Ctrl+Shift+R on 9anime page
```

#### Issue: "Video NOT FOUND"
**Check diagnostic output:**
- Is video in an iframe?
- Is iframe cross-origin blocked?
- Is page still loading?

**Solution:**
- Wait for page to fully load
- Check if ad-blocker is interfering
- Look at iframe src in diagnostic output

#### Issue: "Next button NOT FOUND"
**Check diagnostic output for button structure**

**Solution:**
- May be on last episode (expected)
- Button might have different text/class
- Check what diagnostic found

### STEP 5: Test Individual Functions

#### Test Autoplay Manually:
```javascript
// In console:
const video = document.querySelector('video');
if (video) {
  video.play().then(() => console.log('✅ Play worked'))
    .catch(err => console.log('❌ Play failed:', err));
}
```

#### Test Fullscreen Manually:
```javascript
// In console (must click page first!):
document.documentElement.requestFullscreen()
  .then(() => console.log('✅ Fullscreen worked'))
  .catch(err => console.log('❌ Fullscreen failed:', err));
```

#### Test Next Button Click:
```javascript
// In console:
const nextBtn = Array.from(document.querySelectorAll('a, button'))
  .find(el => el.textContent.toLowerCase().includes('next'));
if (nextBtn) {
  console.log('Found button:', nextBtn);
  nextBtn.click();
  console.log('Clicked!');
}
```

### STEP 6: Check Extension Logs

Look in console for extension activity:

```
[9Anime Player] Waiting for video element...
[9Anime Player] Video element found after X attempts!
[9Anime Player] Extracted info: {...}
[9Anime Player] Navigation result: {...}
```

**If logs stop at a certain point** → That's where the issue is!

### STEP 7: Hot Reload Testing

If you need to make changes:

1. **Edit file** (e.g., `content.js`)
2. **Save** (Ctrl+S)
3. **Reload extension**:
   ```
   about:debugging#/runtime/this-firefox → Reload button
   ```
4. **Hard refresh page**: Ctrl+Shift+R
5. **Check console** for new logs

## 🐛 Common Issues & Solutions

### Issue: Extension loads but nothing happens

**Cause:** Content script not injecting on the page

**Check:**
```javascript
// In console:
window.location.href  // Should include "/watch/"
```

**Solution:**
- Ensure you're on a `/watch/*` page
- Check manifest.json content_scripts matches pattern
- Reload extension

### Issue: "Autoplay failed" in console

**Cause:** Browser blocks autoplay without user interaction

**Solution:** Click anywhere on the page first

### Issue: "Fullscreen request failed"

**Cause:** Browser requires user interaction for fullscreen

**Solution:**
1. Click the page
2. Extension should detect interaction and try again

### Issue: "No next episode URL available"

**Cause:** Can't find Next button or episode list

**Solution:**
1. Run diagnostic-test.js
2. Look at "NEXT BUTTON DETECTION" section
3. Check what buttons were found
4. Share output so we can fix the selector

## 📊 What to Report

If it's still not working, provide:

1. **Console output** (copy all `[9Anime Player]` messages)
2. **Diagnostic test output** (sections 1-9)
3. **URL of the page** you're testing on
4. **What happens** vs **what you expect**

Example:
```
URL: https://9animetv.to/watch/demon-slayer-kimetsu-no-yaiba-47?ep=952

Console shows:
[9Anime Player] Content script loaded
[9Anime Player] Video element found after 5 attempts!

Diagnostic shows:
✅ Video found in iframe
✅ Next button found
✅ Episode ID: 952

BUT:
❌ Video doesn't autoplay
❌ Fullscreen doesn't activate
❌ Doesn't navigate to next episode
```

## 🎬 Success Criteria

Extension is working when you see:

1. ✅ Console: `[9Anime Player] Content script loaded`
2. ✅ Console: `[9Anime Player] Video element found`
3. ✅ Notification appears on page: "9Anime Player Active!"
4. ✅ Video plays automatically (or after clicking page)
5. ✅ Fullscreen activates (after clicking page)
6. ✅ Transition overlay appears 30s before episode ends
7. ✅ Navigates to next episode after countdown

---

**Start with STEP 1 and work through each step!** 🚀
