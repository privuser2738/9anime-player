// Content script for 9anime watch pages
console.log('[9Anime Player] Content script loaded');

class AnimePlayer {
  constructor() {
    this.video = null;
    this.currentAnime = null;
    this.currentEpisode = null;
    this.genres = [];
    this.nextEpisodeUrl = null;
    this.isLastEpisode = false;
    this.transitionOverlay = null;
    this.fullscreenRequested = false;
    this.videoCheckInterval = null;

    this.init();
  }

  init() {
    console.log('[9Anime Player] Initializing...');

    // Extract anime info from page
    this.extractAnimeInfo();

    // Wait for video element to load
    this.waitForVideo();

    // Set up mutation observer for dynamic content
    this.observePageChanges();

    // Auto-start fullscreen on load
    setTimeout(() => this.enterFullscreen(), 2000);
  }

  extractAnimeInfo() {
    try {
      // Extract anime title
      const titleElement = document.querySelector('h1, .title, [class*="title"]');
      this.currentAnime = titleElement ? titleElement.textContent.trim() : 'Unknown Anime';

      // Extract genres
      const genreElements = document.querySelectorAll('a[href*="/genre/"]');
      this.genres = Array.from(genreElements).map(el => el.textContent.trim());

      // Extract current episode from URL or page
      const urlMatch = window.location.pathname.match(/ep-(\d+)/i);
      if (urlMatch) {
        this.currentEpisode = parseInt(urlMatch[1]);
      } else {
        // Try to find episode number in page content
        const episodeText = document.body.textContent.match(/episode\s+(\d+)/i);
        this.currentEpisode = episodeText ? parseInt(episodeText[1]) : 1;
      }

      // Find next/prev episode links
      this.findEpisodeNavigation();

      console.log('[9Anime Player] Anime info:', {
        anime: this.currentAnime,
        episode: this.currentEpisode,
        genres: this.genres,
        nextUrl: this.nextEpisodeUrl,
        isLast: this.isLastEpisode
      });
    } catch (error) {
      console.error('[9Anime Player] Error extracting anime info:', error);
    }
  }

  findEpisodeNavigation() {
    // Look for Next button
    const nextButton = document.querySelector('a.btn-next, a[title*="Next"], a:contains("Next"), .next-episode');
    if (nextButton && nextButton.href) {
      this.nextEpisodeUrl = nextButton.href;
      this.isLastEpisode = false;
    } else {
      // Try to construct next episode URL
      const currentUrl = window.location.href;
      const epMatch = currentUrl.match(/(.*ep-)(\d+)(.*)/);
      if (epMatch) {
        const nextEp = parseInt(epMatch[2]) + 1;
        this.nextEpisodeUrl = `${epMatch[1]}${nextEp}${epMatch[3]}`;
      } else {
        this.isLastEpisode = true;
      }
    }

    // Check if "Next" button is disabled
    const nextBtnDisabled = document.querySelector('.btn-next.disabled, .next-episode.disabled');
    if (nextBtnDisabled) {
      this.isLastEpisode = true;
    }
  }

  waitForVideo() {
    console.log('[9Anime Player] Waiting for video element...');

    this.videoCheckInterval = setInterval(() => {
      // Look for video element in various possible containers
      const video = document.querySelector('video');

      if (video && !this.video) {
        console.log('[9Anime Player] Video element found!');
        this.video = video;
        clearInterval(this.videoCheckInterval);
        this.setupVideoListeners();
      }
    }, 500);

    // Give up after 30 seconds
    setTimeout(() => {
      if (this.videoCheckInterval) {
        clearInterval(this.videoCheckInterval);
        console.warn('[9Anime Player] Video element not found after 30s');
      }
    }, 30000);
  }

  setupVideoListeners() {
    if (!this.video) return;

    console.log('[9Anime Player] Setting up video listeners');

    // Auto-play video
    this.video.play().catch(err => {
      console.warn('[9Anime Player] Auto-play failed:', err);
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
    console.log('[9Anime Player] Navigating to next episode:', this.nextEpisodeUrl);

    // Notify background script
    browser.runtime.sendMessage({
      type: 'episodeEnded',
      data: {
        anime: this.currentAnime,
        episode: this.currentEpisode
      }
    });

    // Navigate to next episode
    window.location.href = this.nextEpisodeUrl;
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
    // Find the video container or video element
    const videoContainer = document.querySelector('.player-container, .video-container, #player') || this.video;

    if (videoContainer) {
      const requestFullscreen = videoContainer.requestFullscreen ||
        videoContainer.mozRequestFullScreen ||
        videoContainer.webkitRequestFullscreen ||
        videoContainer.msRequestFullscreen;

      if (requestFullscreen) {
        requestFullscreen.call(videoContainer).then(() => {
          console.log('[9Anime Player] Fullscreen requested');
          this.fullscreenRequested = true;
        }).catch(err => {
          console.warn('[9Anime Player] Fullscreen request failed:', err);
        });
      }
    }
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
