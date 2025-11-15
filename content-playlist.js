// 9Anime Playlist Player - Custom GUI with full control
console.log('[9Anime Playlist] Loading...');

class PlaylistPlayer {
  constructor() {
    this.episodes = [];
    this.currentIndex = 0;
    this.currentEpisodeId = null;
    this.player = null;
    this.playlist = null;
    this.autoplay = true;
    this.loop = true;
    this.autoJump = false;
    this.selectedGenres = [];
    this.randomEpisodeQueue = [];
    this.episodesWatchedInCurrentAnime = 0;
    this.targetEpisodesForCurrentAnime = 0;

    // 9anime genres list
    this.availableGenres = [
      'Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy',
      'Horror', 'Isekai', 'Magic', 'Mecha', 'Music', 'Mystery',
      'Psychological', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports',
      'Supernatural', 'Thriller', 'Shounen', 'Shoujo', 'Seinen', 'Josei'
    ];

    this.init();
  }

  init() {
    console.log('[9Anime Playlist] Initializing...');

    // Get current episode from URL
    const urlParams = new URLSearchParams(window.location.search);
    this.currentEpisodeId = urlParams.get('ep');
    console.log('[9Anime Playlist] Current episode ID from URL:', this.currentEpisodeId);

    // Wait for page to load, then extract episodes
    // Try multiple times with increasing delays
    this.tryExtractEpisodes(0);
  }

  tryExtractEpisodes(attempt) {
    const delays = [2000, 4000, 6000]; // Try at 2s, 4s, 6s
    const delay = delays[attempt] || 6000;

    console.log('[9Anime Playlist] Attempt', attempt + 1, 'in', delay, 'ms...');

    setTimeout(() => {
      this.extractEpisodes();

      if (this.episodes.length > 0) {
        console.log('[9Anime Playlist] ✅ Episodes found!');
        setTimeout(() => this.createPlayerGUI(), 500);
      } else if (attempt < delays.length - 1) {
        console.log('[9Anime Playlist] No episodes yet, retrying...');
        this.tryExtractEpisodes(attempt + 1);
      } else {
        console.error('[9Anime Playlist] ❌ Failed to find episodes after', delays.length, 'attempts');
        this.createPlayerGUI(); // Will show error
      }
    }, delay);
  }

  extractEpisodes() {
    console.log('[9Anime Playlist] Extracting episodes...');

    // Wait a bit for page to load episode list
    const episodeMap = new Map();

    // Try multiple selectors to find episode links
    const selectors = [
      'a[href*="?ep="]',
      '[data-id]',
      '.ep-item',
      '.episode-item',
      '[class*="ep-"]',
      '[class*="episode"]'
    ];

    let episodeLinks = [];

    for (const selector of selectors) {
      const elements = Array.from(document.querySelectorAll(selector));
      console.log('[9Anime Playlist] Selector', selector, 'found', elements.length, 'elements');

      if (elements.length > 0) {
        episodeLinks = elements;
        break;
      }
    }

    // Also check all links on the page
    const allLinks = Array.from(document.querySelectorAll('a'));
    console.log('[9Anime Playlist] Total links on page:', allLinks.length);

    const epLinks = allLinks.filter(a => a.href && a.href.includes('?ep='));
    console.log('[9Anime Playlist] Links with ?ep=:', epLinks.length);

    if (epLinks.length > episodeLinks.length) {
      episodeLinks = epLinks;
    }

    console.log('[9Anime Playlist] Processing', episodeLinks.length, 'episode links...');

    episodeLinks.forEach(link => {
      // Try to get href from link itself or from a child link
      const href = link.href || link.querySelector('a')?.href;

      if (href && href.includes('?ep=')) {
        const epMatch = href.match(/\?ep=(\d+)/);

        if (epMatch) {
          const epId = epMatch[1];
          const epNumber = this.extractEpisodeNumber(link);

          if (!episodeMap.has(epId)) {
            episodeMap.set(epId, {
              id: epId,
              number: epNumber,
              url: href,
              title: link.textContent.trim() || link.getAttribute('title') || `Episode ${epNumber}`
            });
          }
        }
      }
    });

    // Convert to array and sort numerically by ID
    this.episodes = Array.from(episodeMap.values())
      .sort((a, b) => parseInt(a.id) - parseInt(b.id));

    console.log('[9Anime Playlist] Extracted', this.episodes.length, 'unique episodes');
    console.log('[9Anime Playlist] First episode:', this.episodes[0]);
    console.log('[9Anime Playlist] Last episode:', this.episodes[this.episodes.length - 1]);

    // Find current episode index
    this.currentIndex = this.episodes.findIndex(ep => ep.id === this.currentEpisodeId);
    if (this.currentIndex === -1) this.currentIndex = 0;

    console.log('[9Anime Playlist] Current episode ID:', this.currentEpisodeId);
    console.log('[9Anime Playlist] Current episode index:', this.currentIndex);

    // DON'T filter - show ALL episodes from start to end
    // Users can click any episode to jump to it
    console.log('[9Anime Playlist] Total episodes in playlist:', this.episodes.length);
  }

