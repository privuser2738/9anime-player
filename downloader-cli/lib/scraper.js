const fetch = require('node-fetch');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

class AnimeScraper {
  constructor() {
    this.baseUrl = 'https://9animetv.to';
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async searchAnime(genre, minYear = 2020) {
    const genreSlug = genre.toLowerCase().replace(/\s+/g, '-');
    const url = `${this.baseUrl}/genre/${genreSlug}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const animeList = [];

      // Parse anime items from page
      $('a[href*="/watch/"]').each((i, elem) => {
        const href = $(elem).attr('href');
        const title = $(elem).text().trim();

        // Filter out episode links (only want anime titles)
        if (href && !href.includes('?ep=') && title && title.length > 0) {
          const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;

          // Avoid duplicates
          if (!animeList.find(a => a.url === fullUrl)) {
            animeList.push({
              title: title,
              url: fullUrl,
              genre: genre
            });
          }
        }
      });

      return animeList;

    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
      throw error;
    }
  }

  async getEpisodes(animeUrl) {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      // Navigate to anime page
      await page.goto(animeUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait for episode list to load
      await page.waitForSelector('.block_area-episodes', { timeout: 10000 });

      // Give JavaScript time to populate episodes
      await page.waitForTimeout(2000);

      // Extract episode links
      const episodes = await page.evaluate((baseUrl) => {
        const episodeLinks = Array.from(document.querySelectorAll('a[href*="?ep="]'));
        const episodeData = [];

        episodeLinks.forEach(link => {
          const href = link.getAttribute('href');
          const text = link.textContent.trim();

          if (href) {
            const epMatch = href.match(/\?ep=(\d+)/);
            if (epMatch) {
              const epId = epMatch[1];
              const fullUrl = href.startsWith('http') ? href : baseUrl + href;

              // Avoid duplicates
              if (!episodeData.find(e => e.id === epId)) {
                episodeData.push({
                  id: epId,
                  number: episodeData.length + 1,
                  url: fullUrl,
                  title: text || `Episode ${episodeData.length + 1}`
                });
              }
            }
          }
        });

        return episodeData;
      }, this.baseUrl);

      // Sort by episode ID
      episodes.sort((a, b) => parseInt(a.id) - parseInt(b.id));

      await page.close();
      return episodes;

    } catch (error) {
      await page.close();
      console.error(`Error fetching episodes from ${animeUrl}:`, error.message);
      return []; // Return empty array instead of throwing
    }
  }
}

module.exports = AnimeScraper;
