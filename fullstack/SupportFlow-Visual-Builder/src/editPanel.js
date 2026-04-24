/**
 * editPanel.js — Slide-in editor panel for node properties
 *
 * Opens when a node is selected, closes on deselect or Escape.
 * All changes dispatch immediately to state → canvas re-renders live.
 */
import { getState, setState } from './state.js';
import { pushSnapshot } from './undoRedo.js';
import { renderNodes } from './nodeCard.js';

const panel = document.getElementById('edit-panel');

let _debounceTimer = null;

/**
 * Initialise the edit panel. Subscribe to state changes to open/close.
 * @param {Function} onDelete - callback for node delete action
 */
export function initEditPanel(onDelete) {
  // Close on Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      closePanel();
    }
  });

  // Close when clicking canvas background
  document.getElementById('canvas-wrapper').addEventListener('click', (e) => {
    if (!e.target.closest('.node-card') && !e.target.closest('#edit-panel')) {
      closePanel();
    }
  });

  window._onNodeDelete = onDelete;
}

/** Open panel for the given node */
export function openPanel(nodeId) {
  const { nodes } = getState();
  const node = nodes.get(nodeId);
  if (!node) return;

  panel.innerHTML = buildPanelHTML(node, nodes);
  panel.classList.add('open');

  attachPanelListeners(nodeId);
}

/** Close and clear the panel */
export function closePanel() {
  panel.classList.remove('open');
  setState({ selectedNodeId: null });
  renderNodes();
}

/** Rebuild panel if currently showing the updated node */
export function refreshPanel() {
  const { selectedNodeId, nodes } = getState();
  if (selectedNodeId && panel.classList.contains('open')) {
    const node = nodes.get(selectedNodeId);
    if (node) {
      panel.innerHTML = buildPanelHTML(node, nodes);
      attachPanelListeners(selectedNodeId);
    }
  }
}

// ── HTML builders ──────────────────────────────────────────────

function buildPanelHTML(node, nodes) {
  const typeColors = { start: '#7c6cfc', question: '#3b82f6', end: '#f59e0b' };
  const color = typeColors[node.type] || '#64748b';

  const otherNodes = [...nodes.values()].filter(n => n.id !== node.id);

  let optionsHTML = '';
  if (node.type !== 'end') {
    optionsHTML = node.options.map((opt, idx) => `
      <div class="option-row" data-idx="${idx}">
        <input
          class="field-input option-label-input"
          type="text"
          value="${escHtml(opt.label)}"
          placeholder="Path ${idx + 1} Label"
          data-idx="${idx}"
        />
        <select class="option-nexid-select ${opt.label.trim() ? 'show' : ''} ${!opt.nextId ? 'unassigned-blink' : ''}" data-idx="${idx}" title="Next node">
          <option value="">Connect ➔</option>
          ${otherNodes.map(n => {
      const truncated = n.text.length > 20 ? n.text.substring(0, 20) + '...' : n.text;
      return `<option value="${n.id}" ${n.id === opt.nextId ? 'selected' : ''}>ID: ${n.id} - ${escHtml(truncated)}</option>`;
    }).join('')}
        </select>
        <button class="option-remove-btn" data-idx="${idx}" title="Remove option">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06z"/>
          </svg>
        </button>
      </div>
    `).join('');
  }

  return `
    <div class="panel-header">
      <div class="panel-title">
        <span class="panel-title-badge" style="background:${color}22;color:${color}">
          ${node.type.toUpperCase()}
        </span>
        Edit Node
      </div>
      <button class="panel-close-btn" id="panel-close-btn" title="Close panel (Esc)">
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06z"/>
        </svg>
      </button>
    </div>

    <div class="panel-body">

      <div class="field-group">
        <label class="field-label" for="node-text-input">Question / Message</label>
        <textarea class="field-textarea" id="node-text-input" rows="3"
          placeholder="Enter the bot's message...">${escHtml(node.text)}</textarea>
      </div>

      <div class="field-group">
        <label class="field-label" for="node-type-select">Node Type</label>
        <select class="field-select" id="node-type-select">
          <option value="start"    ${node.type === 'start' ? 'selected' : ''}>▶ Start</option>
          <option value="question" ${node.type === 'question' ? 'selected' : ''}>❓ Question</option>
          <option value="end"      ${node.type === 'end' ? 'selected' : ''}>✅ End</option>
        </select>
      </div>

      ${node.type !== 'end' ? `
        <div class="field-group">
          <label class="field-label">Routing Paths</label>
          <div class="options-list" id="options-list">
            ${optionsHTML}
          </div>
          <button class="add-option-btn" id="add-option-btn">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2z"/>
            </svg>
            Add Choice
          </button>
        </div>
      ` : ''}

      <div class="panel-node-id">Node ID: ${node.id}</div>
    </div>

    <div class="panel-footer">
      ${node.type !== 'start'
      ? `<button class="panel-btn panel-btn--delete" id="panel-delete-btn">
            🗑 Delete Node
          </button>`
      : ''}
    </div>
  `;
}

