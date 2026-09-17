const HIGHLIGHT_FILL = 'rgba(99, 102, 241, 0.25)';
const HIGHLIGHT_BORDER = '#6366f1';

const INSPECTED_PROPERTIES = [
  ['display', 'Display'],
  ['position', 'Position'],
  ['width', 'Width'],
  ['height', 'Height'],
  ['margin', 'Margin'],
  ['padding', 'Padding'],
  ['border', 'Border'],
  ['color', 'Color'],
  ['background-color', 'Background'],
  ['font-family', 'Font'],
  ['font-size', 'Font Size'],
  ['font-weight', 'Font Weight'],
  ['line-height', 'Line Height'],
  ['z-index', 'Z-Index'],
  ['box-sizing', 'Box Sizing'],
];

export function createInspector() {
  let enabled = false;
  let currentTarget = null;
  let shadowHost, shadowRoot, highlightBox, panel;

  function buildUI() {
    shadowHost = document.createElement('div');
    shadowHost.id = 'css-hover-inspector-root';
    // pointer-events: none is what lets mouseover pass THROUGH to the real
    // page elements underneath our overlay — critical, not optional.
    shadowHost.style.cssText =
      'position:fixed; top:0; left:0; width:0; height:0; z-index:2147483647; pointer-events:none;';
    shadowRoot = shadowHost.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      .highlight-box {
        position: fixed;
        background: ${HIGHLIGHT_FILL};
        border: 1px solid ${HIGHLIGHT_BORDER};
        box-sizing: border-box;
        border-radius: 2px;
        pointer-events: none;
        display: none;
      }
      .panel {
        position: fixed;
        pointer-events: none;
        background: #17181f;
        color: #e4e4e7;
        border: 1px solid #2c2d38;
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
        color: #6366f1;
        font-weight: 700;
        font-size: 12px;
        margin-bottom: 6px;
        padding-bottom: 6px;
        border-bottom: 1px solid #2c2d38;
      }
      .panel__row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
      }
      .panel__prop { color: #9797a3; white-space: nowrap; }
      .panel__value {
        color: #e4e4e7;
        text-align: right;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 170px;
      }
    `;

    highlightBox = document.createElement('div');
    highlightBox.className = 'highlight-box';

    panel = document.createElement('div');
    panel.className = 'panel';

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
    const rows = INSPECTED_PROPERTIES.map(([prop, label]) => {
      const value = computed.getPropertyValue(prop) || '—';
      return `<div class="panel__row">
        <span class="panel__prop">${label}</span>
        <span class="panel__value" title="${value}">${value}</span>
      </div>`;
    }).join('');

    panel.innerHTML = `<div class="panel__tag">${describeElement(el)}</div>${rows}`;
  }

  function positionHighlight(el) {
    const rect = el.getBoundingClientRect();
    Object.assign(highlightBox.style, {
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
  }

  function positionPanel(mouseX, mouseY) {
    const margin = 16;
    const panelRect = panel.getBoundingClientRect();
    let x = mouseX + margin;
    let y = mouseY + margin;

    if (x + panelRect.width > window.innerWidth) x = mouseX - panelRect.width - margin;
    if (y + panelRect.height > window.innerHeight) y = mouseY - panelRect.height - margin;

    panel.style.left = `${Math.max(8, x)}px`;
    panel.style.top = `${Math.max(8, y)}px`;
  }

  function handleMouseOver(e) {
    if (!enabled) return;
    const el = e.target;
    if (el === currentTarget) return;
    currentTarget = el;

    const computed = getComputedStyle(el);
    positionHighlight(el);
    renderPanel(el, computed);
    highlightBox.style.display = 'block';
    panel.style.display = 'block';
    positionPanel(e.clientX, e.clientY);
  }

  function handleMouseMove(e) {
    if (!enabled || !currentTarget) return;
    positionPanel(e.clientX, e.clientY);
  }

  function handleScroll() {
    if (!enabled || !currentTarget) return;
    positionHighlight(currentTarget);
  }

  function enable() {
    if (enabled) return;
    if (!shadowHost) buildUI();
    enabled = true;
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mousemove', handleMouseMove, true);
    window.addEventListener('scroll', handleScroll, true);
  }

  function disable() {
    enabled = false;
    currentTarget = null;
    if (highlightBox) highlightBox.style.display = 'none';
    if (panel) panel.style.display = 'none';
    document.removeEventListener('mouseover', handleMouseOver, true);
    document.removeEventListener('mousemove', handleMouseMove, true);
    window.removeEventListener('scroll', handleScroll, true);
  }

  function toggle() {
    return enabled ? (disable(), false) : (enable(), true);
  }

  return { enable, disable, toggle, isEnabled: () => enabled };
}