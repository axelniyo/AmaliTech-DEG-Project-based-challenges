/**
 * nodeCard.js — Create and manage node card DOM elements
 */
import { getState, setState } from './state.js';
import { pushSnapshot } from './undoRedo.js';
import { drawConnectors } from './svgLayer.js';
import { addNewNode } from './toolbar.js';

const nodesLayer = document.getElementById('nodes-layer');

// Track DOM elements by node id
const cardEls = new Map();

/**
 * Full re-render of nodes layer from current state.
 */
export function renderNodes() {
  const { nodes, selectedNodeId } = getState();

  // Remove cards for deleted nodes
  cardEls.forEach((el, id) => {
    if (!nodes.has(id)) {
      el.remove();
      cardEls.delete(id);
    }
  });

  // Create or update each node
  nodes.forEach(node => {
    if (cardEls.has(node.id)) {
      updateCard(node, selectedNodeId);
    } else {
      createCard(node, selectedNodeId);
    }
  });

  drawConnectors();
}

/**
 * Create a new node card DOM element.
 */
function createCard(node, selectedNodeId) {
  const card = document.createElement('div');
  card.id = `node-${node.id}`;
  card.className = buildCardClass(node, selectedNodeId);
  card.style.left = `${node.position.x}px`;
  card.style.top  = `${node.position.y}px`;
  card.innerHTML  = buildCardHTML(node);

  // Click → select node
  card.addEventListener('click', (e) => {
    if (e.target.closest('.node-drag-handle')) return;
    
    // Binary branch logic (left/right)
    const branchBtn = e.target.closest('.branch-btn');
    if (branchBtn) {
      e.stopPropagation();
      const branchIdx = parseInt(branchBtn.dataset.branch, 10);
      const numOptions = node.options.length;
      const spread = Math.max(150, 300 / numOptions);
      const xOffset = (branchIdx - (numOptions - 1) / 2) * spread;
      
      // Auto-add new node mapped to this branch index
      addNewNode(node.position.x + xOffset, node.position.y + 180, node.id, branchIdx);
      return;
    }
    
    setState({ selectedNodeId: node.id });
    renderNodes();
  });

  nodesLayer.appendChild(card);
  cardEls.set(node.id, card);
}

/**
 * Update an existing card element to reflect state changes.
 */
function updateCard(node, selectedNodeId) {
  const card = cardEls.get(node.id);
  if (!card) return;
  card.className = buildCardClass(node, selectedNodeId);
  card.style.left = `${node.position.x}px`;
  card.style.top  = `${node.position.y}px`;
  card.innerHTML  = buildCardHTML(node);
  // (Do NOT re-attach click listeners here. 
  // innerHTML only destroys child nodes, not the parent's event listeners!)
}

function buildCardClass(node, selectedNodeId) {
  let cls = `node-card node-card--${node.type}`;
  if (node.id === selectedNodeId) cls += ' selected';
  return cls;
}

function buildCardHTML(node) {
  const typeLabelMap = { start: 'Start', question: 'Question', end: 'End' };
  const typeLabel = typeLabelMap[node.type] || node.type;

  const optionsHTML = node.type !== 'end' && node.options.length > 0 ? `
    <div class="binary-options">
      ${node.options.map((opt, idx) => `
        <div class="binary-opt ${idx < node.options.length - 1 ? 'left-opt' : ''}">${escHtml(opt.label)}</div>
      `).join('')}
    </div>
  ` : (node.type === 'end' ? `<div class="node-end-badge">
        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
          <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm2.3-6.7L7 9.6 5.7 8.3a.75.75 0 0 0-1.06 1.06l1.8 1.8a.75.75 0 0 0 1.06 0l3.8-3.8a.75.75 0 0 0-1.06-1.06z"/>
        </svg>
        End of conversation
      </div>` : '');

  const branchButtonsHTML = node.type !== 'end' ? `
    <div class="node-branch-wrapper">
      ${node.options.map((opt, idx) => !opt.nextId ? `
        <div class="branch-btn" data-branch="${idx}" title="Link Choice ${idx + 1}">
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 2v12m-6-6h12" stroke="currentColor" stroke-width="2"/></svg>
        </div>
      ` : '<div class="branch-spacer"></div>').join('')}
    </div>
  ` : '';

  return `
    <div class="node-header">
      <span class="node-badge">${typeLabel}</span>
      <span style="font-size: 11px; color: var(--clr-text-muted); font-family: monospace; font-weight: 500; margin-left: auto; margin-right: 8px;">ID: ${node.id}</span>
      <div class="node-drag-handle" title="Drag to move">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="8" cy="8" r="6.5"/>
          <circle cx="8" cy="8" r="2"/>
          <line x1="8" y1="1.5" x2="8" y2="6"/>
          <line x1="3.5" y1="11.5" x2="6.6" y2="9.2"/>
          <line x1="12.5" y1="11.5" x2="9.4" y2="9.2"/>
        </svg>
      </div>
    </div>
    <div class="node-body">
      <p class="node-text">${escHtml(node.text)}</p>
    </div>
    ${optionsHTML}
    ${branchButtonsHTML}
  `;
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Export card elements map so drag.js can attach pointer events */
export function getCardEl(id) {
  return cardEls.get(id);
}

export function getAllCardEls() {
  return cardEls;
}








