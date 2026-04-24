/**
 * zoomControls.js — Inject zoom +/− buttons and level label onto canvas
 */
import { zoomIn, zoomOut, resetView } from './panZoom.js';
import { getState } from './state.js';

export function addZoomControls() {
  const wrapper = document.getElementById('canvas-wrapper');

  const controls = document.createElement('div');
  controls.className = 'zoom-controls';
  controls.innerHTML = `
    <button class="zoom-btn" id="zoom-in-btn"  title="Zoom in (+)">+</button>
    <div    class="zoom-level" id="zoom-level"  title="Reset zoom">100%</div>
    <button class="zoom-btn" id="zoom-out-btn" title="Zoom out (−)">−</button>
  `;
  wrapper.appendChild(controls);

  document.getElementById('zoom-in-btn').addEventListener('click', zoomIn);
  document.getElementById('zoom-out-btn').addEventListener('click', zoomOut);
  document.getElementById('zoom-level').addEventListener('click', resetView);

  // Keyboard zoom
  window.addEventListener('keydown', (e) => {
    if (e.key === '=' || e.key === '+') zoomIn();
    if (e.key === '-' || e.key === '_') zoomOut();
    if (e.key === '0') resetView();
  });

  // Hint text
  const hint = document.createElement('div');
  hint.className = 'canvas-hint';
  hint.textContent = 'Scroll to zoom · Drag to pan · Click node to edit';
  wrapper.appendChild(hint);

  // Fade hint out after 4 seconds
  setTimeout(() => {
    hint.style.transition = 'opacity 0.5s ease';
    hint.style.opacity = '0';
    setTimeout(() => hint.remove(), 500);
  }, 4000);
}
