#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const fs = require('fs');
const Config = require('./lib/config');
const AnimeScraper = require('./lib/scraper');
const AnimeDownloader = require('./lib/downloader');

// ASCII Art Banner
const banner = `
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║    █████╗ ███╗   ██╗██╗███╗   ███╗███████╗              ║
║   ██╔══██╗████╗  ██║██║████╗ ████║██╔════╝              ║
║   ███████║██╔██╗ ██║██║██╔████╔██║█████╗                ║
║   ██╔══██║██║╚██╗██║██║██║╚██╔╝██║██╔══╝                ║
║   ██║  ██║██║ ╚████║██║██║ ╚═╝ ██║███████╗              ║
║   ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝╚══════╝              ║
║                                                           ║
║         Random Episode Downloader CLI v1.0               ║
║         Download random anime episodes (2020+)           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`;

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy',
  'Game', 'Harem', 'Historical', 'Horror', 'Isekai', 'Magic',
  'Mecha', 'Military', 'Music', 'Mystery', 'Psychological',
  'Romance', 'School', 'Sci-Fi', 'Seinen', 'Shoujo', 'Shounen',
  'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
];

class AnimeDownloaderCLI {
  constructor() {
    this.config = new Config();
    this.scraper = new AnimeScraper();
    this.downloader = new AnimeDownloader(this.scraper);
  }

