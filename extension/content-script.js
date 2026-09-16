// extension/content-script.js
let inspectorActive = false;

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TOGGLE_INSPECTOR') {
    inspectorActive = message.enabled;
    console.log('[CSS Hover Inspector] toggled:', inspectorActive);
    // Temporary visual proof — Step 5 replaces this with the real overlay engine
    document.body.style.outline = inspectorActive ? '3px dashed #6366f1' : 'none';
  }
});