// 9Anime Playlist Player - With Auto-Jump & Random Episodes Feature
console.log('[9Anime Playlist] Loading with Auto-Jump...');

class PlaylistPlayer {
  constructor() {
    this.episodes = [];
    this.currentIndex = 0;
    this.currentEpisodeId = null;
    this.autoplay = true;
    this.loop = true;
    this.autoJump = false;
    this.selectedGenres = [];
    this.randomEpisodeQueue = [];
    this.episodesWatchedInCurrentAnime = 0;
    this.targetEpisodesForCurrentAnime = 0;

    // 9anime genres list
    this.availableGenres = [
      'Action', 'Adventure', 'Cars', 'Comedy', 'Dementia', 'Demons',
      'Drama', 'Ecchi', 'Fantasy', 'Game', 'Harem', 'Historical',
      'Horror', 'Isekai', 'Josei', 'Kids', 'Magic', 'Martial Arts',
      'Mecha', 'Military', 'Music', 'Mystery', 'Parody', 'Police',
      'Psychological', 'Romance', 'Samurai', 'School', 'Sci-Fi',
      'Seinen', 'Shoujo', 'Shoujo Ai', 'Shounen', 'Shounen Ai',
      'Slice of Life', 'Space', 'Sports', 'Super Power', 'Supernatural',
      'Thriller', 'Vampire'
    ];

    this.init();
  }

  async init() {
    console.log('[9Anime Playlist] Initializing...');
    const urlParams = new URLSearchParams(window.location.search);
    this.currentEpisodeId = urlParams.get('ep');
    console.log('[9Anime Playlist] Current episode ID:', this.currentEpisodeId);

    // Load saved state
    await this.loadState();

    this.tryExtractEpisodes(0);
  }

  async saveState() {
    const state = {
      autoplay: this.autoplay,
      loop: this.loop,
      autoJump: this.autoJump,
      selectedGenres: this.selectedGenres,
      randomEpisodeQueue: this.randomEpisodeQueue,
      episodesWatchedInCurrentAnime: this.episodesWatchedInCurrentAnime,
      targetEpisodesForCurrentAnime: this.targetEpisodesForCurrentAnime
    };
    await browser.storage.local.set({ playerState: state });
    console.log('[9Anime Playlist] State saved:', state);
  }

  async loadState() {
    try {
      const result = await browser.storage.local.get('playerState');
      console.log('[9Anime Playlist] Raw storage result:', result);
      if (result.playerState) {
        const state = result.playerState;
        this.autoplay = state.autoplay !== undefined ? state.autoplay : true;
        this.loop = state.loop !== undefined ? state.loop : true;
        this.autoJump = state.autoJump || false;
        this.selectedGenres = state.selectedGenres || [];
        this.randomEpisodeQueue = state.randomEpisodeQueue || [];
        this.episodesWatchedInCurrentAnime = state.episodesWatchedInCurrentAnime || 0;
        this.targetEpisodesForCurrentAnime = state.targetEpisodesForCurrentAnime || 0;
        console.log('[9Anime Playlist] ✅ State loaded successfully');
        console.log('[9Anime Playlist]   - AutoJump:', this.autoJump);
        console.log('[9Anime Playlist]   - Selected Genres:', this.selectedGenres);
        console.log('[9Anime Playlist]   - Random Queue:', this.randomEpisodeQueue);
      } else {
        console.log('[9Anime Playlist] ⚠️ No saved state in storage');
      }
    } catch (e) {
      console.error('[9Anime Playlist] ❌ Error loading state:', e);
    }
  }

  tryExtractEpisodes(attempt) {
    const delays = [2000, 4000, 6000];
    const delay = delays[attempt] || 6000;

    setTimeout(() => {
      this.extractEpisodes();

      if (this.episodes.length > 0) {
        console.log('[9Anime Playlist] Found', this.episodes.length, 'episodes');
        setTimeout(() => this.createPlayerGUI(), 500);
      } else if (attempt < delays.length - 1) {
        this.tryExtractEpisodes(attempt + 1);
      } else {
        this.createPlayerGUI();
      }
    }, delay);
  }

