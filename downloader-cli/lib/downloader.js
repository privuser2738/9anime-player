const execa = require('execa');
const path = require('path');
const fs = require('fs');

class AnimeDownloader {
  constructor(scraper) {
    this.ytDlpPath = 'yt-dlp'; // Assumes yt-dlp is in PATH
    this.scraper = scraper; // Reference to scraper for browser access
  }

  async extractVideoUrl(episodeUrl) {
    const browser = await this.scraper.initBrowser();
    const page = await browser.newPage();

    try {
      // Navigate to episode page
      await page.goto(episodeUrl, { waitUntil: 'networkidle2', timeout: 60000 });

      // Wait for video player iframe to load
      await page.waitForSelector('iframe', { timeout: 15000 });
      await page.waitForTimeout(2000);

      // Get the rapid-cloud.co iframe URL
      const embedUrl = await page.evaluate(() => {
        const iframes = document.querySelectorAll('iframe');
        for (let iframe of iframes) {
          const src = iframe.src;
          if (src && src.includes('rapid-cloud.co')) {
            return src;
          }
        }
        return null;
      });

      await page.close();

      if (!embedUrl) {
        throw new Error('Could not find rapid-cloud.co iframe');
      }

      // Now navigate directly to the embed URL and extract video
      const embedPage = await browser.newPage();
      let videoUrl = null;

      // Set up request interception to catch video URLs
      await embedPage.setRequestInterception(true);
      embedPage.on('request', request => {
        const url = request.url();
        // Look for actual video files or m3u8 playlists
        if ((url.includes('.m3u8') || url.includes('.mp4') || url.includes('.ts')) && !videoUrl) {
          // Capture the URL but only if it's not a fragment
          if (!url.includes('seg-') && !url.includes('.ts')) {
            videoUrl = url;
          }
        }
        request.continue();
      });

      // Navigate to rapid-cloud embed
      await embedPage.goto(embedUrl, { waitUntil: 'networkidle2', timeout: 60000 });

      // Wait for video element to appear
      await embedPage.waitForSelector('video', { timeout: 15000 });
      await embedPage.waitForTimeout(3000);

      // Try to get video src directly
      const directVideoUrl = await embedPage.evaluate(() => {
        const video = document.querySelector('video');
        if (video) {
          return video.src || video.currentSrc || null;
        }
        return null;
      });

      await embedPage.close();

      // Return whichever we found
      const finalUrl = directVideoUrl || videoUrl;

      if (!finalUrl) {
        throw new Error('Could not extract video URL from rapid-cloud player');
      }

      return finalUrl;

    } catch (error) {
      if (page && !page.isClosed()) await page.close();
      throw new Error(`Failed to extract video URL: ${error.message}`);
    }
  }

  async extractAnifyUrl(anifyUrl) {
    const browser = await this.scraper.initBrowser();
    const page = await browser.newPage();

    try {
      let videoUrl = null;
      const capturedRequests = [];

      // Set up request interception to catch ALL requests
      await page.setRequestInterception(true);
      page.on('request', request => {
        const url = request.url();

        // Log video-like requests for debugging
        if (url.includes('.m3u8') || url.includes('.mp4') || url.includes('video') || url.includes('stream')) {
          capturedRequests.push(url);
          console.log('📡 Captured request:', url.substring(0, 100));
        }

        // Look for actual video files or m3u8 playlists
        if ((url.includes('.m3u8') || url.includes('.mp4')) && !videoUrl) {
          // Capture m3u8 playlist or mp4 files
          if (url.includes('.m3u8') || (url.includes('.mp4') && !url.includes('seg-'))) {
            videoUrl = url;
            console.log('✅ Found video URL via interception:', url.substring(0, 100));
          }
        }
        request.continue();
      });

      console.log('🌐 Navigating to anify.to...');
      // Navigate to anify page
      await page.goto(anifyUrl, { waitUntil: 'networkidle2', timeout: 60000 });

      console.log('⏳ Waiting for page to load...');
      await page.waitForTimeout(3000);

      // Wait for the videowrapper div
      console.log('🔍 Looking for #videowrapper...');
      await page.waitForSelector('#videowrapper', { timeout: 15000 });

      // Wait for iframe to be injected by JavaScript
      console.log('⏳ Waiting for iframe to be injected...');
      await page.waitForSelector('#videowrapper iframe', { timeout: 15000 });

      console.log('✅ Found iframe in videowrapper');

      // Get page info for debugging
      const pageInfo = await page.evaluate(() => {
        const videos = document.querySelectorAll('video');
        const iframes = document.querySelectorAll('iframe');

        return {
          title: document.title,
          videoCount: videos.length,
          iframeCount: iframes.length,
          videoSources: Array.from(videos).map(v => ({
            src: v.src || v.currentSrc || 'none',
            tagName: v.tagName
          })),
          iframeSources: Array.from(iframes).map(i => ({
            src: i.src || 'none',
            tagName: i.tagName
          }))
        };
      });

      console.log('📄 Page info:', JSON.stringify(pageInfo, null, 2));

      // Get the iframe src from videowrapper
      const iframeSrc = await page.evaluate(() => {
        const iframe = document.querySelector('#videowrapper iframe');
        return iframe ? iframe.src : null;
      });

      if (iframeSrc) {
        console.log('📹 Found iframe URL:', iframeSrc.substring(0, 100));
      } else {
        console.log('❌ No iframe found in #videowrapper');
      }

      console.log('📊 Total captured requests:', capturedRequests.length);

      await page.close();

      // If we found an iframe src, navigate to it and extract video
      if (iframeSrc && !videoUrl) {
        console.log('🔄 Navigating to embed iframe...');
        const embedPage = await browser.newPage();
        let embedVideoUrl = null;

        // Set up interception for embed page
        await embedPage.setRequestInterception(true);
        embedPage.on('request', request => {
          const url = request.url();
          if ((url.includes('.m3u8') || url.includes('.mp4')) && !embedVideoUrl) {
            if (url.includes('.m3u8') || (url.includes('.mp4') && !url.includes('seg-'))) {
              embedVideoUrl = url;
              console.log('✅ Found video in embed:', url.substring(0, 100));
            }
          }
          request.continue();
        });

        try {
          await embedPage.goto(iframeSrc, { waitUntil: 'networkidle2', timeout: 60000 });
          await embedPage.waitForTimeout(5000);

          // Try to extract video src from embed
          const embedDirectUrl = await embedPage.evaluate(() => {
            const video = document.querySelector('video');
            if (video && (video.src || video.currentSrc)) {
              return video.src || video.currentSrc;
            }
            return null;
          });

          await embedPage.close();
          videoUrl = embedVideoUrl || embedDirectUrl;
        } catch (e) {
          await embedPage.close();
          console.log('⚠️  Error navigating to embed:', e.message);
        }
      }

      if (!videoUrl) {
        throw new Error('Could not extract video URL from anify.to');
      }

      return videoUrl;

    } catch (error) {
      if (page && !page.isClosed()) await page.close();
      throw new Error(`Failed to extract anify.to video: ${error.message}`);
    }
  }

