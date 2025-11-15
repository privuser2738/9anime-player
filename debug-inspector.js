// Debug Inspector for 9anime - Run this in Firefox Console (F12)
// Copy and paste this entire script into the console while on a 9anime watch page

console.clear();
console.log('%c🔍 9Anime Page Inspector', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log('=====================================\n');

// 1. Find all video elements
console.log('%c1. VIDEO ELEMENTS:', 'font-weight: bold; color: #4ade80;');
const videos = document.querySelectorAll('video');
console.log('Found', videos.length, 'video element(s)');
videos.forEach((video, i) => {
  console.log(`Video ${i}:`, {
    src: video.src,
    currentSrc: video.currentSrc,
    paused: video.paused,
    duration: video.duration,
    parent: video.parentElement?.tagName,
    parentClass: video.parentElement?.className,
    parentId: video.parentElement?.id
  });
});

// 2. Find all iframes
console.log('\n%c2. IFRAMES:', 'font-weight: bold; color: #4ade80;');
const iframes = document.querySelectorAll('iframe');
console.log('Found', iframes.length, 'iframe(s)');
iframes.forEach((iframe, i) => {
  console.log(`Iframe ${i}:`, {
    src: iframe.src,
    id: iframe.id,
    className: iframe.className,
    width: iframe.width,
    height: iframe.height
  });

  // Try to access iframe content
  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const iframeVideos = iframeDoc.querySelectorAll('video');
    if (iframeVideos.length > 0) {
      console.log(`  ✅ Found ${iframeVideos.length} video(s) inside this iframe!`);
      iframeVideos.forEach((v, j) => {
        console.log(`    Video ${j}:`, {
          src: v.src,
          paused: v.paused,
          duration: v.duration
        });
      });
    }
  } catch (e) {
    console.log('  ⚠️ Cannot access iframe (cross-origin):', e.message);
  }
});

// 3. Find Next/Prev buttons
console.log('\n%c3. NAVIGATION BUTTONS:', 'font-weight: bold; color: #4ade80;');
const allLinks = Array.from(document.querySelectorAll('a, button'));
const nextButtons = allLinks.filter(el => {
  const text = el.textContent.trim().toLowerCase();
  return text.includes('next');
});
const prevButtons = allLinks.filter(el => {
  const text = el.textContent.trim().toLowerCase();
  return text.includes('prev');
});

console.log('Next buttons found:', nextButtons.length);
nextButtons.forEach((btn, i) => {
  console.log(`Next ${i}:`, {
    text: btn.textContent.trim(),
    href: btn.href,
    className: btn.className,
    id: btn.id,
    disabled: btn.disabled || btn.classList.contains('disabled'),
    onclick: btn.onclick ? 'has onclick handler' : 'no onclick'
  });
});

console.log('\nPrev buttons found:', prevButtons.length);
prevButtons.forEach((btn, i) => {
  console.log(`Prev ${i}:`, {
    text: btn.textContent.trim(),
    href: btn.href,
    className: btn.className,
    disabled: btn.disabled || btn.classList.contains('disabled')
  });
});

// 4. Find episode list
console.log('\n%c4. EPISODE LIST:', 'font-weight: bold; color: #4ade80;');
const episodeSelectors = [
  '.ep-item',
  '.episode-item',
  '[class*="episode"]',
  '[class*="ep-"]',
  '[data-id]'
];

let episodeElements = [];
for (const selector of episodeSelectors) {
  const elements = document.querySelectorAll(selector);
  if (elements.length > 0) {
    console.log(`Found ${elements.length} elements with selector: ${selector}`);
    episodeElements = Array.from(elements);
    break;
  }
}

if (episodeElements.length > 0) {
  console.log('First 5 episode items:');
  episodeElements.slice(0, 5).forEach((ep, i) => {
    console.log(`Episode ${i}:`, {
      className: ep.className,
      id: ep.id,
      dataId: ep.getAttribute('data-id'),
      dataNumber: ep.getAttribute('data-number'),
      text: ep.textContent.trim().substring(0, 50),
      href: ep.href || ep.querySelector('a')?.href,
      isActive: ep.classList.contains('active')
    });
  });

  // Find active episode
  const activeEp = episodeElements.find(ep => ep.classList.contains('active'));
  if (activeEp) {
    console.log('\n✅ Active episode:', {
      className: activeEp.className,
      dataId: activeEp.getAttribute('data-id'),
      text: activeEp.textContent.trim()
    });
  }
}

// 5. Current URL info
console.log('\n%c5. URL INFORMATION:', 'font-weight: bold; color: #4ade80;');
const url = new URL(window.location.href);
console.log({
  pathname: url.pathname,
  search: url.search,
  episodeParam: url.searchParams.get('ep'),
  fullUrl: url.href
});

// 6. Player containers
console.log('\n%c6. PLAYER CONTAINERS:', 'font-weight: bold; color: #4ade80;');
const playerSelectors = [
  '#player',
  '.player',
  '.player-container',
  '.video-container',
  '[class*="player"]',
  '[id*="player"]'
];

playerSelectors.forEach(selector => {
  const elements = document.querySelectorAll(selector);
  if (elements.length > 0) {
    console.log(`${selector}: ${elements.length} element(s)`);
    elements.forEach((el, i) => {
      console.log(`  ${i}:`, {
        id: el.id,
        className: el.className,
        tagName: el.tagName
      });
    });
  }
});

// 7. Global variables
console.log('\n%c7. GLOBAL VARIABLES:', 'font-weight: bold; color: #4ade80;');
const globalVars = ['player', 'episode', 'anime', 'episodes', 'currentEpisode'];
globalVars.forEach(varName => {
  if (window[varName]) {
    console.log(`window.${varName}:`, window[varName]);
  }
});

console.log('\n%c=====================================', 'color: #667eea;');
console.log('%c✅ Inspection complete! Check the results above.', 'font-weight: bold; color: #4ade80;');
console.log('\nNext steps:');
console.log('1. Look for video elements in iframes');
console.log('2. Check which Next button is the correct one');
console.log('3. Verify episode list structure');