// ── Event listeners ────────────────────────────────────────────

function attachPanelListeners(nodeId) {
  // Close button
  document.getElementById('panel-close-btn')?.addEventListener('click', closePanel);

  // Text area — live update with debounce
  const textarea = document.getElementById('node-text-input');
  textarea?.addEventListener('input', () => {
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(() => {
      updateNodeField(nodeId, 'text', textarea.value);
    }, 150);
  });

  // Type selector
  document.getElementById('node-type-select')?.addEventListener('change', (e) => {
    updateNodeField(nodeId, 'type', e.target.value);
    pushSnapshot();
    refreshPanel();
  });

  // Option label inputs
  panel.querySelectorAll('.option-label-input').forEach(input => {
    input.addEventListener('input', () => {
      // Show/Hide dropdown dynamically as they type
      const select = input.parentElement.querySelector('.option-nexid-select');
      if (input.value.trim() !== '') {
        select?.classList.add('show');
      } else {
        select?.classList.remove('show');
      }

      clearTimeout(_debounceTimer);
      _debounceTimer = setTimeout(() => updateOption(nodeId, +input.dataset.idx, 'label', input.value), 150);
    });
  });

  // Next-ID selects
  panel.querySelectorAll('.option-nexid-select').forEach(sel => {
    sel.addEventListener('change', () => {
      updateOption(nodeId, +sel.dataset.idx, 'nextId', sel.value);
      pushSnapshot();
    });
  });

  // Remove option buttons
  panel.querySelectorAll('.option-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      removeOption(nodeId, +btn.dataset.idx);
    });
  });

  // Add option button
  document.getElementById('add-option-btn')?.addEventListener('click', () => {
    addOption(nodeId);
  });

  // Delete node button
  document.getElementById('panel-delete-btn')?.addEventListener('click', () => {
    if (window._onNodeDelete) window._onNodeDelete(nodeId);
  });
}

// ── State mutation helpers ─────────────────────────────────────

function updateNodeField(nodeId, field, value) {
  const { nodes } = getState();
  const node = nodes.get(nodeId);
  if (!node) return;
  const updated = new Map(nodes);
  updated.set(nodeId, { ...node, [field]: value });
  setState({ nodes: updated });
  renderNodes();
}

function updateOption(nodeId, idx, field, value) {
  const { nodes } = getState();
  const node = nodes.get(nodeId);
  if (!node) return;
  const opts = node.options.map((o, i) => i === idx ? { ...o, [field]: value } : o);
  const updated = new Map(nodes);
  updated.set(nodeId, { ...node, options: opts });
  setState({ nodes: updated });
  renderNodes();
}

function removeOption(nodeId, idx) {
  const { nodes } = getState();
  const node = nodes.get(nodeId);
  if (!node) return;
  const opts = node.options.filter((_, i) => i !== idx);
  const updated = new Map(nodes);
  updated.set(nodeId, { ...node, options: opts });
  setState({ nodes: updated });
  pushSnapshot();
  refreshPanel();
  renderNodes();
}

function addOption(nodeId) {
  const { nodes } = getState();
  const node = nodes.get(nodeId);
  if (!node) return;
  const newOpt = { label: '', nextId: null };
  const updated = new Map(nodes);
  updated.set(nodeId, { ...node, options: [...node.options, newOpt] });
  setState({ nodes: updated });
  pushSnapshot();
  refreshPanel();
  renderNodes();
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


