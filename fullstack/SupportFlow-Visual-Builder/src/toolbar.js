/**
 * toolbar.js — Top toolbar: logo, Play/Stop, Undo/Redo, Add Node, Export
 */
import { getState, setState } from './state.js';
import { undo, redo, canUndo, canRedo, onHistoryChange } from './undoRedo.js';
import { exportFlow } from './flowLoader.js';
import { renderNodes } from './nodeCard.js';
import { initPreview, stopPreview } from './previewMode.js';
import { zoomIn, zoomOut, resetView } from './panZoom.js';
import { pushSnapshot } from './undoRedo.js';

const toolbarEl = document.getElementById('toolbar');

export function initToolbar() {
  toolbarEl.innerHTML = buildToolbarHTML();
  attachToolbarListeners();

  // Keep undo/redo buttons in sync
  onHistoryChange(({ canUndo: cu, canRedo: cr }) => {
    document.getElementById('btn-undo').disabled = !cu;
    document.getElementById('btn-redo').disabled = !cr;
  });

  // Update node count on state changes
  updateStats();
}

export function updateStats() {
  const statEl = document.getElementById('toolbar-node-count');
  if (statEl) {
    const { nodes } = getState();
    statEl.innerHTML = `<strong>${nodes.size}</strong> nodes`;
  }
}

function buildToolbarHTML() {
  return `
    <!-- Logo -->
    <div class="toolbar-logo">
      <div class="toolbar-logo-icon">⚡</div>
      <span class="toolbar-logo-text">SupportFlow</span>
      <span class="toolbar-logo-badge">Visual Builder</span>
    </div>

    <!-- Stats -->
    <span class="toolbar-stats" id="toolbar-node-count">— nodes</span>

    <div class="toolbar-divider"></div>

    <!-- Undo / Redo group -->
    <div class="toolbar-history-group">
      <button class="toolbar-btn" id="btn-undo" title="Undo (Ctrl+Z)" disabled>
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M2.5 6.5A5.5 5.5 0 0 1 8 1a5.5 5.5 0 0 1 5.5 5.5H12a4 4 0 0 0-4-4 4 4 0 0 0-4 4v.086l1.646-1.647a.75.75 0 0 1 1.061 1.061l-3 3a.75.75 0 0 1-1.061 0l-3-3A.75.75 0 0 1 1.707 4.94L3.5 6.732V6.5z"/>
          <path d="M5.5 10a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5A.75.75 0 0 1 5.5 10z"/>
        </svg>
        Undo
      </button>
      <button class="toolbar-btn" id="btn-redo" title="Redo (Ctrl+Y)" disabled>
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M13.5 6.5A5.5 5.5 0 0 0 8 1a5.5 5.5 0 0 0-5.5 5.5H4a4 4 0 0 1 4-4 4 4 0 0 1 4 4v.086l-1.646-1.647a.75.75 0 1 0-1.061 1.061l3 3a.75.75 0 0 0 1.061 0l3-3a.75.75 0 1 0-1.061-1.061L13.5 6.586V6.5z"/>
          <path d="M10.5 10a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 .75-.75z"/>
        </svg>
        Redo
      </button>
    </div>

    <div class="toolbar-divider"></div>

    <!-- Add Node -->
    <button class="toolbar-btn toolbar-btn--add" id="btn-add-node" title="Add a new question node">
      <svg viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2z"/>
      </svg>
      Add Node
    </button>
    
    <!-- New Workflow -->
    <button class="toolbar-btn" id="btn-new-flow" title="Clear canvas and start fresh">
      <svg viewBox="0 0 16 16" fill="currentColor">
        <path d="M2.5 1h11a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13.5v-11A1.5 1.5 0 0 1 2.5 1zm11 .5h-11a.5.5 0 0 0-.5.5v11c0 .28.22.5.5.5h11a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5zM8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
      </svg>
      New Workflow
    </button>

    <!-- Export -->
    <button class="toolbar-btn toolbar-btn--export" id="btn-export" title="Export flow as JSON">
      <svg viewBox="0 0 16 16" fill="currentColor">
        <path d="M7.47 10.78a.75.75 0 0 0 1.06 0l3.75-3.75a.75.75 0 0 0-1.06-1.06L8.75 8.44V1.75a.75.75 0 0 0-1.5 0v6.69L4.78 5.97a.75.75 0 0 0-1.06 1.06l3.75 3.75z"/>
        <path d="M3.75 13a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5z"/>
      </svg>
      Export JSON
    </button>

    <div class="toolbar-divider"></div>

    <!-- Play / Stop -->
    <button class="toolbar-btn toolbar-btn--play" id="btn-play">
      <svg viewBox="0 0 16 16" fill="currentColor" id="play-icon">
        <path d="M3.75 2a.75.75 0 0 0-.75.75v10.5a.75.75 0 0 0 1.14.642l9-5.25a.75.75 0 0 0 0-1.284l-9-5.25A.75.75 0 0 0 3.75 2z"/>
      </svg>
      <span id="play-label">Preview</span>
    </button>
  `;
}

