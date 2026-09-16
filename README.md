# CSS Hover Inspector

A live CSS inspector overlay for front-end developers — hover any element to see its computed styles instantly, no DevTools required.

Ships two ways from one shared engine:
- **Chrome Extension** — toolbar toggle + keyboard shortcut
- **Bookmarklet** — drop it in your bookmarks bar, works on any site

## Status
🚧 Work in progress — building in public, step by step.

## Architecture
`core/inspector.js` is the single engine (hover detection, box-model overlay, computed-style parsing). Both the extension's content script and the bookmarklet build load this same module — no duplicated logic.