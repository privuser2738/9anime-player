# Testing with Your Existing Firefox Profile & Addons

## Quick Commands

### Option 1: Use Auto-Launch Script (Interactive)
```bash
cd /home/aseio/source/9anime-player
./auto-launch.sh

# Then choose:
# 1 = New clean profile (no addons)
# 2 = Use your existing profile (with all your addons)
```

### Option 2: Direct web-ext Commands

**With your existing Firefox profile (keeps all addons):**
```bash
cd /home/aseio/source/9anime-player

# Find your Firefox profile name
ls ~/.mozilla/firefox/

# Look for a folder like: xxxxxxxx.default-release
# Use that name:

web-ext run \
  --firefox-profile ~/.mozilla/firefox/YOUR_PROFILE_NAME.default-release \
  --keep-profile-changes \
  --start-url "https://9animetv.to/"
```

**Quick version (uses default profile):**
```bash
cd /home/aseio/source/9anime-player

web-ext run \
  --keep-profile-changes \
  --start-url "https://9animetv.to/"
```

**New clean profile (no other addons):**
```bash
cd /home/aseio/source/9anime-player

web-ext run --start-url "https://9animetv.to/"
```

## Finding Your Firefox Profile

### Method 1: Via Firefox
1. Open Firefox
2. Type in address bar: `about:profiles`
3. Look for "Root Directory" under your default profile
4. Copy the path

### Method 2: Via Terminal
```bash
# List all profiles
ls -la ~/.mozilla/firefox/

# Look for folders ending in .default-release or .default
# Example: abc12345.default-release
```

### Method 3: Check profiles.ini
```bash
cat ~/.mozilla/firefox/profiles.ini
```

## Benefits of Using Existing Profile

✅ **Keep your addons**: uBlock Origin, ad blockers, etc.
✅ **Keep your settings**: Dark mode, preferences, etc.
✅ **Keep your data**: Bookmarks, passwords (if you want)
✅ **Realistic testing**: Test with your actual browsing setup

## Important Notes

### Ad Blockers
If you use ad blockers (uBlock Origin, etc.):
- They may **block video servers** on 9anime
- This causes "video cannot be played" errors
- **Solution**: Disable ad blocker on 9animetv.to for testing

### Privacy Extensions
Extensions like Privacy Badger, NoScript may:
- Block video loading
- Block JavaScript needed for player
- **Solution**: Whitelist 9animetv.to temporarily

## Recommended Setup for Testing

1. **Use your existing profile** (keeps your addons)
2. **Whitelist 9animetv.to** in your ad blocker
3. **Disable strict privacy settings** for 9animetv.to
4. **Allow autoplay** for the site

### Quick Ad Blocker Settings

**uBlock Origin:**
1. Click uBlock icon on 9anime page
2. Click the big power button (turns gray)
3. Refresh page

**AdBlock/AdBlock Plus:**
1. Click extension icon
2. Select "Don't run on pages on this site"
3. Refresh page

## Testing Workflow with Your Addons

```bash
# 1. Launch with your profile
cd /home/aseio/source/9anime-player
./auto-launch.sh
# Choose option 2

# 2. Firefox opens with your addons

# 3. Navigate to 9anime (or it opens automatically)

# 4. Disable ad blocker on the site

# 5. Select an anime from "Recently Updated"

# 6. Press F12 (open console)

# 7. Look for [9Anime Player] messages

# 8. Click page to enable fullscreen

# 9. Test the features!
```

## Hot Reload with Your Profile

When using your profile with web-ext:

1. Edit `content.js` or any file
2. Save the file
3. **Extension auto-reloads!** (web-ext magic)
4. Refresh the 9anime page
5. Changes take effect immediately

No need to manually reload in about:debugging!

## Troubleshooting

### "Profile is in use"
- Close all Firefox windows first
- Then run web-ext

### "Cannot find profile"
- Use absolute path: `--firefox-profile ~/.mozilla/firefox/xxx.default-release`
- Or let web-ext use default: just use `--keep-profile-changes`

### Extensions conflict
If the anime extension conflicts with your other extensions:
- Use clean profile (option 1) for testing
- Debug in isolation
- Then test with full profile

## Best Practice

**Development:**
- Use clean profile for initial development
- Fast, isolated testing

**Final Testing:**
- Use your real profile with all addons
- Test in realistic environment
- Ensure compatibility

---

**Quick Start:** Just run `./auto-launch.sh` and choose option 2! 🚀
