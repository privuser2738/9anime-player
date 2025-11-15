# 9Anime Downloader CLI

Random anime episode downloader - downloads one random episode from random anime titles (2020+).

## Features

- ✅ Interactive CLI (no GUI needed)
- ✅ Search anime by genre
- ✅ Filter by release year (2020+)
- ✅ Download random episodes from random anime
- ✅ One episode per anime title
- ✅ Configurable output folder
- ✅ Persistent settings
- ✅ Progress indicators
- ✅ Binary build for easy distribution

## Requirements

- Node.js 18+ (for running from source)
- `yt-dlp` installed and in PATH
  ```bash
  # Install yt-dlp
  sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
  sudo chmod a+rx /usr/local/bin/yt-dlp
  ```

## Installation

### Option 1: Quick Start (Recommended)

```bash
cd downloader-cli
./install-and-run.sh
```

### Option 2: Run from Source

```bash
cd downloader-cli
npm install
node index.js
```

### Option 3: Install Globally

```bash
cd downloader-cli
npm install
npm install -g .
9anime-dl
```

### Option 4: Build Binary

Build a standalone 64MB executable that doesn't require Node.js to be installed:

```bash
cd downloader-cli
./build-binary-linux.sh
./bin/9anime-dl
```

To make it globally available:
```bash
sudo ln -s $(pwd)/bin/9anime-dl /usr/local/bin/9anime-dl
```

## Usage

1. **Launch the CLI:**
   ```bash
   node index.js
   # or
   ./bin/9anime-dl
   ```

2. **First time setup:**
   - Choose "Settings" from main menu
   - Set output folder (where videos will be saved)

3. **Download from URL (Recommended):**
   - Choose "🔗 Download from URL (anify.to)"
   - Paste video URL (e.g., `https://anify.to/watch/9952/star-wars-visions/2`)
   - Enter custom filename (optional)
   - Wait for download to complete

4. **Random anime (Experimental - has streaming issues):**
   - Choose "🎬 Random anime (9anime - experimental)"
   - Select genre (default: Game)
   - Enter number of anime to download (default: 5)
   - Wait for downloads to complete
   - **Note**: May fail due to 9anime streaming issues

## How It Works

### URL Download (anify.to)
1. User provides anify.to video URL
2. Puppeteer navigates to the page
3. Extracts actual video source URL from player
4. Downloads using yt-dlp
5. Saves to configured output folder

### Random Download (9anime - experimental)
1. Searches 9anime for anime in selected genre
2. Filters results to 2020+ releases
3. Randomly selects requested number of anime
4. For each anime:
   - Uses Puppeteer to fetch episode list
   - Picks ONE random episode
   - Navigates to rapid-cloud.co player
   - Extracts video URL
   - Downloads using yt-dlp
5. Saves videos to configured output folder
6. **Note**: May fail due to 9anime streaming issues

## Configuration

Settings are stored in: `~/.9anime-downloader/config.json`

Default settings:
```json
{
  "outputDir": "./anime-downloads",
  "lastGenre": "Game",
  "lastCount": 5,
  "minYear": 2020,
  "quality": "best"
}
```

## Examples

**Download from anify.to URL (Recommended):**
```
Main Menu → Download from URL (anify.to)
URL: https://anify.to/watch/9952/star-wars-visions/2
Filename: star-wars-visions-ep2
```

**Download 5 random Game anime episodes (Experimental):**
```
Main Menu → Random anime (9anime - experimental)
Genre: Game
Count: 5
```

**Download 10 random Action anime episodes (Experimental):**
```
Main Menu → Random anime (9anime - experimental)
Genre: Action
Count: 10
```

## Troubleshooting

**"yt-dlp not found"**
- Install yt-dlp: `sudo pip install yt-dlp`
- Or download binary: https://github.com/yt-dlp/yt-dlp

**"No anime found"**
- Try different genre
- Check internet connection
- 9anime might be down

**Download fails**
- Check yt-dlp is working: `yt-dlp --version`
- Try updating yt-dlp: `pip install -U yt-dlp`
- Some videos may have DRM protection

## Project Structure

```
downloader-cli/
├── index.js              # Main CLI entry point
├── lib/
│   ├── config.js         # Settings manager
│   ├── scraper.js        # 9anime scraper
│   └── downloader.js     # yt-dlp wrapper
├── bin/
│   └── 9anime-dl         # Compiled binary (after build)
├── build-binary-linux.sh # Build script
├── package.json
└── README.md
```

## License

MIT
