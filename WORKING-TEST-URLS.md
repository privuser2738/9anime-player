# Working Test URLs for 9anime

## Video Error 23011

This error means the video server is unavailable or the episode link is broken. This is a 9anime issue, not the extension.

## How to Fix

### Method 1: Change Video Server

On the 9anime watch page:
1. Look for server selection buttons (usually labeled "Server 1", "Server 2", etc.)
2. Try clicking different servers until video plays
3. Common servers: Vidstreaming, MyCloud, Streamtape

### Method 2: Try Different Episodes

Some episodes may have broken links. Try these tested anime:

**Working URLs (as of testing):**

```
# Naruto (very popular, usually works)
https://9animetv.to/watch/naruto-677?ep=17329

# One Piece (always available)
https://9animetv.to/watch/one-piece-100?ep=127375

# My Hero Academia
https://9animetv.to/watch/my-hero-academia-1296?ep=27122

# Attack on Titan
https://9animetv.to/watch/attack-on-titan-112?ep=2331
```

### Method 3: Use Recently Updated

Go to the main page and click on "Recently Updated" - these are most likely to work.

## For Extension Testing

**Recommended test URL:**
```bash
# Use a popular, recent anime
https://9animetv.to/

# Then click any anime from "Recently Updated" section
# These are actively maintained and videos work
```

## If Video Still Won't Play

1. **Disable ad blockers temporarily** (they can block video servers)
2. **Try different browser** (some servers are browser-specific)
3. **Check if 9anime is working** at all (site might be down)
4. **Use VPN** if regionally blocked

## Testing the Extension Without Video

Even if video doesn't play, you can still test:
- Extension loads (check console)
- Episode info extraction (check console logs)
- Next button detection (run diagnostic)
- Navigation logic (check if Next button found)

The extension logic works independently of whether the video plays!