  extractEpisodes() {
    const episodeMap = new Map();
    const allLinks = Array.from(document.querySelectorAll('a'));
    const epLinks = allLinks.filter(a => a.href && a.href.includes('?ep='));

    epLinks.forEach(link => {
      const epMatch = link.href.match(/\?ep=(\d+)/);
      if (epMatch) {
        const epId = epMatch[1];
        if (!episodeMap.has(epId)) {
          episodeMap.set(epId, {
            id: epId,
            url: link.href,
            title: link.textContent.trim() || 'Episode ' + epId
          });
        }
      }
    });

    this.episodes = Array.from(episodeMap.values())
      .sort((a, b) => parseInt(a.id) - parseInt(b.id));

    this.currentIndex = this.episodes.findIndex(ep => ep.id === this.currentEpisodeId);
    if (this.currentIndex === -1) this.currentIndex = 0;
  }

  createPlayerGUI() {
    if (this.episodes.length === 0) {
      console.error('[9Anime Playlist] No episodes found!');
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'playlist-player-overlay';
    overlay.innerHTML = '<div class="playlist-container"><div class="playlist-header"><h2>🎬 Playlist</h2><div class="playlist-info"><span id="current-episode">Ep ' + (this.currentIndex + 1) + '</span> / <span id="total-episodes">' + this.episodes.length + '</span></div><button id="close-playlist" class="btn-close">✕</button></div><div class="playlist-content"><div class="playlist-list" id="episode-list"></div></div><div class="playlist-controls"><button id="btn-prev" class="btn-control">⏮ Prev</button><button id="btn-play" class="btn-control btn-play">▶ Play</button><button id="btn-next" class="btn-control">Next ⏭</button><button id="btn-fullscreen" class="btn-control">⛶ FS</button><label class="control-option"><input type="checkbox" id="toggle-autoplay"> Autoplay</label><label class="control-option"><input type="checkbox" id="toggle-loop"> Loop</label><label class="control-option"><input type="checkbox" id="toggle-autojump"> 🎲 Auto-Jump</label><button id="btn-genres" class="btn-control btn-genres">🎯 Genres</button></div><div class="genre-selector" id="genre-selector" style="display:none"><div class="genre-header"><h3>Select Genres for Auto-Jump</h3><p style="font-size:12px;opacity:0.8;margin:5px 0">Plays 3-8 random episodes from random anime in selected genres</p><button id="close-genres" class="btn-close-small">✕</button></div><div class="genre-grid" id="genre-grid"></div><div class="genre-footer"><span id="selected-count">' + this.selectedGenres.length + ' genres selected</span><button id="apply-genres" class="btn-apply">Apply</button></div></div></div>';

    document.body.appendChild(overlay);
    this.addStyles();
    this.populateEpisodeList();
    this.populateGenreGrid();
    this.setupControls();
    this.restoreUIState();
  }

  restoreUIState() {
    console.log('[9Anime Playlist] 🔄 Restoring UI state...');
    console.log('[9Anime Playlist]   - Genres to restore:', this.selectedGenres);

    // Restore checkbox states
    document.getElementById('toggle-autoplay').checked = this.autoplay;
    document.getElementById('toggle-loop').checked = this.loop;
    document.getElementById('toggle-autojump').checked = this.autoJump;

    // If auto-jump is enabled, initialize it
    if (this.autoJump && this.randomEpisodeQueue.length === 0) {
      this.initAutoJump();
    }

    // Restore selected genres with a delay to ensure DOM is ready
    setTimeout(() => {
      console.log('[9Anime Playlist] 🔍 Attempting to restore genre checkboxes...');

      // Debug: Check what checkboxes exist
      const allCheckboxes = document.querySelectorAll('#genre-grid input');
      console.log('[9Anime Playlist]   - Total genre checkboxes in DOM:', allCheckboxes.length);

      let restoredCount = 0;
      this.selectedGenres.forEach(genre => {
        const selector = `#genre-grid input[value="${genre}"]`;
        const checkbox = document.querySelector(selector);
        console.log(`[9Anime Playlist]   - Looking for genre "${genre}" with selector:`, selector);
        console.log(`[9Anime Playlist]   - Found checkbox:`, checkbox);

        if (checkbox) {
          checkbox.checked = true;
          restoredCount++;
          console.log(`[9Anime Playlist]   ✅ Restored genre: ${genre}`);
        } else {
          console.warn(`[9Anime Playlist]   ❌ Could not find checkbox for genre: ${genre}`);
        }
      });

      // Update the count display
      const count = document.querySelectorAll('#genre-grid input:checked').length;
      document.getElementById('selected-count').textContent = count + ' genres selected';

      console.log('[9Anime Playlist] ✅ UI state restored');
      console.log(`[9Anime Playlist]   - Genres restored: ${restoredCount}/${this.selectedGenres.length}`);
      console.log(`[9Anime Playlist]   - Checkboxes checked: ${count}`);
      console.log(`[9Anime Playlist]   - AutoJump: ${this.autoJump}`);
    }, 100);
  }

  populateEpisodeList() {
    const listContainer = document.getElementById('episode-list');
    this.episodes.forEach((episode, index) => {
      const item = document.createElement('div');
      item.className = 'episode-item';
      if (index === this.currentIndex) item.classList.add('active');
      item.innerHTML = '<div class="episode-number">' + (index + 1) + '</div><div class="episode-title">' + episode.title + '</div>';
      item.addEventListener('click', () => this.playEpisode(index));
      listContainer.appendChild(item);
    });
  }

  populateGenreGrid() {
    const grid = document.getElementById('genre-grid');
    this.availableGenres.forEach(genre => {
      const item = document.createElement('label');
      item.className = 'genre-item';
      item.innerHTML = '<input type="checkbox" value="' + genre + '"><span>' + genre + '</span>';
      grid.appendChild(item);
    });
  }

  setupControls() {
    document.getElementById('close-playlist').addEventListener('click', () => {
      document.getElementById('playlist-player-overlay').style.display = 'none';
    });

    document.getElementById('btn-prev').addEventListener('click', () => this.playPrevious());
    document.getElementById('btn-play').addEventListener('click', () => this.togglePlayPause());
    document.getElementById('btn-next').addEventListener('click', () => this.playNext());
    document.getElementById('btn-fullscreen').addEventListener('click', () => this.toggleFullscreen());

    document.getElementById('toggle-autoplay').addEventListener('change', (e) => {
      this.autoplay = e.target.checked;
      this.saveState();
    });

    document.getElementById('toggle-loop').addEventListener('change', (e) => {
      this.loop = e.target.checked;
      this.saveState();
    });

    document.getElementById('toggle-autojump').addEventListener('change', (e) => {
      this.autoJump = e.target.checked;
      console.log('[9Anime Playlist] Auto-Jump toggled:', this.autoJump);

      if (this.autoJump) {
        // Enable auto-jump
        if (this.selectedGenres.length === 0) {
          alert('Please select genres first by clicking "🎯 Genres" button');
          this.autoJump = false;
          e.target.checked = false;
          return;
        }
        this.initAutoJump();
      } else {
        // Disable auto-jump - clear the queue
        this.randomEpisodeQueue = [];
        this.episodesWatchedInCurrentAnime = 0;
        this.targetEpisodesForCurrentAnime = 0;
        console.log('[9Anime Playlist] Auto-Jump disabled, queue cleared');
      }

      this.saveState();
    });

    document.getElementById('btn-genres').addEventListener('click', () => {
      document.getElementById('genre-selector').style.display = 'block';
    });

    document.getElementById('close-genres').addEventListener('click', () => {
      document.getElementById('genre-selector').style.display = 'none';
    });

    document.getElementById('apply-genres').addEventListener('click', () => {
      const checkboxes = document.querySelectorAll('#genre-grid input:checked');
      this.selectedGenres = Array.from(checkboxes).map(cb => cb.value);
      document.getElementById('selected-count').textContent = this.selectedGenres.length + ' genres selected';
      console.log('[9Anime Playlist] Selected genres:', this.selectedGenres);
      document.getElementById('genre-selector').style.display = 'none';

      // If auto-jump is enabled, reinitialize with new genres
      if (this.autoJump) {
        console.log('[9Anime Playlist] Re-initializing auto-jump with new genres...');
        this.randomEpisodeQueue = [];
        this.initAutoJump();
      }

      this.saveState();
    });

    document.getElementById('genre-grid').addEventListener('change', () => {
      const count = document.querySelectorAll('#genre-grid input:checked').length;
      document.getElementById('selected-count').textContent = count + ' genres selected';
    });
  }

  initAutoJump() {
    // Don't reinitialize if we already have a queue from saved state
    if (this.randomEpisodeQueue.length > 0 && this.targetEpisodesForCurrentAnime > 0) {
      console.log('[9Anime Playlist] Auto-Jump: Resuming with existing queue:', this.randomEpisodeQueue.map(i => i + 1));
      return;
    }

    const totalEpisodes = this.episodes.length;

    // Handle special cases
    if (totalEpisodes === 0) {
      console.warn('[9Anime Playlist] No episodes found, jumping to next anime...');
      this.jumpToRandomAnime();
      return;
    }

    if (totalEpisodes === 1) {
      // Special case: Only 1 episode - play it once then jump
      console.log('[9Anime Playlist] Auto-Jump: Only 1 episode available, will play it then jump');
      this.targetEpisodesForCurrentAnime = 1;
      this.episodesWatchedInCurrentAnime = 0;
      this.randomEpisodeQueue = [0];
    } else {
      // Normal case: Roll 3-8 episodes, but cap at available episodes
      const requestedEpisodes = Math.floor(Math.random() * 6) + 3; // 3-8
      const actualEpisodes = Math.min(requestedEpisodes, totalEpisodes);

      this.targetEpisodesForCurrentAnime = actualEpisodes;
      this.episodesWatchedInCurrentAnime = 0;
      this.randomEpisodeQueue = this.getRandomEpisodes(actualEpisodes);

      if (actualEpisodes < requestedEpisodes) {
        console.log(`[9Anime Playlist] Auto-Jump: Rolled ${requestedEpisodes} but anime only has ${totalEpisodes} episodes`);
        console.log(`[9Anime Playlist] Auto-Jump: Will watch all ${actualEpisodes} episodes then jump to next anime`);
      } else {
        console.log('[9Anime Playlist] Auto-Jump: Will watch', actualEpisodes, 'random episodes');
      }
    }

    console.log('[9Anime Playlist] Random queue:', this.randomEpisodeQueue.map(i => i + 1));
    this.saveState();
  }

  getRandomEpisodes(count) {
    const max = Math.min(count, this.episodes.length);
    const indices = [];
    const available = Array.from({length: this.episodes.length}, (_, i) => i);

    for (let i = 0; i < max; i++) {
      const randomIndex = Math.floor(Math.random() * available.length);
      indices.push(available[randomIndex]);
      available.splice(randomIndex, 1);
    }

    return indices;
  }

  playEpisode(index) {
    if (index < 0 || index >= this.episodes.length) {
      if (this.loop && index >= this.episodes.length) index = 0;
      else return;
    }

    this.currentIndex = index;
    const episode = this.episodes[index];

    document.getElementById('current-episode').textContent = 'Ep ' + (index + 1);
    document.querySelectorAll('.episode-item').forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });

