// Background script for managing extension state and communication

// Extension state
let extensionState = {
  enabled: true,
  currentAnime: null,
  currentEpisode: null,
  genres: [],
  watchHistory: []
};

// Load state from storage on startup
browser.storage.local.get(['extensionState']).then((result) => {
  if (result.extensionState) {
    extensionState = result.extensionState;
  }
});

// Save state periodically
function saveState() {
  browser.storage.local.set({ extensionState });
}

// Listen for messages from content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[9Anime Player] Background received message:', message);

  switch (message.type) {
    case 'getState':
      sendResponse({ state: extensionState });
      break;

    case 'updateState':
      extensionState = { ...extensionState, ...message.data };
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

    default:
      console.warn('[9Anime Player] Unknown message type:', message.type);
  }
});

// Handle episode completion - navigate to next episode
function handleEpisodeEnded(data, tabId) {
  console.log('[9Anime Player] Episode ended:', data);

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

  // The content script will handle finding and navigating to new anime
}

// Fetch anime list by genre
async function fetchGenreAnime(genre) {
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

    return { success: true, anime: animeLinks };
  } catch (error) {
    console.error('[9Anime Player] Error fetching genre anime:', error);
    return { success: false, error: error.message };
  }
}

// Keep track of fullscreen state
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('9animetv.to/watch/')) {
    console.log('[9Anime Player] Tab updated:', tab.url);
  }
});

console.log('[9Anime Player] Background script loaded');