  async run() {
    console.clear();
    console.log(chalk.cyan(banner));

    // Load saved settings
    const settings = this.config.getAll();
    console.log(chalk.gray(`\n📂 Output folder: ${settings.outputDir || 'Not set'}\n`));

    // Main menu
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '🔗 Download from URL (anify.to)', value: 'url' },
          { name: '🎬 Random anime (9anime - experimental)', value: 'download' },
          { name: '⚙️  Settings', value: 'settings' },
          { name: '❌ Exit', value: 'exit' }
        ]
      }
    ]);

    if (action === 'exit') {
      console.log(chalk.yellow('\n👋 Goodbye!\n'));
      await this.scraper.closeBrowser();
      process.exit(0);
    }

    if (action === 'settings') {
      await this.showSettings();
      return this.run();
    }

    if (action === 'url') {
      await this.downloadFromUrl();
      return this.run();
    }

    if (action === 'download') {
      await this.startDownload();
    }
  }

  async showSettings() {
    const settings = this.config.getAll();

    const { settingAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'settingAction',
        message: 'Settings:',
        choices: [
          { name: `📂 Change output folder (current: ${settings.outputDir || 'Not set'})`, value: 'output' },
          { name: '🔙 Back to main menu', value: 'back' }
        ]
      }
    ]);

    if (settingAction === 'back') {
      return;
    }

    if (settingAction === 'output') {
      const { outputDir } = await inquirer.prompt([
        {
          type: 'input',
          name: 'outputDir',
          message: 'Enter output directory path:',
          default: settings.outputDir || path.join(process.cwd(), 'downloads'),
          validate: (input) => {
            if (!input) return 'Output directory cannot be empty';
            return true;
          }
        }
      ]);

      // Create directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      this.config.set('outputDir', outputDir);
      console.log(chalk.green(`\n✅ Output folder saved: ${outputDir}\n`));

      await this.showSettings();
    }
  }

  async downloadFromUrl() {
    const settings = this.config.getAll();

    // Check if output dir is set
    if (!settings.outputDir) {
      console.log(chalk.red('\n❌ Please set output folder in settings first!\n'));
      await this.showSettings();
      return;
    }

    console.log(chalk.cyan('\n📺 Download from URL\n'));
    console.log(chalk.gray('Supported sites: anify.to'));
    console.log(chalk.gray('Example: https://anify.to/watch/9952/star-wars-visions/2\n'));

    const { url } = await inquirer.prompt([
      {
        type: 'input',
        name: 'url',
        message: 'Enter video URL:',
        validate: (input) => {
          if (!input) return 'Please enter a URL';
          if (!input.startsWith('http')) return 'Please enter a valid URL starting with http:// or https://';
          return true;
        }
      }
    ]);

    const { title } = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter custom filename (optional):',
        default: 'video'
      }
    ]);

    console.log(chalk.cyan(`\n🎯 Starting download from: ${url}\n`));

    const spinner = ora('Extracting video URL...').start();

    try {
      // Detect site and extract video URL
      let videoUrl;
      if (url.includes('anify.to')) {
        videoUrl = await this.downloader.extractAnifyUrl(url);
      } else {
        spinner.fail('Unsupported site');
        console.log(chalk.red('\n❌ Only anify.to is currently supported\n'));
        return;
      }

      if (!videoUrl) {
        spinner.fail('Could not extract video URL');
        return;
      }

      spinner.succeed(`Extracted video URL`);

      const downloadSpinner = ora('Downloading video...').start();

      const result = await this.downloader.downloadDirect(videoUrl, settings.outputDir, title, 1);

      if (result.success) {
        downloadSpinner.succeed(`Downloaded: ${result.filename}`);
        console.log(chalk.green(`\n✅ Saved to: ${settings.outputDir}\n`));
      } else {
        downloadSpinner.fail(`Download failed: ${result.error}`);
      }

    } catch (error) {
      spinner.fail('Error');
      console.error(chalk.red(`\n❌ ${error.message}\n`));
    }
  }

  async startDownload() {
    const settings = this.config.getAll();

    // Check if output dir is set
    if (!settings.outputDir) {
      console.log(chalk.red('\n❌ Please set output folder in settings first!\n'));
      await this.showSettings();
      return this.run();
    }

    // Get download preferences
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'genre',
        message: 'Select genre:',
        choices: GENRES,
        default: settings.lastGenre || 'Game'
      },
      {
        type: 'number',
        name: 'count',
        message: 'How many anime to download?',
        default: settings.lastCount || 5,
        validate: (input) => {
          if (input < 1) return 'Must download at least 1 anime';
          if (input > 100) return 'Maximum 100 anime at once';
          return true;
        }
      }
    ]);

    // Save preferences
    this.config.set('lastGenre', answers.genre);
    this.config.set('lastCount', answers.count);

    console.log(chalk.cyan(`\n🎯 Starting download: ${answers.count} anime from ${answers.genre} genre\n`));

    // Start download process
    await this.downloadAnime(answers.genre, answers.count, settings.outputDir);

    // Ask what to do next
    const { next } = await inquirer.prompt([
      {
        type: 'list',
        name: 'next',
        message: '\nWhat would you like to do next?',
        choices: [
          { name: '🔄 Download more', value: 'again' },
          { name: '🏠 Main menu', value: 'menu' },
          { name: '❌ Exit', value: 'exit' }
        ]
      }
    ]);

    if (next === 'again') {
      return this.startDownload();
    } else if (next === 'menu') {
      return this.run();
    } else {
      console.log(chalk.yellow('\n👋 Goodbye!\n'));
      await this.scraper.closeBrowser();
      process.exit(0);
    }
  }

  async downloadAnime(genre, count, outputDir) {
    const spinner = ora('Searching for anime...').start();

    try {
      // Fetch anime list from 9anime
      const animeList = await this.scraper.searchAnime(genre, 2020);
      spinner.succeed(`Found ${animeList.length} anime in ${genre} genre`);

      if (animeList.length === 0) {
        console.log(chalk.red('\n❌ No anime found matching criteria\n'));
        return;
      }

      // Shuffle and take requested count
      const shuffled = animeList.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.min(count, animeList.length));

      console.log(chalk.green(`\n✅ Selected ${selected.length} anime for download\n`));

      // Download each anime
      for (let i = 0; i < selected.length; i++) {
        const anime = selected[i];
        console.log(chalk.cyan(`\n[${ i + 1}/${selected.length}] ${anime.title}`));

        const downloadSpinner = ora('Fetching episode list...').start();

        try {
          // Get episodes
          const episodes = await this.scraper.getEpisodes(anime.url);

          if (episodes.length === 0) {
            downloadSpinner.fail('No episodes found');
            continue;
          }

          // Pick random episode
          const randomEpisode = episodes[Math.floor(Math.random() * episodes.length)];
          downloadSpinner.text = `Downloading Episode ${randomEpisode.number} (random from ${episodes.length} episodes)`;

          // Download episode
          const result = await this.downloader.download(
            randomEpisode.url,
            outputDir,
            anime.title,
            randomEpisode.number
          );

          if (result.success) {
            downloadSpinner.succeed(`Downloaded: ${result.filename}`);
          } else {
            downloadSpinner.fail(`Failed: ${result.error}`);
          }

        } catch (error) {
          downloadSpinner.fail(`Error: ${error.message}`);
        }

        // Small delay between downloads
        if (i < selected.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      console.log(chalk.green(`\n✅ Download complete! Files saved to: ${outputDir}\n`));

    } catch (error) {
      spinner.fail(`Error: ${error.message}`);
      console.error(chalk.red(error.stack));
    }
  }
}

// Run CLI
const cli = new AnimeDownloaderCLI();
cli.run().catch(async error => {
  console.error(chalk.red('\n❌ Fatal error:'), error);
  await cli.scraper.closeBrowser();
  process.exit(1);
});
