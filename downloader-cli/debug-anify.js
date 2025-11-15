const puppeteer = require('puppeteer');
const fs = require('fs');

async function debug() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    const url = 'https://anify.to/watch/1012/the-banished-court-magician-aims-to-become-the-strongest/7';

    console.log('Navigating to:', url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('Waiting 5 seconds...');
    await page.waitForTimeout(5000);

    // Take screenshot
    await page.screenshot({ path: 'anify-screenshot.png', fullPage: true });
    console.log('Screenshot saved: anify-screenshot.png');

    // Save HTML
    const html = await page.content();
    fs.writeFileSync('anify-page.html', html);
    console.log('HTML saved: anify-page.html');

    // Get all element IDs
    const ids = await page.evaluate(() => {
      const elements = document.querySelectorAll('[id]');
      return Array.from(elements).map(el => el.id);
    });

    console.log('\nFound element IDs:', ids);

    // Look for video-related elements
    const videoElements = await page.evaluate(() => {
      const videos = document.querySelectorAll('video, iframe, [class*="video"], [id*="video"]');
      return Array.from(videos).map(el => ({
        tag: el.tagName,
        id: el.id || 'none',
        class: el.className || 'none',
        src: el.src || 'none'
      }));
    });

    console.log('\nVideo-related elements:', JSON.stringify(videoElements, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

debug();