    window.location.href = episode.url;
  }

  playNext() {
    if (this.autoJump && this.randomEpisodeQueue.length > 0) {
      const nextIndex = this.randomEpisodeQueue.shift();
      this.episodesWatchedInCurrentAnime++;

      console.log(`[9Anime Playlist] 🎲 Auto-Jump: Playing random episode ${nextIndex + 1} (${this.episodesWatchedInCurrentAnime}/${this.targetEpisodesForCurrentAnime})`);
      console.log(`[9Anime Playlist]    Remaining in queue: ${this.randomEpisodeQueue.length}`);

      this.saveState(); // Save progress

      if (this.randomEpisodeQueue.length === 0) {
        console.log('[9Anime Playlist] ✅ Completed all episodes in queue for this anime');
        console.log('[9Anime Playlist] 🎯 Jumping to new random anime...');
        setTimeout(() => {
          this.jumpToRandomAnime();
        }, 2000);
      } else {
        this.playEpisode(nextIndex);
      }
    } else if (this.autoJump && this.randomEpisodeQueue.length === 0) {
      // Auto-jump enabled but queue is empty - jump to new anime
      console.log('[9Anime Playlist] 🎯 Auto-Jump enabled but queue empty, jumping to new anime...');
      this.jumpToRandomAnime();
    } else {
      // Sequential playback (no auto-jump)
      this.playEpisode(this.currentIndex + 1);
    }
  }

  playPrevious() {
    this.playEpisode(this.currentIndex - 1);
  }

  async jumpToRandomAnime() {
    console.log('[9Anime Playlist] Jumping to random anime...');

    if (this.selectedGenres.length === 0) {
      console.warn('[9Anime Playlist] No genres selected, using Action');
      this.selectedGenres = ['Action'];
    }

    const genre = this.selectedGenres[Math.floor(Math.random() * this.selectedGenres.length)];
    const genreSlug = genre.toLowerCase().replace(/\s+/g, '-');

    console.log('[9Anime Playlist] Fetching from genre:', genre);

    try {
      const response = await fetch('https://9animetv.to/genre/' + genreSlug);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const animeLinks = Array.from(doc.querySelectorAll('a[href*="/watch/"]'))
        .filter(a => !a.href.includes('?ep='))
        .map(a => a.href);

      if (animeLinks.length > 0) {
        const randomAnime = animeLinks[Math.floor(Math.random() * animeLinks.length)];
        console.log('[9Anime Playlist] Jumping to:', randomAnime);
        window.location.href = randomAnime;
      }
    } catch (error) {
      console.error('[9Anime Playlist] Error:', error);
    }
  }

  togglePlayPause() {
    const video = document.querySelector('video');
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

  addStyles() {
    const style = document.createElement('style');
    style.textContent = '#playlist-player-overlay{position:fixed;top:20px;right:20px;width:400px;max-height:80vh;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:15px;box-shadow:0 10px 50px rgba(0,0,0,0.5);z-index:999999;font-family:sans-serif;color:white;overflow:hidden}.playlist-container{display:flex;flex-direction:column;height:100%}.playlist-header{padding:15px;background:rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.1);display:flex;justify-content:space-between;align-items:center}.playlist-header h2{margin:0;font-size:16px}.playlist-info{font-size:13px;color:#aaa}.btn-close{background:rgba(255,255,255,0.1);border:none;color:white;font-size:18px;width:28px;height:28px;border-radius:50%;cursor:pointer}.playlist-content{flex:1;overflow-y:auto;padding:10px}.episode-item{display:flex;align-items:center;padding:10px;background:rgba(255,255,255,0.05);border-radius:6px;cursor:pointer;margin-bottom:5px;gap:10px;transition:all 0.2s}.episode-item:hover{background:rgba(255,255,255,0.1);transform:translateX(5px)}.episode-item.active{background:linear-gradient(135deg,#667eea,#764ba2);box-shadow:0 4px 15px rgba(102,126,234,0.4)}.episode-number{font-weight:700;min-width:30px;font-size:14px}.episode-title{flex:1;font-size:13px}.playlist-controls{padding:12px;background:rgba(0,0,0,0.2);border-top:1px solid rgba(255,255,255,0.1);display:flex;flex-wrap:wrap;gap:6px}.btn-control{padding:6px 12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:white;border-radius:6px;cursor:pointer;font-size:12px;transition:all 0.2s}.btn-control:hover{background:rgba(255,255,255,0.2)}.btn-play{background:linear-gradient(135deg,#667eea,#764ba2);border:none;font-weight:600}.control-option{display:flex;align-items:center;gap:4px;font-size:12px;padding:4px 8px;cursor:pointer}.genre-selector{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.95);display:flex;flex-direction:column}.genre-header{padding:15px;border-bottom:1px solid rgba(255,255,255,0.1);position:relative}.genre-header h3{margin:0 0 5px 0;font-size:16px}.btn-close-small{position:absolute;top:15px;right:15px;background:rgba(255,255,255,0.1);border:none;color:white;width:26px;height:26px;border-radius:50%;cursor:pointer}.genre-grid{flex:1;overflow-y:auto;padding:15px;display:grid;grid-template-columns:repeat(2,1fr);gap:8px;max-height:calc(80vh - 180px)}.genre-item{display:flex;align-items:center;gap:6px;padding:8px;background:rgba(255,255,255,0.05);border-radius:6px;cursor:pointer;transition:all 0.2s;font-size:13px}.genre-item:hover{background:rgba(255,255,255,0.1)}.genre-item input:checked+span{color:#4ade80;font-weight:600}.genre-footer{padding:15px;border-top:1px solid rgba(255,255,255,0.1);display:flex;justify-content:space-between;align-items:center}.btn-apply{padding:8px 20px;background:linear-gradient(135deg,#667eea,#764ba2);border:none;color:white;border-radius:6px;cursor:pointer;font-weight:600}';
    document.head.appendChild(style);
  }
}

