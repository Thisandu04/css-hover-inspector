export const PROPERTY_CATALOG = {
  Layout: [
    ['display', 'Display'],
    ['position', 'Position'],
    ['float', 'Float'],
    ['z-index', 'Z-Index'],
  ],
  'Box Model': [
    ['width', 'Width'],
    ['height', 'Height'],
    ['margin', 'Margin'],
    ['padding', 'Padding'],
    ['border', 'Border'],
    ['box-sizing', 'Box Sizing'],
  ],
  Typography: [
    ['font-family', 'Font'],
    ['font-size', 'Font Size'],
    ['font-weight', 'Font Weight'],
    ['line-height', 'Line Height'],
    ['text-align', 'Text Align'],
  ],
  Colors: [
    ['color', 'Color'],
    ['background-color', 'Background'],
    ['opacity', 'Opacity'],
  ],
};

export const DEFAULT_ENABLED_PROPS = [
  'display', 'position', 'width', 'height', 'margin', 'padding',
  'border', 'color', 'background-color', 'font-family', 'font-size',
  'font-weight', 'line-height', 'z-index', 'box-sizing',
];

function flattenCatalog() {
  return Object.values(PROPERTY_CATALOG).flat();
}

export function createInspector() {
  let enabled = false;
  let pinned = false;
  let currentTarget = null;
  let shadowHost, shadowRoot, highlightBox, panel;
  let activeProperties = flattenCatalog().filter(([prop]) => DEFAULT_ENABLED_PROPS.includes(prop));

  function buildUI() {
    shadowHost = document.createElement('div');
    shadowHost.id = 'css-hover-inspector-root';
    shadowHost.dataset.theme = 'dark';
    shadowHost.style.cssText =
      'position:fixed; top:0; left:0; width:0; height:0; z-index:2147483647; pointer-events:none;';
    shadowRoot = shadowHost.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      :host {
        --bg: #17181f;
        --bg-elevated: #1f2029;
        --border: #2c2d38;
        --text: #e4e4e7;
        --text-dim: #9797a3;
        --accent: #6366f1;
        --accent-dim: rgba(99, 102, 241, 0.25);
        --success: #22c55e;
      }
      :host([data-theme="light"]) {
        --bg: #ffffff;
        --bg-elevated: #f4f4f6;
        --border: #e2e2e8;
        --text: #18181b;
        --text-dim: #6b6b76;
        --accent: #4f46e5;
        --accent-dim: rgba(79, 70, 229, 0.16);
      }
      .highlight-box {
        position: fixed;
        background: var(--accent-dim);
        border: 1px solid var(--accent);
        box-sizing: border-box;
        border-radius: 2px;
        pointer-events: none;
        display: none;
      }
      .panel {
        position: fixed;
        pointer-events: none;
        background: var(--bg);
        color: var(--text);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 10px 12px;
        font-family: ui-monospace, "SF Mono", Consolas, monospace;
        font-size: 11px;
        line-height: 1.6;
        min-width: 220px;
        max-width: 320px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.45);
        display: none;
      }
      .panel__tag {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        color: var(--accent);
        font-weight: 700;
        font-size: 12px;
        margin-bottom: 6px;
        padding-bottom: 6px;
        border-bottom: 1px solid var(--border);
      }
      .panel__pin-hint {
        font-size: 9px;
        font-weight: 500;
        color: var(--text-dim);
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }
      .panel__row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 2px 4px;
        margin: 0 -4px;
        border-radius: 4px;
      }
      .panel--pinned .panel__row { cursor: pointer; }
      .panel--pinned .panel__row:hover { background: var(--bg-elevated); }
      .panel__prop { color: var(--text-dim); white-space: nowrap; }
      .panel__value {
        color: var(--text);
        text-align: right;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 170px;
      }
      .panel__value--copied { color: var(--success) !important; }
    `;

    highlightBox = document.createElement('div');
    highlightBox.className = 'highlight-box';

    panel = document.createElement('div');
    panel.className = 'panel';
    panel.addEventListener('click', handlePanelClick);

    shadowRoot.append(style, highlightBox, panel);
    document.documentElement.appendChild(shadowHost);
  }

  function describeElement(el) {
    let label = el.tagName.toLowerCase();
    if (el.id) label += `#${el.id}`;
    if (el.classList.length) label += `.${[...el.classList].join('.')}`;
    return label;
  }

  function renderPanel(el, computed) {
    panel.classList.toggle('panel--pinned', pinned);

            const rows = activeProperties.map(([prop, label]) => {
      const value = computed.getPropertyValue(prop) || '—';
      return `<div class="panel__row" data-prop="${prop}" data-value="${value.replace(/"/g, '&quot;')}">
        <span class="panel__prop">${label}</span>
        <span class="panel__value">${value}</span>
      </div>`;
    }).join('');

    const hint = pinned
      ? '<span class="panel__pin-hint">📌 click row to copy · Esc to release</span>'
      : '';
    panel.innerHTML = `<div class="panel__tag"><span>${describeElement(el)}</span>${hint}</div>${rows}`;
  }

  function handlePanelClick(e) {
    if (!pinned) return;
    const row = e.target.closest('.panel__row');
    if (!row) return;

    const declaration = `${row.dataset.prop}: ${row.dataset.value};`;

    navigator.clipboard.writeText(declaration).then(() => {
      const valueEl = row.querySelector('.panel__value');
      const original = valueEl.textContent;
      valueEl.textContent = 'Copied!';
      valueEl.classList.add('panel__value--copied');
      setTimeout(() => {
        valueEl.textContent = original;
        valueEl.classList.remove('panel__value--copied');
      }, 900);
    }).catch((err) => console.warn('[CSS Hover Inspector] clipboard write failed:', err));
  }

  function positionHighlight(el) {
    const rect = el.getBoundingClientRect();
    Object.assign(highlightBox.style, {
      left: `${rect.left}px`, top: `${rect.top}px`,
      width: `${rect.width}px`, height: `${rect.height}px`,
    });
  }

  function positionPanelAtCursor(mouseX, mouseY) {
    const margin = 16;
    const r = panel.getBoundingClientRect();
    let x = mouseX + margin, y = mouseY + margin;
    if (x + r.width > window.innerWidth) x = mouseX - r.width - margin;
    if (y + r.height > window.innerHeight) y = mouseY - r.height - margin;
    panel.style.left = `${Math.max(8, x)}px`;
    panel.style.top = `${Math.max(8, y)}px`;
  }

  function positionPanelNearElement(el) {
    const rect = el.getBoundingClientRect();
    const margin = 12;
    const r = panel.getBoundingClientRect();
    let x = rect.right + margin, y = rect.top;
    if (x + r.width > window.innerWidth) x = rect.left - r.width - margin;
    if (y + r.height > window.innerHeight) y = window.innerHeight - r.height - margin;
    panel.style.left = `${Math.max(8, x)}px`;
    panel.style.top = `${Math.max(8, y)}px`;
  }

  function showFor(el) {
    const computed = getComputedStyle(el);
    positionHighlight(el);
    renderPanel(el, computed);
    highlightBox.style.display = 'block';
    panel.style.display = 'block';
  }

  function handleMouseOver(e) {
    if (!enabled || pinned) return;
    if (e.target === currentTarget) return;
    currentTarget = e.target;
    showFor(currentTarget);
    positionPanelAtCursor(e.clientX, e.clientY);
  }

  function handleMouseMove(e) {
    if (!enabled || pinned || !currentTarget) return;
    positionPanelAtCursor(e.clientX, e.clientY);
  }

  function handleScroll() {
    if (!enabled || !currentTarget) return;
    positionHighlight(currentTarget);
    if (pinned) positionPanelNearElement(currentTarget);
  }

  function handleClick(e) {
    if (!enabled) return;
    if (e.composedPath().includes(shadowHost)) return; // our own UI handles its own clicks

    e.preventDefault();
    e.stopPropagation();

    if (pinned && e.target === currentTarget) {
      unpin();
      return;
    }
    pin(e.target);
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' && pinned) unpin();
  }

  function pin(el) {
    pinned = true;
    currentTarget = el;
    panel.style.pointerEvents = 'auto';
    showFor(el);
    positionPanelNearElement(el);
  }

  function unpin() {
    pinned = false;
    currentTarget = null;
    panel.style.pointerEvents = 'none';
    highlightBox.style.display = 'none';
    panel.style.display = 'none';
  }

  function setProperties(propKeys) {
    activeProperties = flattenCatalog().filter(([prop]) => propKeys.includes(prop));
    if (currentTarget) showFor(currentTarget); // live-refresh if a panel is already showing
  }

  function enable() {
    if (enabled) return;
    if (!shadowHost) buildUI();
    enabled = true;
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeydown, true);
    window.addEventListener('scroll', handleScroll, true);
  }

  function disable() {
    enabled = false;
    unpin();
    document.removeEventListener('mouseover', handleMouseOver, true);
    document.removeEventListener('mousemove', handleMouseMove, true);
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('keydown', handleKeydown, true);
    window.removeEventListener('scroll', handleScroll, true);
  }

  function toggle() {
    return enabled ? (disable(), false) : (enable(), true);
  }

  function setTheme(theme) {
    if (!shadowHost) buildUI();
    shadowHost.dataset.theme = theme === 'light' ? 'light' : 'dark';
  }

    return { enable, disable, toggle, isEnabled: () => enabled, setTheme, setProperties };
}