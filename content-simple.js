// Simplified 9Anime Auto-Player - Uses click simulation and URL navigation
console.log('[9Anime AutoPlay] Simple version loaded');

class SimpleAnimePlayer {
  constructor() {
    this.currentEpisodeId = null;
    this.nextEpisodeUrl = null;
    this.episodes = [];
    this.autoPlayTimer = null;
    this.checkInterval = null;

    this.init();
  }

  init() {
    console.log('[9Anime AutoPlay] Initializing simple player...');

    // Extract current episode from URL
    const urlParams = new URLSearchParams(window.location.search);
    this.currentEpisodeId = urlParams.get('ep');
    console.log('[9Anime AutoPlay] Current episode ID:', this.currentEpisodeId);

    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }

  start() {
    console.log('[9Anime AutoPlay] Starting...');

    // Check if 9anime's auto-next is enabled
    setTimeout(() => this.check9animeAutoNext(), 1000);

    // Step 1: Click play button after page loads
    setTimeout(() => this.clickPlayButton(), 2000);

    // Step 2: Find next episode (numerically)
    setTimeout(() => this.findNextEpisode(), 3000);

    // Step 3: Monitor for video end or set timer
    setTimeout(() => this.setupAutoAdvance(), 5000);
  }

  check9animeAutoNext() {
    // Look for 9anime's auto-next toggle
    const autoNextToggles = Array.from(document.querySelectorAll('*')).filter(el => {
      const text = el.textContent.toLowerCase();
      return text.includes('auto next') || text.includes('autonext');
    });

    if (autoNextToggles.length > 0) {
      console.log('[9Anime AutoPlay] Found 9anime auto-next controls:', autoNextToggles.length);
      console.log('[9Anime AutoPlay] ⚠️ 9anime has built-in auto-next!');
      console.log('[9Anime AutoPlay] Make sure it is ENABLED or our extension will handle navigation');

      // Try to enable it if it's a checkbox/toggle
      autoNextToggles.forEach(toggle => {
        const checkbox = toggle.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) {
          console.log('[9Anime AutoPlay] Enabling 9anime auto-next...');
          checkbox.click();
        }
      });
    }
  }

  clickPlayButton() {
    console.log('[9Anime AutoPlay] Looking for play button...');

    // Try multiple play button selectors
    const playSelectors = [
      'button.play',
      'button[aria-label*="play" i]',
      'button[title*="play" i]',
      '.vjs-big-play-button',
      '.video-play-button',
      'button.btn-play',
      '[class*="play"][class*="button"]',
      // Generic video controls
      'video ~ button',
      'video + button',
    ];

    for (const selector of playSelectors) {
      const buttons = document.querySelectorAll(selector);
      if (buttons.length > 0) {
        console.log('[9Anime AutoPlay] Found play button with selector:', selector);
        buttons.forEach(btn => {
          try {
            btn.click();
            console.log('[9Anime AutoPlay] ✅ Clicked play button');
          } catch (e) {
            console.warn('[9Anime AutoPlay] Failed to click:', e);
          }
        });
        return;
      }
    }

    // Fallback: Try to find and click any video element
    const videos = document.querySelectorAll('video');
    if (videos.length > 0) {
      console.log('[9Anime AutoPlay] Found video element, trying to click it');
      videos[0].click();

      // Also try to call play() directly
      videos[0].play().then(() => {
        console.log('[9Anime AutoPlay] ✅ Video.play() succeeded');
      }).catch(err => {
        console.log('[9Anime AutoPlay] Video.play() failed:', err.message);
      });
    }

    // Try again in iframes
    this.clickPlayInIframes();
  }

  clickPlayInIframes() {
    const iframes = document.querySelectorAll('iframe');
    console.log('[9Anime AutoPlay] Checking', iframes.length, 'iframes for play button');

    iframes.forEach((iframe, i) => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc) {
          // Try to find play button in iframe
          const playBtn = iframeDoc.querySelector('button[class*="play"], .vjs-big-play-button');
          if (playBtn) {
            console.log('[9Anime AutoPlay] ✅ Found play button in iframe', i);
            playBtn.click();
          }

          // Try to play video directly
          const video = iframeDoc.querySelector('video');
          if (video) {
            console.log('[9Anime AutoPlay] Found video in iframe', i);
            video.play().catch(e => console.log('Iframe video play failed:', e.message));
          }
        }
      } catch (e) {
        // Cross-origin iframe, can't access
        console.log('[9Anime AutoPlay] Cannot access iframe', i, '(cross-origin)');
      }
    });
  }

  findNextEpisode() {
    console.log('[9Anime AutoPlay] Finding next episode...');

    // Method 1: Find in episode list
    const episodeSelectors = [
      '.ep-item',
      '.episode-item',
      '[class*="episode"]',
      '[data-id]',
      'a[href*="?ep="]'
    ];

    for (const selector of episodeSelectors) {
      const items = Array.from(document.querySelectorAll(selector));
      if (items.length > 0) {
        console.log('[9Anime AutoPlay] Found', items.length, 'episodes with selector:', selector);
        this.episodes = items;

        // Find current episode index
        const currentIndex = items.findIndex(item => {
          const itemEpId = item.getAttribute('data-id') ||
                          new URLSearchParams(item.href?.split('?')[1] || '').get('ep');
          return itemEpId === this.currentEpisodeId || item.classList.contains('active');
        });

        if (currentIndex >= 0) {
          console.log('[9Anime AutoPlay] Current episode index:', currentIndex);

          // Get next episode
          if (currentIndex < items.length - 1) {
            const nextItem = items[currentIndex + 1];
            this.nextEpisodeUrl = nextItem.href || nextItem.querySelector('a')?.href;

            if (!this.nextEpisodeUrl) {
              // Try to construct URL from data-id
              const nextEpId = nextItem.getAttribute('data-id');
              if (nextEpId) {
                this.nextEpisodeUrl = `${window.location.pathname}?ep=${nextEpId}`;
              }
            }

            console.log('[9Anime AutoPlay] ✅ Next episode URL:', this.nextEpisodeUrl);
            return;
          } else {
            console.log('[9Anime AutoPlay] This is the last episode');
            this.nextEpisodeUrl = null;
            return;
          }
        }
      }
    }

    // Method 2: Find Next button and extract URL
    this.findNextButton();
  }

  findNextButton() {
    console.log('[9Anime AutoPlay] Looking for Next button...');

    const allLinks = Array.from(document.querySelectorAll('a, button'));
    const nextButton = allLinks.find(el => {
      const text = el.textContent.trim().toLowerCase();
      return text === 'next' || text === 'next episode' || text.includes('next ep');
    });

    if (nextButton) {
      console.log('[9Anime AutoPlay] ✅ Found Next button');

      if (nextButton.href && !nextButton.href.includes('javascript:')) {
        this.nextEpisodeUrl = nextButton.href;
        console.log('[9Anime AutoPlay] Next URL from button:', this.nextEpisodeUrl);
      } else {
        // Button uses JavaScript, we'll just click it later
        this.nextButton = nextButton;
        console.log('[9Anime AutoPlay] Next button uses JavaScript handler');
      }
    } else {
      console.log('[9Anime AutoPlay] ⚠️ No Next button found');
    }
  }

  setupAutoAdvance() {
    console.log('[9Anime AutoPlay] Setting up auto-advance...');

    // Try to detect video duration
    let video = document.querySelector('video');

    if (!video) {
      console.log('[9Anime AutoPlay] No video in main document, checking iframes...');
      video = this.findVideoInIframes();
    }

    if (video) {
      console.log('[9Anime AutoPlay] ✅ Video found!', {
        duration: video.duration,
        currentTime: video.currentTime,
        paused: video.paused
      });

      // Show notification that we're monitoring
      this.showNotification('AutoPlay Active - Will advance to next episode automatically');

      let hasTriggeredAdvance = false;

      // Method 1: Time-based monitoring
      const timeCheckInterval = setInterval(() => {
        if (video.duration && !hasTriggeredAdvance) {
          const timeRemaining = video.duration - video.currentTime;

          if (timeRemaining <= 30 && timeRemaining > 0) {
            console.log('[9Anime AutoPlay] ⏰ 30 seconds remaining!');
            hasTriggeredAdvance = true;
            clearInterval(timeCheckInterval);

            this.showNotification(`Next episode in 30 seconds...`);
            setTimeout(() => this.goToNextEpisode(), 30000);
          }
        }
      }, 1000); // Check every second

      // Method 2: Video ended event
      video.addEventListener('ended', () => {
        console.log('[9Anime AutoPlay] 🎬 Video ended event fired!');
        if (!hasTriggeredAdvance) {
          hasTriggeredAdvance = true;
          clearInterval(timeCheckInterval);
          this.goToNextEpisode();
        }
      });

      // Method 3: Fallback timer (in case video events don't fire)
      setTimeout(() => {
        if (!hasTriggeredAdvance) {
          console.log('[9Anime AutoPlay] ⏰ Fallback timer triggered (24 min)');
          hasTriggeredAdvance = true;
          clearInterval(timeCheckInterval);
          this.goToNextEpisode();
        }
      }, 24 * 60 * 1000); // 24 minutes

    } else {
      // No video found - use short timer for testing
      console.log('[9Anime AutoPlay] ⚠️ No video found, using 2-minute test timer');
      this.showNotification('No video detected - will advance in 2 minutes (test mode)');

      this.autoPlayTimer = setTimeout(() => {
        console.log('[9Anime AutoPlay] Test timer expired, advancing...');
        this.goToNextEpisode();
      }, 2 * 60 * 1000); // 2 minutes for testing
    }
  }

  findVideoInIframes() {
    const iframes = document.querySelectorAll('iframe');
    for (const iframe of iframes) {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const video = iframeDoc?.querySelector('video');
        if (video) return video;
      } catch (e) {
        // Cross-origin
      }
    }
    return null;
  }

  goToNextEpisode() {
    console.log('[9Anime AutoPlay] 🚀 ADVANCING TO NEXT EPISODE...');
    console.log('[9Anime AutoPlay] Next URL:', this.nextEpisodeUrl);
    console.log('[9Anime AutoPlay] Next button:', this.nextButton);

    // Clear any existing timers
    if (this.autoPlayTimer) {
      clearTimeout(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }

    // Show countdown notification
    this.showNotification('Loading next episode...', 3000);

    // Wait 3 seconds then navigate
    setTimeout(() => {
      if (this.nextEpisodeUrl) {
        console.log('[9Anime AutoPlay] ✅ NAVIGATING TO:', this.nextEpisodeUrl);
        window.location.href = this.nextEpisodeUrl;
      } else if (this.nextButton) {
        console.log('[9Anime AutoPlay] ✅ CLICKING NEXT BUTTON');
        this.nextButton.click();

        // If click didn't navigate, try to find URL
        setTimeout(() => {
          if (window.location.href === this.currentUrl) {
            console.log('[9Anime AutoPlay] Button click did not navigate, retrying...');
            this.findNextEpisode();
            if (this.nextEpisodeUrl) {
              window.location.href = this.nextEpisodeUrl;
            }
          }
        }, 2000);
      } else {
        console.log('[9Anime AutoPlay] ❌ NO NEXT EPISODE FOUND!');
        console.log('[9Anime AutoPlay] Attempting to re-scan for next episode...');

        // Try to find next episode again
        this.findNextEpisode();

        if (this.nextEpisodeUrl) {
          console.log('[9Anime AutoPlay] ✅ Found on retry:', this.nextEpisodeUrl);
          window.location.href = this.nextEpisodeUrl;
        } else {
          console.log('[9Anime AutoPlay] ⚠️ Series ended - no more episodes');
          this.showNotification('Series ended - no more episodes', 5000);
        }
      }
    }, 3000);
  }

  showNotification(message, duration = 5000) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #667eea;
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      font-family: sans-serif;
      font-size: 14px;
      z-index: 999999;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, duration);
  }
}

// Initialize when on watch page
if (window.location.pathname.includes('/watch/')) {
  new SimpleAnimePlayer();
} else {
  console.log('[9Anime AutoPlay] Not on watch page, skipping');
}