  extractEpisodeNumber(element) {
    const text = element.textContent;
    const numberMatch = text.match(/(\d+)/);
    return numberMatch ? parseInt(numberMatch[1]) : 0;
  }

  createPlayerGUI() {
    console.log('[9Anime Playlist] Creating player GUI...');

    // Check if we have episodes
    if (this.episodes.length === 0) {
      console.error('[9Anime Playlist] No episodes found! Cannot create GUI.');
      this.showErrorNotification();
      return;
    }

    console.log('[9Anime Playlist] Creating GUI with', this.episodes.length, 'episodes');

    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'playlist-player-overlay';
    overlay.innerHTML = `
      <div class="playlist-container">
        <div class="playlist-header">
          <h2>🎬 Anime Playlist</h2>
          <div class="playlist-info">
            <span id="current-episode">Episode ${this.currentIndex + 1}</span> / <span id="total-episodes">${this.episodes.length}</span>
          </div>
          <button id="close-playlist" class="btn-close">✕</button>
        </div>

        <div class="playlist-content">
          <div class="playlist-list" id="episode-list">
            <!-- Episodes will be added here -->
          </div>
        </div>

        <div class="playlist-controls">
          <button id="btn-prev" class="btn-control">⏮ Previous</button>
          <button id="btn-play" class="btn-control btn-play">▶ Play</button>
          <button id="btn-next" class="btn-control">Next ⏭</button>
          <button id="btn-fullscreen" class="btn-control">⛶ Fullscreen</button>
          <label class="control-option">
            <input type="checkbox" id="toggle-autoplay" checked>
            <span>Autoplay</span>
          </label>
          <label class="control-option">
            <input type="checkbox" id="toggle-loop" checked>
            <span>Loop</span>
          </label>
          <label class="control-option">
            <input type="checkbox" id="toggle-autojump">
            <span>🎲 Auto-Jump</span>
          </label>
          <button id="btn-genres" class="btn-control btn-genres">🎯 Select Genres</button>
        </div>

        <div class="genre-selector" id="genre-selector" style="display: none;">
          <div class="genre-header">
            <h3>Select Genres for Auto-Jump</h3>
            <button id="close-genres" class="btn-close-small">✕</button>
          </div>
          <div class="genre-grid" id="genre-grid">
            <!-- Genres will be added here -->
          </div>
          <div class="genre-footer">
            <span id="selected-count">0 genres selected</span>
            <button id="apply-genres" class="btn-apply">Apply</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Add styles
    this.addStyles();

    // Populate episode list
    this.populateEpisodeList();

    // Setup controls
    this.setupControls();

    // Auto-start first episode
    setTimeout(() => this.playEpisode(0), 1000);
  }

  populateEpisodeList() {
    const listContainer = document.getElementById('episode-list');

    this.episodes.forEach((episode, index) => {
      const item = document.createElement('div');
      item.className = 'episode-item';
      if (index === this.currentIndex) item.classList.add('active');

      item.innerHTML = `
        <div class="episode-number">${index + 1}</div>
        <div class="episode-title">${episode.title}</div>
        <div class="episode-status">${index === this.currentIndex ? '▶ Playing' : ''}</div>
      `;

      item.addEventListener('click', () => this.playEpisode(index));

      listContainer.appendChild(item);
    });
  }

  setupControls() {
    // Close button
    document.getElementById('close-playlist').addEventListener('click', () => {
      document.getElementById('playlist-player-overlay').style.display = 'none';
    });

    // Previous button
    document.getElementById('btn-prev').addEventListener('click', () => {
      this.playPrevious();
    });

    // Play/Pause button
    document.getElementById('btn-play').addEventListener('click', () => {
      this.togglePlayPause();
    });

    // Next button
    document.getElementById('btn-next').addEventListener('click', () => {
      this.playNext();
    });

    // Fullscreen button
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
      this.toggleFullscreen();
    });

    // Autoplay toggle
    document.getElementById('toggle-autoplay').addEventListener('change', (e) => {
      this.autoplay = e.target.checked;
      console.log('[9Anime Playlist] Autoplay:', this.autoplay);
    });

    // Loop toggle
    document.getElementById('toggle-loop').addEventListener('change', (e) => {
      this.loop = e.target.checked;
      console.log('[9Anime Playlist] Loop:', this.loop);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') this.playNext();
      if (e.key === 'ArrowLeft') this.playPrevious();
      if (e.key === ' ') {
        e.preventDefault();
        this.togglePlayPause();
      }
      if (e.key === 'f' || e.key === 'F') this.toggleFullscreen();
    });
  }

  playEpisode(index) {
    if (index < 0 || index >= this.episodes.length) {
      if (this.loop && index >= this.episodes.length) {
        console.log('[9Anime Playlist] End reached, looping back to start');
        index = 0;
      } else {
        console.log('[9Anime Playlist] No more episodes');
        return;
      }
    }

    this.currentIndex = index;
    const episode = this.episodes[index];

    console.log('[9Anime Playlist] Playing episode', index + 1, ':', episode.title);

    // Update UI
    document.getElementById('current-episode').textContent = `Episode ${index + 1}`;

    // Highlight active episode
    document.querySelectorAll('.episode-item').forEach((item, i) => {
      item.classList.toggle('active', i === index);
      const status = item.querySelector('.episode-status');
      status.textContent = i === index ? '▶ Playing' : '';
    });

    // Navigate to episode
    window.location.href = episode.url;
  }

  playNext() {
    console.log('[9Anime Playlist] Next episode');
    this.playEpisode(this.currentIndex + 1);
  }

  playPrevious() {
    console.log('[9Anime Playlist] Previous episode');
    this.playEpisode(this.currentIndex - 1);
  }

  togglePlayPause() {
    const video = document.querySelector('video') || this.findVideoInIframe();
    if (video) {
      if (video.paused) {
        video.play();
        document.getElementById('btn-play').innerHTML = '⏸ Pause';
      } else {
        video.pause();
        document.getElementById('btn-play').innerHTML = '▶ Play';
      }
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  findVideoInIframe() {
    const iframes = document.querySelectorAll('iframe');
    for (const iframe of iframes) {
      try {
        const video = (iframe.contentDocument || iframe.contentWindow.document).querySelector('video');
        if (video) return video;
      } catch (e) {
        // Cross-origin
      }
    }
    return null;
  }

  showErrorNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 30px;
      border-radius: 15px;
      font-family: sans-serif;
      font-size: 16px;
      z-index: 999999;
      box-shadow: 0 10px 50px rgba(0,0,0,0.5);
      text-align: center;
      max-width: 500px;
    `;

    notification.innerHTML = `
      <h3 style="margin: 0 0 15px 0; font-size: 20px;">⚠️ No Episodes Found</h3>
      <p style="margin: 10px 0;">Could not find episode links on this page.</p>
      <p style="margin: 10px 0; font-size: 14px; opacity: 0.9;">
        Open browser console (F12) to see detailed logs.
      </p>
      <button onclick="this.parentElement.remove()" style="
        margin-top: 15px;
        padding: 10px 20px;
        background: white;
        color: #dc2626;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      ">Close</button>
    `;

    document.body.appendChild(notification);
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #playlist-player-overlay {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 400px;
        max-height: 80vh;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 15px;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: white;
        overflow: hidden;
      }

