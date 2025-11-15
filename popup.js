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
