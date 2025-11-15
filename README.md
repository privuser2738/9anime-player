# 9Anime Continuous Player - Firefox Extension

A Firefox extension that automatically plays anime from [9animetv.to](https://9animetv.to/) continuously, with automatic episode progression and beautiful transitions between series.

## Features

- **Automatic Episode Progression**: Automatically plays the next episode when the current one ends
- **Genre-Based Series Selection**: When a series ends, automatically selects a random anime from the same genre
- **Beautiful Transitions**: Smooth fade-in/out overlay showing upcoming anime information 15-30 seconds before/after episodes
- **Fullscreen Persistence**: Automatically maintains fullscreen mode throughout playback
- **Display Awareness**: Stays on the current display (doesn't force display 1)
- **Nonstop Playback**: Designed for TV display watching - set it and forget it!

## Installation

### Method 1: Temporary Installation (for testing)

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Navigate to the extension folder and select `manifest.json`
4. The extension will be loaded until Firefox is restarted

### Method 2: Permanent Installation (unsigned)

Firefox requires extensions to be signed for permanent installation. For personal use:

1. Open Firefox and navigate to `about:config`
2. Search for `xpinstall.signatures.required`
3. Set it to `false` (Note: This reduces security. Use at your own risk)
4. Package the extension:
   ```bash
   cd /home/aseio/source/9anime-player
   zip -r 9anime-player.xpi manifest.json *.js *.css *.html *.png
   ```
5. Open Firefox and navigate to `about:addons`
6. Click the gear icon and select "Install Add-on From File"
7. Select the `9anime-player.xpi` file

### Method 3: Developer Edition (recommended for testing)

1. Use Firefox Developer Edition which allows unsigned extensions
2. Follow Method 1 steps above

## Usage

### Getting Started

1. Install the extension using one of the methods above
2. Navigate to [https://9animetv.to/](https://9animetv.to/)
3. Browse and click on any anime to start watching
4. The extension will automatically:
   - Start playing the video
   - Enter fullscreen mode
   - Show a transition overlay 30 seconds before the episode ends
   - Navigate to the next episode after a 15-second countdown
   - When the series ends, select a random anime from the same genre

### Controls

Click the extension icon in the toolbar to access controls:

- **Enable/Disable Auto-Play**: Toggle automatic episode progression
- **Auto-fullscreen**: Toggle automatic fullscreen mode
- **Show transitions**: Toggle the transition overlay

### Transition Overlay

The beautiful transition overlay appears 30 seconds before each episode ends and shows:

- Current anime title and episode number
- Upcoming anime/episode information
- Genre tags
- Countdown timer (15 seconds)

## How It Works

### Episode Progression

The extension monitors the video player and:
1. Detects when an episode is about to end (30 seconds remaining)
2. Displays the transition overlay with next episode info
3. Waits for the video to end
4. Shows a 15-second countdown
5. Automatically navigates to the next episode URL

### Series Completion

When the last episode of a series is reached:
1. The extension identifies available genres from the current anime
2. Randomly selects one of those genres
3. Fetches the genre page from 9anime
4. Randomly selects an anime from that genre
5. Navigates to the first episode of the new anime

### Fullscreen Management

The extension ensures fullscreen is maintained by:
- Automatically requesting fullscreen after page load
- Re-entering fullscreen if it's exited during playback
- Maintaining fullscreen across page navigations
- Respecting the current display (not forcing display 1)

## File Structure

```
9anime-player/
├── manifest.json       # Extension configuration
├── background.js       # Background script for state management
├── content.js          # Main content script for video control
├── popup.html          # Extension popup UI
├── popup.js            # Popup functionality
├── styles.css          # Transition overlay styles
├── icon.svg            # Extension icon (SVG)
├── icon.png            # Extension icon (PNG)
└── README.md           # This file
```

## Customization

### Adjust Transition Timing

In `content.js`, modify these values:

```javascript
// Show overlay X seconds before end (line ~167)
if (timeRemaining <= 30 && timeRemaining > 0 && !this.transitionOverlay) {
  // Change 30 to your preferred value
}

// Countdown duration (line ~265)
setTimeout(() => {
  // Navigate after X milliseconds (15000 = 15 seconds)
}, 15000);
```

### Customize Overlay Appearance

Edit `styles.css` to change colors, fonts, animations, etc.

### Modify Genre Selection Logic

In `content.js`, the `navigateToRandomAnime()` function (line ~285) handles genre selection. Modify the logic to:
- Prefer specific genres
- Weight genre selection
- Add filters (e.g., only certain types)

## Troubleshooting

### Video doesn't auto-play
- Check that auto-play is enabled in Firefox settings
- Ensure the extension has permission for 9animetv.to
- Check browser console for errors (F12)

### Fullscreen not working
- Grant fullscreen permission when prompted
- Check Firefox fullscreen settings
- Try manually entering fullscreen first

### Extension not detecting episodes
- 9anime may have changed their page structure
- Check browser console for errors
- The extension may need updates to match new site structure

### Transitions not showing
- Ensure "Show transitions" is enabled in extension popup
- Check that the overlay isn't being blocked by site scripts
- Verify z-index in styles.css (should be very high)

## Known Limitations

- Requires the 9anime site structure to remain consistent
- May not work if 9anime heavily obfuscates their video player
- Episode detection relies on URL patterns and page structure
- Genre scraping may fail if site structure changes

## Privacy

This extension:
- Does NOT collect any personal data
- Does NOT track your viewing history externally
- Only stores minimal state locally for functionality
- Only communicates with 9animetv.to

## Legal Disclaimer

This extension is for educational purposes only. Users are responsible for complying with copyright laws in their jurisdiction. The developers do not condone piracy and recommend supporting official anime distributors.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Make your changes
3. Test thoroughly with multiple anime and episodes
4. Submit a pull request

## License

MIT License - feel free to modify and distribute as needed.

## Support

For issues or questions:
- Check the Troubleshooting section above
- Review the browser console for errors
- Ensure you're using the latest version of Firefox

---

**Enjoy your continuous anime watching experience! 🎬📺**