      .playlist-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .playlist-header {
        padding: 20px;
        background: rgba(255, 255, 255, 0.05);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .playlist-header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .playlist-info {
        font-size: 14px;
        color: #aaa;
      }

      .btn-close {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        font-size: 20px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        transition: background 0.2s;
      }

      .btn-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .playlist-content {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
      }

      .playlist-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .episode-item {
        display: flex;
        align-items: center;
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        gap: 10px;
      }

      .episode-item:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateX(5px);
      }

      .episode-item.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      }

      .episode-number {
        font-size: 16px;
        font-weight: 700;
        min-width: 30px;
      }

      .episode-title {
        flex: 1;
        font-size: 14px;
      }

      .episode-status {
        font-size: 12px;
        color: #4ade80;
      }

      .playlist-controls {
        padding: 15px;
        background: rgba(0, 0, 0, 0.2);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .btn-control {
        padding: 8px 15px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;
        flex: 1;
        min-width: 80px;
      }

      .btn-control:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }

      .btn-play {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        font-weight: 600;
      }

      .control-option {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 13px;
        padding: 5px 10px;
        cursor: pointer;
        flex: 1;
      }

      .control-option input {
        cursor: pointer;
      }

      /* Scrollbar */
      .playlist-content::-webkit-scrollbar {
        width: 6px;
      }

      .playlist-content::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
      }

      .playlist-content::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
      }

      .playlist-content::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    `;
    document.head.appendChild(style);
  }
}

// Monitor video for auto-advance
function setupAutoAdvance(player) {
  console.log('[9Anime Playlist] Setting up auto-advance...');

  setInterval(() => {
    const video = document.querySelector('video') || player.findVideoInIframe();

    if (video && player.autoplay) {
      const timeRemaining = video.duration - video.currentTime;

      // When video ends, play next
      if (timeRemaining <= 1 && timeRemaining > 0 && !video.paused) {
        console.log('[9Anime Playlist] Video ending, advancing...');
        setTimeout(() => player.playNext(), 2000);
      }
    }
  }, 1000);
}

// Initialize when on watch page
if (window.location.pathname.includes('/watch/')) {
  const player = new PlaylistPlayer();

  // Setup auto-advance monitoring
  setTimeout(() => setupAutoAdvance(player), 5000);
} else {
  console.log('[9Anime Playlist] Not on watch page');
}
