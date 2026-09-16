// extension/background.js
const tabStates = new Map(); // tabId -> boolean

function setBadge(tabId, isOn) {
  chrome.action.setBadgeText({ tabId, text: isOn ? 'ON' : '' });
  chrome.action.setBadgeBackgroundColor({ tabId, color: '#6366f1' });
}

async function toggleForTab(tabId) {
  const nextState = !tabStates.get(tabId);
  tabStates.set(tabId, nextState);
  setBadge(tabId, nextState);

  try {
    await chrome.tabs.sendMessage(tabId, { type: 'TOGGLE_INSPECTOR', enabled: nextState });
  } catch (err) {
    console.warn('[CSS Hover Inspector] content script not ready on this tab:', err.message);
  }

  return nextState;
}

// Popup asks background to toggle the active tab
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'REQUEST_TOGGLE') {
    chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
      if (!tab?.id) return;
      const newState = await toggleForTab(tab.id);
      sendResponse({ enabled: newState });
    });
    return true; // keeps the async message channel open
  }

  if (message.type === 'GET_STATE') {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      sendResponse({ enabled: tabStates.get(tab?.id) ?? false });
    });
    return true;
  }
});

// Ctrl+Shift+H
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-inspector') {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab?.id) toggleForTab(tab.id);
    });
  }
});

// Free memory when a tab closes
chrome.tabs.onRemoved.addListener((tabId) => tabStates.delete(tabId));