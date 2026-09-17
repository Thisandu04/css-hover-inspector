import { createInspector } from '../core/inspector.js';

(function () {
  const GLOBAL_KEY = '__cssHoverInspector__';

  if (window[GLOBAL_KEY]) {
    // Already injected on this page from a previous click — just toggle it
    const isEnabled = window[GLOBAL_KEY].toggle();
    console.log(`[CSS Hover Inspector] ${isEnabled ? 'enabled' : 'disabled'}`);
    return;
  }

  const inspector = createInspector();
  window[GLOBAL_KEY] = inspector;
  inspector.setTheme('dark'); // no popup/storage here, so default explicitly
  inspector.enable();
  console.log('[CSS Hover Inspector] loaded — click the bookmarklet again to toggle');
})();