// Detect if we're in parent page or iframe
const isParentPage = window.location.hostname.includes('9animetv.to');
const isVideoIframe = window.location.hostname.includes('rapid-cloud.co');

if (isParentPage && window.location.pathname.includes('/watch/')) {
  console.log('[9Anime Playlist] Running in parent page (9animetv.to)');

  // Create player instance
  const player = new PlaylistPlayer();

  // Listen for messages from video iframe
  window.addEventListener('message', (event) => {
    if (event.data.type === 'VIDEO_ENDED') {
      console.log('[9Anime Playlist] 🎬 Received VIDEO_ENDED message from iframe');
      if (player.autoplay) {
        setTimeout(() => {
          console.log('[9Anime Playlist] ⏭️ Advancing to next episode...');
          player.playNext();
        }, 2000);
      }
    } else if (event.data.type === 'VIDEO_STATUS') {
      // Optional: Log video status from iframe
      if (event.data.remaining <= 5 && event.data.remaining > 0) {
        console.log('[9Anime Playlist] ⏰ Less than 5 seconds remaining');
      }
    }
  });

  console.log('[9Anime Playlist] ✅ Message listener active, waiting for video events from iframe');
}

if (isVideoIframe) {
  console.log('[9Anime Playlist] Running in video iframe (rapid-cloud.co)');

  let videoFound = false;
  let lastLogTime = 0;

  // Watch for video element and attach listener
  const watchForVideo = setInterval(() => {
    const video = document.querySelector('video');

    if (video && !videoFound) {
      videoFound = true;
      console.log('[9Anime Playlist] ✅ Video element found in iframe!');

      // Listen for video end
      video.addEventListener('ended', () => {
        console.log('[9Anime Playlist] 🎬 Video ended in iframe! Posting message to parent...');
        window.parent.postMessage({ type: 'VIDEO_ENDED' }, '*');
      });

      // Also watch for pause at end
      video.addEventListener('pause', () => {
        if (video.currentTime >= video.duration - 1) {
          console.log('[9Anime Playlist] Video paused at end, posting message...');
          setTimeout(() => {
            if (video.paused && video.currentTime >= video.duration - 1) {
              window.parent.postMessage({ type: 'VIDEO_ENDED' }, '*');
            }
          }, 2000);
        }
      });

      // Periodic status updates
      setInterval(() => {
        if (video.duration && !isNaN(video.duration)) {
          const remaining = video.duration - video.currentTime;
          const currentTime = Math.floor(video.currentTime);

          // Log every 5 seconds
          if (currentTime % 5 === 0 && currentTime !== lastLogTime) {
            console.log('[9Anime Playlist] Video status:', {
              current: currentTime,
              duration: Math.floor(video.duration),
              remaining: Math.floor(remaining),
              paused: video.paused,
              ended: video.ended
            });
            lastLogTime = currentTime;

            // Post status to parent
            window.parent.postMessage({
              type: 'VIDEO_STATUS',
              current: currentTime,
              duration: video.duration,
              remaining: remaining,
              paused: video.paused,
              ended: video.ended
            }, '*');
          }
        }
      }, 1000);

      console.log('[9Anime Playlist] ✅ Video event listeners attached in iframe');
    }
  }, 1000);
}
