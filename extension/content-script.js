let inspectorInstance = null;
let defaultProps = [];

async function getInspector() {
  if (!inspectorInstance) {
    const moduleUrl = chrome.runtime.getURL('core/inspector.js');
    const { createInspector, DEFAULT_ENABLED_PROPS } = await import(moduleUrl);
    defaultProps = DEFAULT_ENABLED_PROPS;
    inspectorInstance = createInspector();

    const { theme, properties } = await chrome.storage.local.get(['theme', 'properties']);
    inspectorInstance.setTheme(theme || 'dark');
    inspectorInstance.setProperties(properties || defaultProps);
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
  if (area !== 'local' || !inspectorInstance) return;
  if (changes.theme) inspectorInstance.setTheme(changes.theme.newValue);
  if (changes.properties) inspectorInstance.setProperties(changes.properties.newValue || defaultProps);
});