function attachToolbarListeners() {
  // Undo / Redo
  document.getElementById('btn-undo').addEventListener('click', () => {
    undo();
    renderNodes();
    updateStats();
  });

  document.getElementById('btn-redo').addEventListener('click', () => {
    redo();
    renderNodes();
    updateStats();
  });

  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (!ctrl) return;
    if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); renderNodes(); updateStats(); }
    if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo(); renderNodes(); updateStats(); }
  });

  // Add Node
  document.getElementById('btn-add-node').addEventListener('click', () => addNewNode());

  // New Workflow
  document.getElementById('btn-new-flow')?.addEventListener('click', () => {
    if (confirm("Are you sure you want to clear the canvas and create a new workflow from scratch? All unsaved progress will be lost.")) {
      const startNode = {
        id: '1',
        type: 'start',
        text: 'Welcome to Support. How can we help you?',
        position: { x: 500, y: 50 },
        options: []
      };
      const newMap = new Map();
      newMap.set('1', startNode);
      
      setState({ nodes: newMap, selectedNodeId: '1' });
      pushSnapshot();
      renderNodes();
      updateStats();
      
      // Auto-open panel for the fresh start node
      import('./editPanel.js').then(module => {
         module.openPanel('1');
      });
    }
  });

  // Export JSON
  document.getElementById('btn-export').addEventListener('click', () => {
    exportFlow(getState().nodes);
  });

  // Play / Stop Preview
  const playBtn = document.getElementById('btn-play');
  playBtn.addEventListener('click', () => {
    const { mode } = getState();
    if (mode === 'editor') {
      setState({ mode: 'preview' });
      initPreview();
      playBtn.classList.add('active');
      document.getElementById('play-label').textContent = 'Stop';
      const icon = document.getElementById('play-icon');
      icon.innerHTML = `<path d="M3.25 2.75a.75.75 0 0 0-.75.75v9a.75.75 0 0 0 1.5 0v-9a.75.75 0 0 0-.75-.75zm9.5 0a.75.75 0 0 0-.75.75v9a.75.75 0 0 0 1.5 0v-9a.75.75 0 0 0-.75-.75z"/>`;
    } else {
      setState({ mode: 'editor' });
      stopPreview();
      playBtn.classList.remove('active');
      document.getElementById('play-label').textContent = 'Preview';
      const icon = document.getElementById('play-icon');
      icon.innerHTML = `<path d="M3.75 2a.75.75 0 0 0-.75.75v10.5a.75.75 0 0 0 1.14.642l9-5.25a.75.75 0 0 0 0-1.284l-9-5.25A.75.75 0 0 0 3.75 2z"/>`;
    }
  });

  // Listen for preview stopped from chat close button
  window.addEventListener('previewStopped', () => {
    playBtn.classList.remove('active');
    document.getElementById('play-label').textContent = 'Preview';
    const icon = document.getElementById('play-icon');
    icon.innerHTML = `<path d="M3.75 2a.75.75 0 0 0-.75.75v10.5a.75.75 0 0 0 1.14.642l9-5.25a.75.75 0 0 0 0-1.284l-9-5.25A.75.75 0 0 0 3.75 2z"/>`;
  });
}

/** Add a brand-new node to the canvas. Auto-connects to parentId if provided at the specified branchIdx. */
export function addNewNode(x, y, parentId = null, branchIdx = null) {
  const { nodes, pan, scale } = getState();

  // Determine spawn position
  let spawnX = x;
  let spawnY = y;
  if (spawnX === undefined || spawnY === undefined) {
    const wrapper = document.getElementById('canvas-wrapper');
    spawnX = Math.max(0, (wrapper.clientWidth  / 2 - pan.x) / scale - 130);
    spawnY = Math.max(0, (wrapper.clientHeight / 2 - pan.y) / scale - 50);
  }

  // Generate unique id
  const maxId = [...nodes.keys()].reduce((m, k) => Math.max(m, parseInt(k, 10) || 0), 0);
  const newId = String(maxId + 1);

  const newNode = {
    id: newId,
    type: 'question',
    text: 'New question',
    position: { x: spawnX, y: spawnY },
    options: [],
  };

  const updated = new Map(nodes);

  // Auto-connect to parent if requested
  if (parentId && branchIdx !== null) {
    const parentNode = updated.get(parentId);
    if (parentNode) {
      const newOptions = [...parentNode.options];
      if (newOptions[branchIdx]) {
        newOptions[branchIdx].nextId = newId;
      }
      updated.set(parentId, { ...parentNode, options: newOptions });
    }
  }

  updated.set(newId, newNode);
  setState({ nodes: updated, selectedNodeId: newId });
  pushSnapshot();
  renderNodes();
  updateStats();
}








