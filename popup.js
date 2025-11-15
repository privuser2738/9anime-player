// Popup script for extension control

let extensionEnabled = true;
let settings = {
  autoFullscreen: true,
  showTransitions: true
};

// Load settings
browser.storage.local.get(['settings', 'extensionEnabled']).then((result) => {
  if (result.settings) {
    settings = result.settings;
  }
  if (result.extensionEnabled !== undefined) {
    extensionEnabled = result.extensionEnabled;
  }
  updateUI();
});

// Update UI based on state
function updateUI() {
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  const toggleBtn = document.getElementById('toggleBtn');
  const fullscreenCheck = document.getElementById('fullscreenCheck');
  const transitionCheck = document.getElementById('transitionCheck');

  if (extensionEnabled) {
    statusIndicator.classList.add('active');
    statusIndicator.classList.remove('inactive');
    statusText.textContent = 'Extension Active';
    toggleBtn.textContent = 'Disable Auto-Play';
  } else {
    statusIndicator.classList.remove('active');
    statusIndicator.classList.add('inactive');
    statusText.textContent = 'Extension Disabled';
    toggleBtn.textContent = 'Enable Auto-Play';
  }

  fullscreenCheck.checked = settings.autoFullscreen;
  transitionCheck.checked = settings.showTransitions;
}

// Toggle extension
document.getElementById('toggleBtn').addEventListener('click', () => {
  extensionEnabled = !extensionEnabled;
  browser.storage.local.set({ extensionEnabled });
  updateUI();

  // Notify content scripts
  browser.tabs.query({ url: "*://9animetv.to/*" }).then((tabs) => {
    tabs.forEach((tab) => {
      browser.tabs.sendMessage(tab.id, {
        type: 'toggleExtension',
        enabled: extensionEnabled
      });
    });
  });
});

// Open 9anime
document.getElementById('openAnime').addEventListener('click', () => {
  browser.tabs.create({ url: 'https://9animetv.to/' });
  window.close();
});

// Settings checkboxes
document.getElementById('fullscreenCheck').addEventListener('change', (e) => {
  settings.autoFullscreen = e.target.checked;
  browser.storage.local.set({ settings });
});

document.getElementById('transitionCheck').addEventListener('change', (e) => {
  settings.showTransitions = e.target.checked;
  browser.storage.local.set({ settings });
});

// ========== VERBOSE LOGGING CONTROLS ==========

// Load log stats
async function loadLogStats() {
  try {
    const response = await browser.runtime.sendMessage({ type: 'getVerboseLogs' });
    if (response && response.stats) {
      const stats = response.stats;
      const statsHTML = `
        <div><strong>Total Logs:</strong> ${stats.total || 0}</div>
        ${stats.timeRange && stats.timeRange.first ? `<div><strong>First:</strong> ${new Date(stats.timeRange.first).toLocaleTimeString()}</div>` : ''}
        ${stats.timeRange && stats.timeRange.last ? `<div><strong>Last:</strong> ${new Date(stats.timeRange.last).toLocaleTimeString()}</div>` : ''}
        ${stats.byCategory ? `<div style="margin-top: 5px;"><strong>By Category:</strong></div>` : ''}
        ${stats.byCategory ? Object.entries(stats.byCategory)
          .map(([cat, count]) => `<div style="margin-left: 10px;">${cat}: ${count}</div>`)
          .join('') : ''}
      `;
      document.getElementById('logStats').innerHTML = statsHTML;
    }
  } catch (e) {
    document.getElementById('logStats').innerHTML = '<div>Error loading stats</div>';
    console.error('Error loading log stats:', e);
  }
}

// Load logging enabled state
async function loadLoggerState() {
  const result = await browser.storage.local.get('loggerEnabled');
  if (result.loggerEnabled !== undefined) {
    document.getElementById('enableLogging').checked = result.loggerEnabled;
  }
}

// Initialize log section
loadLoggerState();
loadLogStats();

// Refresh stats every 3 seconds while popup is open
setInterval(loadLogStats, 3000);

// Toggle logging
document.getElementById('enableLogging').addEventListener('change', async (e) => {
  const enabled = e.target.checked;
  try {
    await browser.runtime.sendMessage({
      type: 'setLoggerEnabled',
      enabled: enabled
    });
    console.log('Logger enabled:', enabled);
  } catch (e) {
    console.error('Error toggling logger:', e);
  }
});

// Export logs as text
document.getElementById('exportText').addEventListener('click', async () => {
  try {
    const response = await browser.runtime.sendMessage({ type: 'getVerboseLogs' });
    if (response && response.logs) {
      // Create a VerboseLogger instance to use its export method
      const header = `9Anime Player Extension - Verbose Log Export
Export Time: ${new Date().toISOString()}
Total Entries: ${response.logs.length}
${'='.repeat(80)}

`;

      const logText = response.logs.map(entry => {
        return `[${entry.timestamp}] [${entry.category}] ${entry.message}
  Session: ${entry.sessionId}
  URL: ${entry.url}
  Data: ${JSON.stringify(entry.data, null, 2)}
  ${'-'.repeat(80)}`;
      }).join('\n');

      const fullText = header + logText;

      // Download the file
      const blob = new Blob([fullText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `9anime-logs-${new Date().toISOString().replace(/:/g, '-')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  } catch (e) {
    console.error('Error exporting logs:', e);
    alert('Error exporting logs. Check console for details.');
  }
});

// Export logs as JSON
document.getElementById('exportJSON').addEventListener('click', async () => {
  try {
    const response = await browser.runtime.sendMessage({ type: 'getVerboseLogs' });
    if (response && response.logs) {
      const exportData = {
        exportTime: new Date().toISOString(),
        totalEntries: response.logs.length,
        stats: response.stats,
        logs: response.logs
      };

      const json = JSON.stringify(exportData, null, 2);

      // Download the file
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `9anime-logs-${new Date().toISOString().replace(/:/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  } catch (e) {
    console.error('Error exporting logs:', e);
    alert('Error exporting logs. Check console for details.');
  }
});

// Clear logs
document.getElementById('clearLogs').addEventListener('click', async () => {
  if (confirm('Are you sure you want to clear all logs? This cannot be undone.')) {
    try {
      await browser.runtime.sendMessage({ type: 'clearVerboseLogs' });
      alert('Logs cleared successfully!');
      loadLogStats(); // Refresh stats
    } catch (e) {
      console.error('Error clearing logs:', e);
      alert('Error clearing logs. Check console for details.');
    }
  }
});
