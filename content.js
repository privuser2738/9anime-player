// Content script for 9anime watch pages
console.log('[9Anime Player] Content script loaded');

class AnimePlayer {
  constructor() {
    this.video = null;
    this.currentAnime = null;
    this.currentEpisode = null;
    this.currentEpisodeId = null;
    this.genres = [];
    this.nextEpisodeUrl = null;
    this.isLastEpisode = false;
    this.transitionOverlay = null;
    this.fullscreenRequested = false;
    this.videoCheckInterval = null;
    this.videoCheckAttempts = 0;
    this.hasUserInteracted = false;

    this.init();
  }

  init() {
    console.log('[9Anime Player] Initializing...');

    // Detect user interaction for fullscreen
    this.detectUserInteraction();

    // Extract anime info from page
    this.extractAnimeInfo();

    // Wait for video element to load
    this.waitForVideo();

    // Set up mutation observer for dynamic content
    this.observePageChanges();

    // Monitor for iframes being added
    this.monitorIframes();
  }

  detectUserInteraction() {
    const interactionHandler = () => {
      console.log('[9Anime Player] User interaction detected');
      this.hasUserInteracted = true;
      // Try to enter fullscreen after user interaction
      if (this.video && !this.fullscreenRequested) {
        setTimeout(() => this.enterFullscreen(), 1000);
      }
    };

    // Listen for various user interactions
    ['click', 'keydown', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, interactionHandler, { once: true });
    });
  }

  extractAnimeInfo() {
    try {
      // Extract anime title from breadcrumb or title
      const breadcrumb = document.querySelector('.film-name, h1.title, h2.film-name');
      this.currentAnime = breadcrumb ? breadcrumb.textContent.trim() : 'Unknown Anime';

      // Extract genres
      const genreElements = document.querySelectorAll('a[href*="/genre/"]');
      this.genres = Array.from(genreElements).map(el => el.textContent.trim()).filter(g => g);

      // Extract current episode ID from URL parameters (?ep=XXXXX)
      const urlParams = new URLSearchParams(window.location.search);
      this.currentEpisodeId = urlParams.get('ep');

      // Extract episode number from page text or active episode
      const activeEpisode = document.querySelector('.ep-item.active, .episode.active, [class*="active"]');
      if (activeEpisode) {
        const epText = activeEpisode.textContent.match(/\d+/);
        this.currentEpisode = epText ? parseInt(epText[0]) : 1;
      } else {
        // Try to find episode number in page content
        const episodeText = document.body.textContent.match(/Episode\s+(\d+)/i);
        this.currentEpisode = episodeText ? parseInt(episodeText[1]) : 1;
      }

      console.log('[9Anime Player] Extracted info:', {
        anime: this.currentAnime,
        episode: this.currentEpisode,
        episodeId: this.currentEpisodeId,
        genres: this.genres,
        url: window.location.href
      });

      // Find next/prev episode links
      setTimeout(() => this.findEpisodeNavigation(), 2000);

    } catch (error) {
      console.error('[9Anime Player] Error extracting anime info:', error);
    }
  }

  findEpisodeNavigation() {
    console.log('[9Anime Player] Finding episode navigation...');

    // Method 1: Look for Next button by text content
    const allLinks = Array.from(document.querySelectorAll('a'));
    let nextButton = allLinks.find(a => {
      const text = a.textContent.trim().toLowerCase();
      return text === 'next' || text.includes('next ep');
    });

    // Method 2: Look for Next button by class
    if (!nextButton) {
      nextButton = document.querySelector('.btn-next, #next-episode, [data-navigate="next"]');
    }

    // Check if next button exists and is not disabled
    if (nextButton) {
      const isDisabled = nextButton.classList.contains('disabled') ||
                        nextButton.hasAttribute('disabled') ||
                        nextButton.getAttribute('aria-disabled') === 'true';

      if (isDisabled) {
        console.log('[9Anime Player] Next button is disabled - last episode');
        this.isLastEpisode = true;
        return;
      }

      // Try to get href or data attributes
      if (nextButton.href && !nextButton.href.includes('javascript:')) {
        this.nextEpisodeUrl = nextButton.href;
        console.log('[9Anime Player] Found next episode URL from button:', this.nextEpisodeUrl);
      } else {
        // Next button exists but uses JavaScript - try to find next episode in list
        this.findNextInEpisodeList();
      }
    } else {
      console.log('[9Anime Player] No next button found, trying episode list');
      this.findNextInEpisodeList();
    }

    console.log('[9Anime Player] Navigation result:', {
      nextUrl: this.nextEpisodeUrl,
      isLast: this.isLastEpisode
    });
  }

  findNextInEpisodeList() {
    // Look for episode list and find next episode
    const episodeItems = document.querySelectorAll('.ep-item, .episode-item, [class*="episode"]');

    if (episodeItems.length > 0) {
      console.log('[9Anime Player] Found', episodeItems.length, 'episode items');

      // Find current episode in list
      let foundCurrent = false;
      for (let i = 0; i < episodeItems.length; i++) {
        const item = episodeItems[i];

        // Check if this is the current episode
        if (item.classList.contains('active') ||
            item.getAttribute('data-id') === this.currentEpisodeId) {
          foundCurrent = true;

          // Get next episode
          if (i < episodeItems.length - 1) {
            const nextItem = episodeItems[i + 1];
            const nextLink = nextItem.querySelector('a') || nextItem;

            if (nextLink.href && !nextLink.href.includes('javascript:')) {
              this.nextEpisodeUrl = nextLink.href;
              this.isLastEpisode = false;
              console.log('[9Anime Player] Found next episode in list:', this.nextEpisodeUrl);
            } else {
              // Try to get data-id and construct URL
              const nextEpId = nextItem.getAttribute('data-id');
              if (nextEpId) {
                this.nextEpisodeUrl = `${window.location.pathname}?ep=${nextEpId}`;
                this.isLastEpisode = false;
                console.log('[9Anime Player] Constructed next URL from data-id:', this.nextEpisodeUrl);
              }
            }
          } else {
            console.log('[9Anime Player] Current episode is last in list');
            this.isLastEpisode = true;
          }
          break;
        }
      }

      if (!foundCurrent) {
        console.warn('[9Anime Player] Could not find current episode in list');
      }
    } else {
      console.warn('[9Anime Player] No episode list found');
      this.isLastEpisode = true;
    }
  }

  waitForVideo() {
    console.log('[9Anime Player] Waiting for video element...');

    this.videoCheckInterval = setInterval(() => {
      this.videoCheckAttempts++;

      // Method 1: Check main document
      let video = document.querySelector('video');

      // Method 2: Check all iframes
      if (!video) {
        const iframes = document.querySelectorAll('iframe');
        for (const iframe of iframes) {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDoc) {
              video = iframeDoc.querySelector('video');
              if (video) {
                console.log('[9Anime Player] Video found in iframe!');
                break;
              }
            }
          } catch (e) {
            // Cross-origin iframe, can't access
          }
        }
      }

      // Method 3: Check shadow DOM
      if (!video) {
        const shadowHosts = document.querySelectorAll('*');
        for (const host of shadowHosts) {
          if (host.shadowRoot) {
            video = host.shadowRoot.querySelector('video');
            if (video) {
              console.log('[9Anime Player] Video found in shadow DOM!');
              break;
            }
          }
        }
      }

      if (video && !this.video) {
        console.log('[9Anime Player] Video element found after', this.videoCheckAttempts, 'attempts!');
        this.video = video;
        clearInterval(this.videoCheckInterval);
        this.setupVideoListeners();

        // Try fullscreen after video is found and user has interacted
        if (this.hasUserInteracted) {
          setTimeout(() => this.enterFullscreen(), 1000);
        }
      }

      // Log progress every 10 attempts
      if (this.videoCheckAttempts % 10 === 0) {
        console.log('[9Anime Player] Still searching for video... attempt', this.videoCheckAttempts);
      }
    }, 1000); // Check every 1 second

    // Give up after 60 seconds
    setTimeout(() => {
      if (this.videoCheckInterval) {
        clearInterval(this.videoCheckInterval);
        console.error('[9Anime Player] Video element not found after 60 seconds');
        console.log('[9Anime Player] Page iframes:', document.querySelectorAll('iframe').length);
        console.log('[9Anime Player] Please check browser console for errors');
      }
    }, 60000);
  }

  monitorIframes() {
    // Watch for iframes being added dynamically
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.tagName === 'IFRAME') {
            console.log('[9Anime Player] New iframe detected, checking for video...');
            // Re-trigger video search
            if (!this.video && !this.videoCheckInterval) {
              this.waitForVideo();
            }
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  setupVideoListeners() {
    if (!this.video) return;

    console.log('[9Anime Player] Setting up video listeners');

    // Show notification to user
    this.showNotification('9Anime Player Active! Click anywhere to enter fullscreen mode.');

    // Auto-play video
    this.video.play().catch(err => {
      console.warn('[9Anime Player] Auto-play failed:', err);
      // If auto-play fails, show notification
      this.showNotification('Click the video to start playback and enable fullscreen');
    });

    // Monitor video time for transition overlay
    this.video.addEventListener('timeupdate', () => {
      this.handleTimeUpdate();
    });

    // Handle video end
    this.video.addEventListener('ended', () => {
      this.handleVideoEnd();
    });

    // Ensure fullscreen is maintained
    this.video.addEventListener('play', () => {
      if (!document.fullscreenElement && this.fullscreenRequested) {
        setTimeout(() => this.enterFullscreen(), 500);
      }
    });

    // Monitor fullscreen changes
    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement) {
        this.fullscreenRequested = true;
        console.log('[9Anime Player] Entered fullscreen');
      } else {
        console.log('[9Anime Player] Exited fullscreen');
        // Re-enter fullscreen if video is playing
        if (this.video && !this.video.paused) {
          setTimeout(() => this.enterFullscreen(), 500);
        }
      }
    });
  }

  handleTimeUpdate() {
    if (!this.video) return;

    const timeRemaining = this.video.duration - this.video.currentTime;

    // Show transition overlay 30 seconds before end
    if (timeRemaining <= 30 && timeRemaining > 0 && !this.transitionOverlay) {
      this.showTransitionOverlay();
    }

    // Hide overlay if user seeks backward
    if (timeRemaining > 30 && this.transitionOverlay) {
      this.hideTransitionOverlay();
    }
  }

  showTransitionOverlay() {
    console.log('[9Anime Player] Showing transition overlay');

    // Create overlay element
    this.transitionOverlay = document.createElement('div');
    this.transitionOverlay.id = 'anime-player-overlay';
    this.transitionOverlay.className = 'anime-overlay fade-in';

    const nextInfo = this.getNextAnimeInfo();

    this.transitionOverlay.innerHTML = `
      <div class="overlay-content">
        <div class="current-ending">
          <h2>Episode Ending</h2>
          <p class="anime-title">${this.currentAnime}</p>
          <p class="episode-number">Episode ${this.currentEpisode}</p>
        </div>
        <div class="next-up">
          <h3>Up Next</h3>
          <p class="next-title">${nextInfo.title}</p>
          <p class="next-subtitle">${nextInfo.subtitle}</p>
          ${nextInfo.genres ? `<p class="genres">${nextInfo.genres}</p>` : ''}
          <div class="countdown">Starting in <span id="countdown">15</span>s</div>
        </div>
      </div>
    `;

    document.body.appendChild(this.transitionOverlay);

    // Start countdown
    let countdown = 15;
    const countdownEl = document.getElementById('countdown');
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdownEl) {
        countdownEl.textContent = countdown;
      }
      if (countdown <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);

    // Fade in animation
    setTimeout(() => {
      this.transitionOverlay.classList.add('visible');
    }, 100);
  }

  hideTransitionOverlay() {
    if (this.transitionOverlay) {
      this.transitionOverlay.classList.remove('visible');
      setTimeout(() => {
        if (this.transitionOverlay && this.transitionOverlay.parentNode) {
          this.transitionOverlay.parentNode.removeChild(this.transitionOverlay);
        }
        this.transitionOverlay = null;
      }, 500);
    }
  }

  getNextAnimeInfo() {
    if (!this.isLastEpisode) {
      // Next episode in same series
      return {
        title: this.currentAnime,
        subtitle: `Episode ${this.currentEpisode + 1}`,
        genres: this.genres.join(', ')
      };
    } else {
      // Next series (will be determined by genre)
      return {
        title: 'Next Anime',
        subtitle: `Based on ${this.genres[0] || 'your preferences'}`,
        genres: this.genres.join(', ')
      };
    }
  }

  handleVideoEnd() {
    console.log('[9Anime Player] Video ended');

    // Wait for transition overlay countdown
    setTimeout(() => {
      if (!this.isLastEpisode && this.nextEpisodeUrl) {
        this.navigateToNextEpisode();
      } else {
        this.navigateToRandomAnime();
      }
    }, 15000); // 15 second delay as requested
  }

  navigateToNextEpisode() {
    console.log('[9Anime Player] Navigating to next episode...');

    // Notify background script
    browser.runtime.sendMessage({
      type: 'episodeEnded',
      data: {
        anime: this.currentAnime,
        episode: this.currentEpisode
      }
    });

    // METHOD 1: Try to click the Next button first (even if hidden)
    // This is more reliable as it uses the site's own navigation logic
    const nextButton = this.findNextButton();
    if (nextButton) {
      console.log('[9Anime Player] Attempting to click Next button');
      try {
        // Try clicking even if hidden
        nextButton.click();
        console.log('[9Anime Player] Next button clicked successfully');

        // Wait a moment to see if navigation happens
        setTimeout(() => {
          // If still on same page after 2 seconds, try manual navigation
          if (window.location.href === this.nextEpisodeUrl || !this.nextEpisodeUrl) {
            console.log('[9Anime Player] Button click succeeded');
          } else {
            console.log('[9Anime Player] Button click may have failed, trying manual navigation');
            this.manualNavigate();
          }
        }, 2000);
        return;
      } catch (error) {
        console.warn('[9Anime Player] Failed to click Next button:', error);
      }
    }

    // METHOD 2: Manual navigation as fallback
    this.manualNavigate();
  }

  findNextButton() {
    // Search for Next button using multiple strategies
    const strategies = [
      // Strategy 1: By text content
      () => {
        const allLinks = Array.from(document.querySelectorAll('a, button'));
        return allLinks.find(el => {
          const text = el.textContent.trim().toLowerCase();
          return text === 'next' || text === 'next episode' || text.includes('next ep');
        });
      },
      // Strategy 2: By class/id
      () => document.querySelector('.btn-next, #next-episode, [data-navigate="next"], .next-btn'),
      // Strategy 3: By aria-label
      () => document.querySelector('[aria-label*="next" i], [aria-label*="Next Episode" i]'),
      // Strategy 4: By title attribute
      () => document.querySelector('[title*="Next" i]')
    ];

    for (const strategy of strategies) {
      try {
        const button = strategy();
        if (button && !button.classList.contains('disabled') && !button.hasAttribute('disabled')) {
          return button;
        }
      } catch (e) {
        // Strategy failed, try next
      }
    }

    return null;
  }

  manualNavigate() {
    if (this.nextEpisodeUrl) {
      console.log('[9Anime Player] Manual navigation to:', this.nextEpisodeUrl);
      window.location.href = this.nextEpisodeUrl;
    } else {
      console.error('[9Anime Player] No next episode URL available');
      this.showNotification('Could not find next episode. Please navigate manually.');
    }
  }

  async navigateToRandomAnime() {
    console.log('[9Anime Player] Series ended, finding new anime...');

    try {
      // Notify background script
      browser.runtime.sendMessage({
        type: 'seriesEnded',
        data: {
          anime: this.currentAnime,
          genres: this.genres
        }
      });

      // Select random genre from current anime
      const genre = this.genres[Math.floor(Math.random() * this.genres.length)] || 'action';

      // Fetch anime list from genre page
      const genreSlug = genre.toLowerCase().replace(/\s+/g, '-');
      const genreUrl = `https://9animetv.to/genre/${genreSlug}`;

      console.log('[9Anime Player] Fetching from genre:', genreUrl);

      // For now, navigate to genre page and let user click
      // In production, we'd parse the genre page to find a random anime
      const animeList = await this.scrapeGenrePage(genreSlug);

      if (animeList && animeList.length > 0) {
        const randomAnime = animeList[Math.floor(Math.random() * animeList.length)];
        console.log('[9Anime Player] Selected random anime:', randomAnime);
        window.location.href = randomAnime.url;
      } else {
        // Fallback: go to genre page
        window.location.href = genreUrl;
      }
    } catch (error) {
      console.error('[9Anime Player] Error finding next anime:', error);
      // Fallback: go to homepage
      window.location.href = 'https://9animetv.to/';
    }
  }

  async scrapeGenrePage(genreSlug) {
    try {
      const response = await fetch(`https://9animetv.to/genre/${genreSlug}`);
      const html = await response.text();

      // Parse HTML to find anime links
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Find all anime links (this selector may need adjustment based on actual page structure)
      const animeLinks = Array.from(doc.querySelectorAll('a[href*="/watch/"]'))
        .map(a => ({
          title: a.getAttribute('title') || a.textContent.trim(),
          url: a.href
        }))
        .filter(item => item.url && item.title && !item.url.includes('ep-'));

      // Remove duplicates
      const uniqueAnime = Array.from(new Map(animeLinks.map(item => [item.url, item])).values());

      return uniqueAnime;
    } catch (error) {
      console.error('[9Anime Player] Error scraping genre page:', error);
      return [];
    }
  }

  enterFullscreen() {
    if (!this.video) {
      console.warn('[9Anime Player] Cannot enter fullscreen - no video element');
      return;
    }

    // Try different elements for fullscreen
    const candidates = [
      // Try video element itself first
      this.video,
      // Try common player containers
      this.video.parentElement,
      this.video.closest('.player-container'),
      this.video.closest('.video-container'),
      this.video.closest('#player'),
      this.video.closest('[class*="player"]'),
      // Try entire document as fallback
      document.documentElement
    ].filter(el => el);

    for (const element of candidates) {
      const requestFullscreen = element.requestFullscreen ||
        element.mozRequestFullScreen ||
        element.webkitRequestFullscreen ||
        element.msRequestFullscreen;

      if (requestFullscreen) {
        console.log('[9Anime Player] Attempting fullscreen on:', element.tagName, element.className);

        requestFullscreen.call(element).then(() => {
          console.log('[9Anime Player] Fullscreen activated successfully!');
          this.fullscreenRequested = true;
          return;
        }).catch(err => {
          console.warn('[9Anime Player] Fullscreen attempt failed:', err.message);
          // Try next candidate
        });

        // Only try first compatible element
        break;
      }
    }
  }

  showNotification(message) {
    // Create a notification overlay
    const notification = document.createElement('div');
    notification.className = 'anime-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      z-index: 999998;
      animation: slideIn 0.5s ease-out;
      max-width: 300px;
    `;

    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.5s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }, 5000);
  }

  observePageChanges() {
    // Watch for dynamic content changes
    const observer = new MutationObserver((mutations) => {
      // Re-check for video element if we don't have one
      if (!this.video) {
        const video = document.querySelector('video');
        if (video) {
          this.video = video;
          this.setupVideoListeners();
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize player when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AnimePlayer();
  });
} else {
  new AnimePlayer();
}
