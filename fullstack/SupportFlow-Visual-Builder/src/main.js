/**
 * main.js — Application entry point
 *
 * Boot sequence:
 * 1. Load flow data from JSON
 * 2. Initialise undo/redo
 * 3. Render toolbar
 * 4. Init pan/zoom
 * 5. Init drag
 * 6. Render nodes + SVG connectors
 * 7. Init edit panel
 * 8. Attach state subscription for reactive re-renders
 */
import { loadFlow } from './flowLoader.js';
import { subscribe, getState, setState } from './state.js';
import { init as initHistory, pushSnapshot } from './undoRedo.js';
import { initToolbar, updateStats } from './toolbar.js';
import { initPanZoom, applyTransform } from './panZoom.js';
import { initDrag } from './drag.js';
import { renderNodes } from './nodeCard.js';
import { drawConnectors } from './svgLayer.js';
import { initEditPanel, openPanel, closePanel } from './editPanel.js';
import { addZoomControls } from './zoomControls.js';

async function boot() {
  try {
    // 1. Load data
    await loadFlow();

    // 2. Undo/redo — must come after loadFlow so state is populated
    initHistory();

    // 3. Toolbar
    initToolbar();

    // 4. Canvas pan/zoom
    initPanZoom();
    applyTransform();

    // 5. Node drag
    initDrag();

    // 6. Initial render
    renderNodes();

    // 7. Edit panel
    initEditPanel(handleNodeDelete);

    // 8. Zoom controls UI
    addZoomControls();

    // 9. Reactive subscription — open/close edit panel on selectedNodeId change
    let previousSelectedId = null;
    
    subscribe((state) => {
      if (state.selectedNodeId !== previousSelectedId) {
        if (state.selectedNodeId) {
          openPanel(state.selectedNodeId);
        }
        previousSelectedId = state.selectedNodeId;
      }
      updateStats();
    });

    console.log('✅ SupportFlow Visual Builder ready');

  } catch (err) {
    console.error('Boot failed:', err);
    showError(err.message);
  }
}

/** Handle node deletion from edit panel */
function handleNodeDelete(nodeId) {
  if (!confirm('Delete this node? This cannot be undone until you undo.')) return;

  const { nodes } = getState();
  const updated = new Map(nodes);

  // Remove node
  updated.delete(nodeId);

  // Clean up orphaned option references
  updated.forEach(node => {
    const cleaned = node.options.filter(o => o.nextId !== nodeId);
    if (cleaned.length !== node.options.length) {
      updated.set(node.id, { ...node, options: cleaned });
    }
  });

  setState({ nodes: updated, selectedNodeId: null });
  pushSnapshot();
  closePanel();
  renderNodes();
  updateStats();
}

function showError(msg) {
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;
                font-family:Inter,sans-serif;background:#0b0d14;color:#ef4444;
                flex-direction:column;gap:16px;text-align:center;padding:24px;">
      <div style="font-size:48px;">⚠️</div>
      <div style="font-size:18px;font-weight:600;color:#f1f5f9">Failed to load SupportFlow</div>
      <div style="font-size:14px;color:#64748b;max-width:400px">${msg}</div>
      <div style="font-size:12px;color:#475569">Make sure you're running via a dev server (npm run dev)</div>
    </div>
  `;
}

boot();
