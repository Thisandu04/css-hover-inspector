// extension/popup.js
const toggleSwitch = document.getElementById('toggle-switch');
const statusText = document.getElementById('status-text');
const shortcutDisplay = document.getElementById('shortcut-display');

function renderState(isEnabled) {
  toggleSwitch.setAttribute('aria-checked', String(isEnabled));
  statusText.textContent = isEnabled ? 'Active — hover any element' : 'Inactive on this tab';
  statusText.className = `status-text ${isEnabled ? 'status-text--on' : 'status-text--off'}`;
}

// 1. Ask background for current state on open
chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
  renderState(response?.enabled ?? false);
});

// 2. Handle click
toggleSwitch.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'REQUEST_TOGGLE' }, (response) => {
    renderState(response?.enabled ?? false);
  });
});

// 3. Show the REAL bound shortcut, not a guess — users can rebind it
chrome.commands.getAll((commands) => {
  const toggleCommand = commands.find((c) => c.name === 'toggle-inspector');
  if (toggleCommand?.shortcut) {
    shortcutDisplay.textContent = toggleCommand.shortcut;
  } else {
    shortcutDisplay.textContent = 'Not set';
    shortcutDisplay.title = 'Set one at chrome://extensions/shortcuts';
  }
});

// Theme switch
const themeButtons = document.querySelectorAll('#theme-switch .segmented__option');

function renderTheme(theme) {
  themeButtons.forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.theme === theme);
  });
}

chrome.storage.local.get('theme', ({ theme }) => {
  renderTheme(theme || 'dark');
});

themeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    chrome.storage.local.set({ theme: btn.dataset.theme });
    renderTheme(btn.dataset.theme);
  });
});