  async downloadDirect(videoUrl, outputDir, title, episodeNumber) {
    try {
      // Sanitize title for filename
      const safeTitle = title
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 100);

      // Create output template
      const outputTemplate = path.join(
        outputDir,
        `${safeTitle}.%(ext)s`
      );

      // yt-dlp options
      const args = [
        videoUrl,
        '-o', outputTemplate,
        '--no-playlist',
        '--format', 'best',
        '--no-warnings'
      ];

      // Execute yt-dlp
      const { stdout, stderr } = await execa(this.ytDlpPath, args);

      // Find downloaded file
      const files = fs.readdirSync(outputDir);
      const downloadedFile = files.find(f => f.startsWith(safeTitle));

      return {
        success: true,
        filename: downloadedFile || 'Unknown',
        path: downloadedFile ? path.join(outputDir, downloadedFile) : null
      };

    } catch (error) {
      return {
        success: false,
        error: error.message || 'Download failed'
      };
    }
  }

  async download(episodeUrl, outputDir, animeTitle, episodeNumber) {
    try {
      // Extract actual video URL from the episode page
      const videoUrl = await this.extractVideoUrl(episodeUrl);

      if (!videoUrl) {
        return {
          success: false,
          error: 'Could not extract video URL from page'
        };
      }

      // Sanitize anime title for filename
      const safeTitle = animeTitle
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 100);

      // Create output template
      const outputTemplate = path.join(
        outputDir,
        `${safeTitle}_Episode_${episodeNumber}.%(ext)s`
      );

      // yt-dlp options - use extracted video URL
      const args = [
        videoUrl,
        '-o', outputTemplate,
        '--no-playlist',
        '--format', 'best',
        '--no-warnings',
        '--quiet',
        '--progress',
        '--newline'
      ];

      // Execute yt-dlp
      const subprocess = execa(this.ytDlpPath, args);

      // Capture output for progress
      subprocess.stdout.on('data', (data) => {
        const output = data.toString();
        // You can parse yt-dlp progress here if needed
        if (output.includes('[download]')) {
          process.stdout.write(`\r${output.trim()}`);
        }
      });

      const { stdout, stderr } = await subprocess;

      // Find downloaded file
      const files = fs.readdirSync(outputDir);
      const downloadedFile = files.find(f =>
        f.startsWith(`${safeTitle}_Episode_${episodeNumber}`)
      );

      return {
        success: true,
        filename: downloadedFile || 'Unknown',
        path: downloadedFile ? path.join(outputDir, downloadedFile) : null
      };

    } catch (error) {
      return {
        success: false,
        error: error.message || 'Download failed'
      };
    }
  }

  async checkYtDlp() {
    try {
      await execa(this.ytDlpPath, ['--version']);
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = AnimeDownloader;
