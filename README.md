# CSS Hover Inspector

A live CSS inspector overlay for front-end developers — hover any element to see its computed styles instantly, no DevTools required.

Ships two ways from a single shared engine:
- **Chrome Extension** (Manifest V3) — toolbar toggle, keyboard shortcut, persistent settings
- **Bookmarklet** — drag to your bookmarks bar, works on any site, zero install

## Features

- Live highlight box that snaps to the exact bounding box of the hovered element
- Floating panel with real computed CSS values — not just what's written in the stylesheet
- **Pin mode** — click an element to lock the panel, then click any property to copy it as `property: value;`
- Light/dark theme, synced live across the popup and the page overlay
- Configurable property list — show only the categories you care about (Layout, Box Model, Typography, Colors)
- `Ctrl+Shift+H` global toggle
- Shadow DOM isolation — never leaks styles into, or inherits styles from, the host page

## Architecture

css-hover-inspector/
├── core/inspector.js # the single engine — used by BOTH targets below
├── extension/ # Chrome Extension (MV3)
│ ├── manifest.json
│ ├── background.js # service worker: tab state, keyboard shortcut
│ ├── content-script.js # dynamically imports core/inspector.js
│ └── popup.html/css/js # toolbar UI: toggle, theme, property settings
├── bookmarklet/
│ ├── entry.js # standalone bootstrap around the same engine
│ └── build.js # esbuild bundler → dist/bookmarklet.min.js
└── scripts/generate-icons.js # SVG → PNG icon renderer


`core/inspector.js` contains 100% of the hover detection, highlighting, and CSS-panel logic, with zero `chrome.*` API calls — which is what lets the exact same file power a browser extension *and* a dependency-free bookmarklet.

## Install — Chrome Extension

1. Clone this repo
2. `npm install`
3. `npm run generate:icons`
4. Go to `chrome://extensions`, enable **Developer mode**
5. **Load unpacked** → select the project root folder
6. Click the toolbar icon, or press `Ctrl+Shift+H` on any page

## Install — Bookmarklet

1. `npm install`
2. `npm run build:bookmarklet`
3. Open `dist/install.html` in your browser
4. Drag the button to your bookmarks bar
5. Click it on any website to toggle the inspector

## Development

```bash
npm run watch:bookmarklet   # rebuilds dist/bookmarklet.min.js on change to core/ or bookmarklet/
```

For the extension, edit files under `extension/` or `core/`, then click the reload icon on the extension card at `chrome://extensions`.

## Tech Stack

Vanilla JavaScript (ES modules), Chrome Extension Manifest V3, esbuild, Shadow DOM, `chrome.storage` API, sharp (icon generation).

## License

MIT