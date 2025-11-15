// Background script for managing extension state and communication

// Import logger (will be loaded via manifest.json)
// Logger will be available as window.verboseLogger

// Extension state
let extensionState = {
  enabled: true,
  currentAnime: null,
  currentEpisode: null,
  genres: [],
  watchHistory: []
};

// Initialize logger reference (will be set after logger.js loads)
let logger = null;

// Load state from storage on startup
browser.storage.local.get(['extensionState']).then((result) => {
  if (result.extensionState) {
    extensionState = result.extensionState;
    if (logger) logger.logStateChange('Extension state loaded from storage', { state: extensionState });
  }
});

// Wait for logger to be available
setTimeout(() => {
  if (typeof VerboseLogger !== 'undefined') {
    logger = new VerboseLogger();
    logger.logStorage('Background script initialized', { extensionState });
  }
}, 100);

// Save state periodically
function saveState() {
  if (logger) logger.logStorage('Saving extension state', { extensionState });
  browser.storage.local.set({ extensionState });
}

// Listen for messages from content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[9Anime Player] Background received message:', message);

  if (logger) {
    logger.logUserInteraction('Message received from content script', {
      messageType: message.type,
      tabId: sender.tab?.id,
      url: sender.tab?.url
    });
  }

  switch (message.type) {
    case 'getState':
      if (logger) logger.logStateChange('State requested', { extensionState });
      sendResponse({ state: extensionState });
      break;

    case 'updateState':
      const oldState = { ...extensionState };
      extensionState = { ...extensionState, ...message.data };
      if (logger) {
        logger.logStateChange('State updated', {
          oldState,
          newState: extensionState,
          changes: message.data
        });
      }
      saveState();
      sendResponse({ success: true });
      break;

    case 'episodeEnded':
      handleEpisodeEnded(message.data, sender.tab.id);
      break;

    case 'seriesEnded':
      handleSeriesEnded(message.data, sender.tab.id);
      break;

    case 'fetchGenreAnime':
      fetchGenreAnime(message.genre).then(sendResponse);
      return true; // Async response

    case 'getVerboseLogs':
      if (logger) {
        logger.getLogs().then(logs => {
          sendResponse({ logs, stats: logger.getStatistics() });
        });
      } else {
        sendResponse({ logs: [], stats: {} });
      }
      return true; // Async response

    case 'clearVerboseLogs':
      if (logger) {
        logger.clearLogs().then(() => {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false });
      }
      return true;

    case 'setLoggerEnabled':
      if (logger) {
        logger.setEnabled(message.enabled).then(() => {
          sendResponse({ success: true, enabled: message.enabled });
        });
      } else {
        sendResponse({ success: false });
      }
      return true;

    default:
      console.warn('[9Anime Player] Unknown message type:', message.type);
      if (logger) logger.logError('Unknown message type received', { messageType: message.type });
  }
});

// Handle episode completion - navigate to next episode
function handleEpisodeEnded(data, tabId) {
  console.log('[9Anime Player] Episode ended:', data);

  if (logger) {
    logger.logVideoEvent('Episode ended', {
      anime: data.anime,
      episode: data.episode,
      tabId
    });
  }

  // Store in history
  extensionState.watchHistory.push({
    anime: data.anime,
    episode: data.episode,
    timestamp: Date.now()
  });
  saveState();

  // The content script will handle navigation to next episode
}

// Handle series completion - find new anime by genre
function handleSeriesEnded(data, tabId) {
  console.log('[9Anime Player] Series ended:', data);

  if (logger) {
    logger.logVideoEvent('Series ended', {
      anime: data.anime,
      totalEpisodesWatched: data.totalEpisodes,
      tabId
    });
  }

  // The content script will handle finding and navigating to new anime
}

// Fetch anime list by genre
async function fetchGenreAnime(genre) {
  const startTime = performance.now();

  if (logger) {
    logger.logApiCall('Fetching anime by genre', {
      genre,
      url: `https://9animetv.to/genre/${genre.toLowerCase().replace(/\s+/g, '-')}`
    });
  }

  try {
    const genreSlug = genre.toLowerCase().replace(/\s+/g, '-');
    const response = await fetch(`https://9animetv.to/genre/${genreSlug}`);
    const html = await response.text();

    // Parse anime list from HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // This is a simplified parser - actual implementation would need to match
    // the exact structure of 9anime's genre pages
    const animeLinks = Array.from(doc.querySelectorAll('a[href*="/watch/"]'))
      .map(a => ({
        title: a.textContent.trim(),
        url: a.href
      }))
      .filter(item => item.url && item.title);

    const duration = performance.now() - startTime;

    if (logger) {
      logger.logApiCall('Genre anime fetched successfully', {
        genre,
        animeCount: animeLinks.length,
        duration: `${duration.toFixed(2)}ms`,
        status: response.status
      });
    }

    return { success: true, anime: animeLinks };
  } catch (error) {
    console.error('[9Anime Player] Error fetching genre anime:', error);

    const duration = performance.now() - startTime;

    if (logger) {
      logger.logError('Failed to fetch genre anime', {
        genre,
        error: error.message,
        duration: `${duration.toFixed(2)}ms`
      });
    }

    return { success: false, error: error.message };
  }
}

// Keep track of fullscreen state
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('9animetv.to/watch/')) {
    console.log('[9Anime Player] Tab updated:', tab.url);

    if (logger) {
      logger.logNavigation('Tab updated - anime page loaded', {
        tabId,
        url: tab.url,
        changeInfo
      });
    }
  }
});

console.log('[9Anime Player] Background script loaded');
