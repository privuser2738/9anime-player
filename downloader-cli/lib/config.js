const fs = require('fs');
const path = require('path');
const os = require('os');

class Config {
  constructor() {
    // Store config in user's home directory
    this.configDir = path.join(os.homedir(), '.9anime-downloader');
    this.configFile = path.join(this.configDir, 'config.json');

    // Create config directory if it doesn't exist
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }

    // Load or create config
    this.config = this.load();
  }

  load() {
    if (fs.existsSync(this.configFile)) {
      try {
        const data = fs.readFileSync(this.configFile, 'utf8');
        return JSON.parse(data);
      } catch (error) {
        console.error('Error loading config, using defaults:', error.message);
        return this.getDefaults();
      }
    }
    return this.getDefaults();
  }

  getDefaults() {
    return {
      outputDir: path.join(process.cwd(), 'anime-downloads'),
      lastGenre: 'Game',
      lastCount: 5,
      minYear: 2020,
      quality: 'best'
    };
  }

  save() {
    try {
      fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Error saving config:', error.message);
    }
  }

  get(key) {
    return this.config[key];
  }

  set(key, value) {
    this.config[key] = value;
    this.save();
  }

  getAll() {
    return { ...this.config };
  }

  reset() {
    this.config = this.getDefaults();
    this.save();
  }
}

module.exports = Config;
