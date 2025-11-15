// Verbose Background Logger for 9Anime Player Extension
// Logs all user interactions, API calls, state changes, and performance metrics

class VerboseLogger {
  constructor() {
    this.enabled = true;
    this.maxLogs = 5000; // Maximum number of log entries to keep
    this.logs = [];
    this.sessionId = this.generateSessionId();
    this.categories = {
      USER_INTERACTION: 'USER_INTERACTION',
      API_CALL: 'API_CALL',
      STATE_CHANGE: 'STATE_CHANGE',
      PERFORMANCE: 'PERFORMANCE',
      ERROR: 'ERROR',
      NAVIGATION: 'NAVIGATION',
      VIDEO_EVENT: 'VIDEO_EVENT',
      STORAGE: 'STORAGE',
      SYSTEM: 'SYSTEM'
    };

    this.init();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async init() {
    // Load existing logs and settings from storage
    try {
      const result = await browser.storage.local.get(['verboseLogs', 'loggerEnabled']);
      if (result.verboseLogs) {
        this.logs = result.verboseLogs;
      }
      if (result.loggerEnabled !== undefined) {
        this.enabled = result.loggerEnabled;
      }

      this.log(this.categories.SYSTEM, 'Logger initialized', {
        sessionId: this.sessionId,
        existingLogs: this.logs.length,
        enabled: this.enabled
      });
    } catch (e) {
      console.error('[VerboseLogger] Failed to initialize:', e);
    }
  }

  async log(category, message, data = {}) {
    if (!this.enabled) return;

    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      sessionId: this.sessionId,
      category,
      message,
      data,
      url: typeof window !== 'undefined' ? window.location.href : 'background',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    };

    this.logs.push(entry);

    // Trim logs if exceeding max size
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Save to storage periodically (every 10 logs)
    if (this.logs.length % 10 === 0) {
      await this.saveLogs();
    }

    // Also log to console for immediate debugging
    console.log(`[VerboseLogger][${category}] ${message}`, data);
  }

  async saveLogs() {
    try {
      await browser.storage.local.set({
        verboseLogs: this.logs,
        loggerEnabled: this.enabled
      });
    } catch (e) {
      console.error('[VerboseLogger] Failed to save logs:', e);
    }
  }

  async getLogs() {
    return this.logs;
  }

  async clearLogs() {
    this.logs = [];
    await this.saveLogs();
    this.log(this.categories.SYSTEM, 'Logs cleared');
  }

  async setEnabled(enabled) {
    this.enabled = enabled;
    await browser.storage.local.set({ loggerEnabled: enabled });
    this.log(this.categories.SYSTEM, `Logger ${enabled ? 'enabled' : 'disabled'}`);
  }

  async exportToText() {
    const header = `9Anime Player Extension - Verbose Log Export
Session ID: ${this.sessionId}
Export Time: ${new Date().toISOString()}
Total Entries: ${this.logs.length}
${'='.repeat(80)}

`;

    const logText = this.logs.map(entry => {
      return `[${entry.timestamp}] [${entry.category}] ${entry.message}
  Session: ${entry.sessionId}
  URL: ${entry.url}
  Data: ${JSON.stringify(entry.data, null, 2)}
  ${'-'.repeat(80)}`;
    }).join('\n');

    return header + logText;
  }

  async exportToJSON() {
    return JSON.stringify({
      sessionId: this.sessionId,
      exportTime: new Date().toISOString(),
      totalEntries: this.logs.length,
      logs: this.logs
    }, null, 2);
  }

  // Convenience methods for different log categories
  logUserInteraction(action, details = {}) {
    return this.log(this.categories.USER_INTERACTION, action, details);
  }

  logApiCall(endpoint, details = {}) {
    return this.log(this.categories.API_CALL, endpoint, details);
  }

  logStateChange(stateChange, details = {}) {
    return this.log(this.categories.STATE_CHANGE, stateChange, details);
  }

  logPerformance(metric, details = {}) {
    return this.log(this.categories.PERFORMANCE, metric, details);
  }

  logError(error, details = {}) {
    return this.log(this.categories.ERROR, error, {
      ...details,
      errorMessage: error.message || error,
      errorStack: error.stack || 'No stack trace'
    });
  }

  logNavigation(action, details = {}) {
    return this.log(this.categories.NAVIGATION, action, details);
  }

  logVideoEvent(event, details = {}) {
    return this.log(this.categories.VIDEO_EVENT, event, details);
  }

  logStorage(operation, details = {}) {
    return this.log(this.categories.STORAGE, operation, details);
  }

  // Performance measurement wrapper
  async measurePerformance(operationName, asyncFunction) {
    const startTime = performance.now();
    const startMemory = performance.memory ? performance.memory.usedJSHeapSize : null;

    try {
      const result = await asyncFunction();
      const endTime = performance.now();
      const endMemory = performance.memory ? performance.memory.usedJSHeapSize : null;

      await this.logPerformance(`${operationName} completed`, {
        duration: `${(endTime - startTime).toFixed(2)}ms`,
        memoryDelta: startMemory && endMemory ? `${((endMemory - startMemory) / 1024 / 1024).toFixed(2)}MB` : 'N/A',
        success: true
      });

      return result;
    } catch (error) {
      const endTime = performance.now();

      await this.logPerformance(`${operationName} failed`, {
        duration: `${(endTime - startTime).toFixed(2)}ms`,
        error: error.message,
        success: false
      });

      throw error;
    }
  }

  // Network request interceptor wrapper
  async loggedFetch(url, options = {}) {
    const requestId = Math.random().toString(36).substr(2, 9);
    const startTime = performance.now();

    await this.logApiCall('Fetch request started', {
      requestId,
      url,
      method: options.method || 'GET',
      headers: options.headers
    });

    try {
      const response = await fetch(url, options);
      const endTime = performance.now();

      await this.logApiCall('Fetch request completed', {
        requestId,
        url,
        status: response.status,
        statusText: response.statusText,
        duration: `${(endTime - startTime).toFixed(2)}ms`,
        success: response.ok
      });

      return response;
    } catch (error) {
      const endTime = performance.now();

      await this.logApiCall('Fetch request failed', {
        requestId,
        url,
        error: error.message,
        duration: `${(endTime - startTime).toFixed(2)}ms`
      });

      throw error;
    }
  }

  // Get statistics about logs
  getStatistics() {
    const stats = {
      total: this.logs.length,
      byCategory: {},
      bySession: {},
      timeRange: {
        first: this.logs[0]?.timestamp,
        last: this.logs[this.logs.length - 1]?.timestamp
      }
    };

    this.logs.forEach(log => {
      // Count by category
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;

      // Count by session
      stats.bySession[log.sessionId] = (stats.bySession[log.sessionId] || 0) + 1;
    });

    return stats;
  }
}

// Create singleton instance
const logger = new VerboseLogger();

// Make it available globally if in browser context
if (typeof window !== 'undefined') {
  window.verboseLogger = logger;
}
