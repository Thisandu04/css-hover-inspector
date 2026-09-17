let inspectorInstance = null;

async function getInspector() {
  if (!inspectorInstance) {
    const moduleUrl = chrome.runtime.getURL('core/inspector.js');
    const { createInspector } = await import(moduleUrl);
    inspectorInstance = createInspector();
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