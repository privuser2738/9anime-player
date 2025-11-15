const AnimeScraper = require('./lib/scraper');
const AnimeDownloader = require('./lib/downloader');

async function test() {
  const scraper = new AnimeScraper();
  const downloader = new AnimeDownloader(scraper);

  const url = 'https://anify.to/watch/1012/the-banished-court-magician-aims-to-become-the-strongest/7';

  console.log('Testing anify.to extraction...\n');
  console.log(`URL: ${url}\n`);

  try {
    console.log('Extracting video URL...');
    const videoUrl = await downloader.extractAnifyUrl(url);

    console.log('\n✅ Extracted video URL:');
    console.log(videoUrl);
    console.log('\nURL length:', videoUrl ? videoUrl.length : 0);
    console.log('URL type:', typeof videoUrl);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await scraper.closeBrowser();
    console.log('\nBrowser closed.');
  }
}

test();
