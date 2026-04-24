/**
 * drag.js — Node drag-to-reposition
 *
 * Uses Pointer Events API (handles both mouse and touch).
 * Listens on the nodes-layer container via event delegation.
 * All position math is done in canvas-space (accounting for pan+zoom transform).
 */
import { getState, setState } from './state.js';
import { pushSnapshot } from './undoRedo.js';
import { drawConnectors } from './svgLayer.js';
import { renderNodes } from './nodeCard.js';

const nodesLayer = document.getElementById('nodes-layer');
const canvasWrapper = document.getElementById('canvas-wrapper');

let dragging = null; // { nodeId, startPointerX, startPointerY, startNodeX, startNodeY }

/**
 * Initialise drag listeners on the nodes layer (event delegation).
 * Only the .node-drag-handle triggers a drag.
 */
export function initDrag() {
  nodesLayer.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
}

function onPointerDown(e) {
  const handle = e.target.closest('.node-drag-handle');
  if (!handle) return;

  const card = handle.closest('.node-card');
  if (!card) return;

  const nodeId = card.id.replace('node-', '');
  const { nodes, scale } = getState();
  const node = nodes.get(nodeId);
  if (!node) return;

  e.preventDefault();
  card.classList.add('dragging');
  card.setPointerCapture(e.pointerId);

  dragging = {
    nodeId,
    pointerId: e.pointerId,
    startPointerX: e.clientX,
    startPointerY: e.clientY,
    startNodeX: node.position.x,
    startNodeY: node.position.y,
  };

  // Select the node being dragged
  setState({ selectedNodeId: nodeId });
}

function onPointerMove(e) {
  if (!dragging) return;

  const { scale } = getState();

  // Convert screen delta → canvas delta (divide by scale)
  const dx = (e.clientX - dragging.startPointerX) / scale;
  const dy = (e.clientY - dragging.startPointerY) / scale;

  const newX = Math.max(0, dragging.startNodeX + dx);
  const newY = Math.max(0, dragging.startNodeY + dy);

  // Update node position in state
  const { nodes } = getState();
  const node = nodes.get(dragging.nodeId);
  if (!node) return;

  const updatedNode = { ...node, position: { x: newX, y: newY } };
  const updatedNodes = new Map(nodes);
  updatedNodes.set(dragging.nodeId, updatedNode);
  setState({ nodes: updatedNodes });

  // Move card DOM directly (fast, avoids full re-render during drag)
  const card = document.getElementById(`node-${dragging.nodeId}`);
  if (card) {
    card.style.left = `${newX}px`;
    card.style.top  = `${newY}px`;
  }

  // Redraw connectors
  drawConnectors();
}

function onPointerUp(e) {
  if (!dragging) return;

  const card = document.getElementById(`node-${dragging.nodeId}`);
  if (card) card.classList.remove('dragging');

  // Push to undo history after drag ends
  pushSnapshot();

  dragging = null;
}
