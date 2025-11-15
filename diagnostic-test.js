// Diagnostic Test Script - Paste this into Firefox Console (F12)
// This will show you EXACTLY what's happening with the extension

console.clear();
console.log('%c🔬 9Anime Extension Diagnostic Test', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log('=====================================\n');

// Test 1: Check if extension is loaded
console.log('%c1. EXTENSION STATUS:', 'font-weight: bold; color: #4ade80;');
const extensionScripts = Array.from(document.querySelectorAll('script')).filter(s =>
  s.src && s.src.includes('moz-extension')
);
console.log('Extension scripts loaded:', extensionScripts.length);
extensionScripts.forEach((script, i) => {
  console.log(`  Script ${i}:`, script.src);
});

// Test 2: Check if content script messages appear
console.log('\n%c2. CONTENT SCRIPT LOGS:', 'font-weight: bold; color: #4ade80;');
console.log('Look for messages starting with: [9Anime Player]');
console.log('If you see none, the content script is NOT running!');

// Test 3: Test video detection manually
console.log('\n%c3. MANUAL VIDEO DETECTION:', 'font-weight: bold; color: #4ade80;');

// Check main document
const mainVideo = document.querySelector('video');
console.log('Video in main document:', mainVideo ? '✅ FOUND' : '❌ NOT FOUND');
if (mainVideo) {
  console.log('  Video details:', {
    src: mainVideo.src,
    currentSrc: mainVideo.currentSrc,
    paused: mainVideo.paused,
    duration: mainVideo.duration,
    currentTime: mainVideo.currentTime
  });
}

// Check all iframes
const iframes = document.querySelectorAll('iframe');
console.log(`\nIframes on page: ${iframes.length}`);
let videoInIframe = null;
iframes.forEach((iframe, i) => {
  console.log(`  Iframe ${i}:`, {
    src: iframe.src,
    id: iframe.id,
    className: iframe.className
  });

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      const iframeVideo = iframeDoc.querySelector('video');
      if (iframeVideo) {
        console.log(`    ✅ VIDEO FOUND IN THIS IFRAME!`);
        videoInIframe = iframeVideo;
        console.log('    Video details:', {
          src: iframeVideo.src,
          paused: iframeVideo.paused,
          duration: iframeVideo.duration
        });
      }
    } else {
      console.log('    ⚠️  Cannot access iframe (cross-origin)');
    }
  } catch (e) {
    console.log('    ❌ Cannot access iframe:', e.message);
  }
});

// Test 4: Test autoplay manually
console.log('\n%c4. AUTOPLAY TEST:', 'font-weight: bold; color: #4ade80;');
const videoToTest = mainVideo || videoInIframe;
if (videoToTest) {
  console.log('Testing autoplay on found video...');
  videoToTest.play()
    .then(() => console.log('✅ Autoplay SUCCESS'))
    .catch(err => console.log('❌ Autoplay FAILED:', err.message));
} else {
  console.log('❌ No video element found to test autoplay');
}

// Test 5: Test fullscreen manually
console.log('\n%c5. FULLSCREEN TEST:', 'font-weight: bold; color: #4ade80;');
console.log('Testing fullscreen on document...');
if (document.fullscreenEnabled) {
  document.documentElement.requestFullscreen()
    .then(() => {
      console.log('✅ Fullscreen SUCCESS');
      setTimeout(() => {
        document.exitFullscreen();
        console.log('Exited fullscreen for testing');
      }, 2000);
    })
    .catch(err => console.log('❌ Fullscreen FAILED:', err.message));
} else {
  console.log('❌ Fullscreen not enabled in this context');
}

// Test 6: Find Next button
console.log('\n%c6. NEXT BUTTON DETECTION:', 'font-weight: bold; color: #4ade80;');
const allLinks = Array.from(document.querySelectorAll('a, button'));
const nextButtons = allLinks.filter(el => {
  const text = el.textContent.trim().toLowerCase();
  return text.includes('next');
});

console.log(`Next buttons found: ${nextButtons.length}`);
nextButtons.forEach((btn, i) => {
  console.log(`  Next ${i}:`, {
    text: btn.textContent.trim(),
    tagName: btn.tagName,
    href: btn.href || 'N/A',
    className: btn.className,
    id: btn.id,
    disabled: btn.disabled || btn.classList.contains('disabled'),
    onclick: btn.onclick ? '✅ has handler' : '❌ no handler'
  });
});

// Test 7: Episode info
console.log('\n%c7. EPISODE INFORMATION:', 'font-weight: bold; color: #4ade80;');
const url = new URL(window.location.href);
const episodeId = url.searchParams.get('ep');
console.log('Current URL:', url.href);
console.log('Episode ID from URL:', episodeId || 'NOT FOUND');

// Test 8: Check content script is actually injected
console.log('\n%c8. CONTENT SCRIPT INJECTION TEST:', 'font-weight: bold; color: #4ade80;');
console.log('Checking if AnimePlayer class exists...');
setTimeout(() => {
  const scripts = Array.from(document.querySelectorAll('script'));
  const hasContentScript = scripts.some(s => s.textContent.includes('AnimePlayer'));
  console.log('Content script injected:', hasContentScript ? '✅ YES' : '❌ NO');

  if (!hasContentScript) {
    console.log('%c⚠️  CONTENT SCRIPT NOT INJECTED!', 'font-weight: bold; color: #ef4444;');
    console.log('Possible reasons:');
    console.log('1. Extension not loaded properly');
    console.log('2. Content script URL pattern does not match');
    console.log('3. Manifest permissions issue');
    console.log('\nSolution: Reload extension in about:debugging');
  }
}, 1000);

// Test 9: Check if we're on the right page
console.log('\n%c9. PAGE URL CHECK:', 'font-weight: bold; color: #4ade80;');
const isWatchPage = window.location.pathname.includes('/watch/');
console.log('Is watch page:', isWatchPage ? '✅ YES' : '❌ NO');
console.log('URL pattern match:', window.location.href);
if (!isWatchPage) {
  console.log('⚠️  Content script only runs on /watch/* pages!');
}

// Final summary
console.log('\n%c=====================================', 'color: #667eea;');
console.log('%c📊 DIAGNOSTIC SUMMARY:', 'font-weight: bold; font-size: 16px; color: #667eea;');
console.log('');
console.log('Video found:', (mainVideo || videoInIframe) ? '✅' : '❌');
console.log('On watch page:', isWatchPage ? '✅' : '❌');
console.log('Next button found:', nextButtons.length > 0 ? '✅' : '❌');
console.log('Episode ID found:', episodeId ? '✅' : '❌');
console.log('');
console.log('%c🎯 NEXT STEPS:', 'font-weight: bold; color: #f5576c;');
if (!mainVideo && !videoInIframe) {
  console.log('❌ NO VIDEO FOUND - Wait for page to load or check if player is blocked');
}
if (!isWatchPage) {
  console.log('❌ NOT ON WATCH PAGE - Navigate to a watch page');
}
if (nextButtons.length === 0) {
  console.log('⚠️  NO NEXT BUTTON - May be last episode or page not loaded');
}
console.log('');
console.log('Check console above for [9Anime Player] messages');
console.log('If missing, extension is NOT running!');
