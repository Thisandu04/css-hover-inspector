let inspectorInstance = null;

async function getInspector() {
  if (!inspectorInstance) {
    const moduleUrl = chrome.runtime.getURL('core/inspector.js');
    const { createInspector } = await import(moduleUrl);
    inspectorInstance = createInspector();

    const { theme } = await chrome.storage.local.get('theme');
    inspectorInstance.setTheme(theme || 'dark');
  }
  return inspectorInstance;
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TOGGLE_INSPECTOR') {
    getInspector().then((inspector) => {
      message.enabled ? inspector.enable() : inspector.disable();
    });
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.theme && inspectorInstance) {
    inspectorInstance.setTheme(changes.theme.newValue);
  }
});