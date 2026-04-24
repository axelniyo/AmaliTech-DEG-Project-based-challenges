/**
 * panZoom.js — Canvas pan and zoom
 *
 * Pan: pointer drag on canvas background (not on nodes/handles)
 * Zoom: mouse wheel, centered on cursor position
 *
 * Transform is applied as CSS `transform: translate(x,y) scale(z)` on #canvas.
 * State (scale, pan) is stored in central state so drag.js can read the scale.
 */
import { getState, setState } from './state.js';
import { drawConnectors } from './svgLayer.js';

const canvasWrapper = document.getElementById('canvas-wrapper');
const canvas        = document.getElementById('canvas');

const MIN_SCALE = 0.25;
const MAX_SCALE = 2.5;

let isPanning = false;
let panStart  = { x: 0, y: 0 };
let panOrigin = { x: 0, y: 0 };

export function initPanZoom() {
  canvasWrapper.addEventListener('pointerdown', onPanStart);
  window.addEventListener('pointermove', onPanMove);
  window.addEventListener('pointerup', onPanEnd);
  canvasWrapper.addEventListener('wheel', onWheel, { passive: false });

  // Apply initial transform from state
  applyTransform();
}

function onPanStart(e) {
  // Only pan when clicking the canvas background (not a node or handle)
  if (e.target.closest('.node-card')) return;
  if (e.target.closest('.zoom-controls')) return;

  isPanning = true;
  panStart  = { x: e.clientX, y: e.clientY };
  const { pan } = getState();
  panOrigin = { ...pan };

  canvasWrapper.classList.add('grabbing');
  e.preventDefault();
}

function onPanMove(e) {
  if (!isPanning) return;
  const dx = e.clientX - panStart.x;
  const dy = e.clientY - panStart.y;
  const newPan = { x: panOrigin.x + dx, y: panOrigin.y + dy };
  setState({ pan: newPan });
  applyTransform();
}

function onPanEnd() {
  if (!isPanning) return;
  isPanning = false;
  canvasWrapper.classList.remove('grabbing');
}

function onWheel(e) {
  e.preventDefault();
  const { scale, pan } = getState();

  // Mouse position relative to canvas wrapper
  const rect    = canvasWrapper.getBoundingClientRect();
  const mouseX  = e.clientX - rect.left;
  const mouseY  = e.clientY - rect.top;

  // Point in canvas-space under cursor before zoom
  const canvasX = (mouseX - pan.x) / scale;
  const canvasY = (mouseY - pan.y) / scale;

  // New scale
  const delta    = e.deltaY < 0 ? 1.1 : 0.9;
  const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * delta));

  // Adjust pan so the canvas-space point stays under the cursor
  const newPan = {
    x: mouseX - canvasX * newScale,
    y: mouseY - canvasY * newScale,
  };

  setState({ scale: newScale, pan: newPan });
  applyTransform();
  updateZoomLabel();
}

/** Apply current pan+scale to DOM */
export function applyTransform() {
  const { scale, pan } = getState();
  canvas.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${scale})`;
}

/** Reset to default view */
export function resetView() {
  setState({ scale: 1, pan: { x: 80, y: 60 } });
  applyTransform();
  updateZoomLabel();
}

/** Zoom in by a fixed step */
export function zoomIn() {
  const { scale, pan } = getState();
  const newScale = Math.min(MAX_SCALE, scale * 1.2);
  const cx = canvasWrapper.clientWidth  / 2;
  const cy = canvasWrapper.clientHeight / 2;
  const canvasX = (cx - pan.x) / scale;
  const canvasY = (cy - pan.y) / scale;
  setState({
    scale: newScale,
    pan: { x: cx - canvasX * newScale, y: cy - canvasY * newScale },
  });
  applyTransform();
  updateZoomLabel();
}

/** Zoom out by a fixed step */
export function zoomOut() {
  const { scale, pan } = getState();
  const newScale = Math.max(MIN_SCALE, scale * 0.8);
  const cx = canvasWrapper.clientWidth  / 2;
  const cy = canvasWrapper.clientHeight / 2;
  const canvasX = (cx - pan.x) / scale;
  const canvasY = (cy - pan.y) / scale;
  setState({
    scale: newScale,
    pan: { x: cx - canvasX * newScale, y: cy - canvasY * newScale },
  });
  applyTransform();
  updateZoomLabel();
}

function updateZoomLabel() {
  const label = document.getElementById('zoom-level');
  if (label) label.textContent = `${Math.round(getState().scale * 100)}%`;
}
