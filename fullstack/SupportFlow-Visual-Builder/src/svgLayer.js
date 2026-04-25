/**
 * svgLayer.js — Draw SVG Bézier connectors between nodes
 *
 * Renders into the #svg-layer SVG element.
 * Called after any state change that could affect node positions or edges.
 *
 * CRITICAL CONSTRAINT: Built from scratch. No flowchart/graph library used.
 */
import { getState } from './state.js';
import { getBottomAnchor, getTopAnchor, cubicBezierPath } from './svgMath.js';

const svgEl = /** @type {SVGSVGElement} */ (document.getElementById('svg-layer'));

/**
 * Clear and redraw all connectors.
 */
export function drawConnectors() {
  const { nodes, selectedNodeId } = getState();

  // Use a DOM pool pattern: reuse existing paths instead of heavy destroy/recreate
  const existingPaths = svgEl.querySelectorAll('.connector');
  let pathIdx = 0;

  // Draw one path per option edge
  nodes.forEach(parentNode => {
    parentNode.options.forEach((option, idx) => {
      const childNode = nodes.get(option.nextId);
      if (!childNode) return;

      let src = getBottomAnchor(parentNode);
      const dst = getTopAnchor(childNode);

      // Option index offset: dynamically stagger src x to align with flexbox evenly-spaced buttons
      if (parentNode.options.length > 1) {
        const numOptions = parentNode.options.length;
        // The container uses width 100% and space-evenly padding. 
        // For N options, space-evenly places them such that there are N+1 gaps.
        // Assuming card width ~280 and padding ~40px side track, the track is roughly 200px wide.
        const trackWidth = 200;
        const gap = trackWidth / (numOptions + 1);
        // Calculate offset from center (0 = center)
        const offset = (idx * gap + gap) - (trackWidth / 2);
        src = { x: src.x + offset, y: src.y };
      }

      const d = cubicBezierPath(src, dst);
      const isActive = parentNode.id === selectedNodeId || childNode.id === selectedNodeId;

      // Get or create path
      let path;
      if (pathIdx < existingPaths.length) {
        path = existingPaths[pathIdx];
      } else {
        path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        svgEl.appendChild(path);
      }
      pathIdx++;

      // Update attributes (browser is smart enough to skip if unchanged)
      const newClass = 'connector' + (isActive ? ' connector--active' : '');
      if (path.getAttribute('class') !== newClass) {
        path.setAttribute('class', newClass);
        path.setAttribute('stroke', isActive ? 'var(--clr-accent-primary)' : 'var(--clr-connector)');
        path.setAttribute('stroke-width', isActive ? '2.5' : '1.8');
        path.setAttribute('marker-end', isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)');
        if (isActive) {
          path.setAttribute('stroke-dasharray', '6 4');
          path.style.animation = 'connectorFlow 0.8s linear infinite';
        } else {
          path.removeAttribute('stroke-dasharray');
          path.style.animation = '';
        }
      }
      
      // Update D only if it changed (optimization)
      if (path.getAttribute('d') !== d) {
        path.setAttribute('d', d);
      }
    });
  });

  // Clean up any extra unused paths
  for (let i = pathIdx; i < existingPaths.length; i++) {
    existingPaths[i].remove();
  }
}




