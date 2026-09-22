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

- **`core/`**
  - `inspector.js` — the single engine: hover detection, Shadow DOM overlay, computed-style panel, pin mode. Zero `chrome.*` calls, so it runs standalone or inside an extension.

- **`extension/`** — Chrome Extension (Manifest V3)
  - `manifest.json` — permissions, popup, content script, keyboard shortcut
  - `background.js` — service worker: tracks per-tab on/off state, handles `Ctrl+Shift+H`
  - `content-script.js` — dynamically imports `core/inspector.js` into the current page
  - `popup.html` — toolbar UI markup
  - `popup.css` — toolbar UI styling
  - `popup.js` — toggle logic, theme switch, property customization

- **`bookmarklet/`**
  - `entry.js` — standalone bootstrap wrapping the same engine for injection with no extension shell
  - `build.js` — esbuild bundler, packages `entry.js` + `core/inspector.js` into one minified `javascript:` snippet

- **`scripts/`**
  - `generate-icons.js` — renders the SVG icon into the PNG sizes Chrome requires

- **`dist/`** — build output only (gitignored, regenerated via `npm run build:bookmarklet`)
  - `bookmarklet.min.js`
  - `install.html`

`core/inspector.js` contains 100% of the hover detection, highlighting, and CSS-panel logic, with zero `chrome.*` API calls — which is what lets the exact same file power a browser extension **and** a dependency-free bookmarklet. The extension just loads it as a module inside a content script; the bookmarklet build just bundles it with esbuild. One engine, two delivery methods, zero duplicated code.

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

### Prerequisites

- Node.js 18+ and npm
- Google Chrome (or any Chromium-based browser) for testing the extension

### Setup

```bash
git clone https://github.com/yourusername/css-hover-inspector.git
cd css-hover-inspector
npm install
```

### Regenerating Icons

Only needed if you edit `extension/icons/icon.svg`:

```bash
npm run generate:icons
```

This re-renders `icon-16.png`, `icon-48.png`, and `icon-128.png` from the SVG source.

### Available Scripts

| Command | What it does |
|---|---|
| `npm run build:bookmarklet` | One-off bundle of the bookmarklet into `dist/` |
| `npm run watch:bookmarklet` | Rebuilds the bookmarklet automatically on file changes |
| `npm run generate:icons` | Renders extension icon PNGs from the SVG source |

## Tech Stack

1. Vanilla JavaScript (ES modules)
2. Chrome Extension Manifest V3
3. esbuild
4. Shadow DOM
5. `chrome.storage` API
6. sharp (icon generation)

## License

MIT
