/**
 * svgMath.js — Bézier curve calculations for node connectors
 *
 * ALL coordinate math is done in canvas-space (using node.position.x/y
 * directly), so we never need getBoundingClientRect() or any pan/zoom
 * correction — the SVG lives inside the same transformed container as
 * the nodes, so they share the same coordinate system automatically.
 */

export const NODE_WIDTH = 260;

/**
 * Estimate node card height based on its content.
 * Used to find the bottom-center anchor point.
 * @param {object} node
 * @returns {number} estimated height in px
 */
export function estimateNodeHeight(node) {
  // Header: ~40px, Body text: ~24px base + wrapping, Options bar: 28px each
  const textLines = Math.ceil(node.text.length / 28);
  const bodyHeight = 16 + textLines * 22;
  const optionsHeight = node.options.length === 0
    ? 32   // end node bar
    : 8 + node.options.length * 26;
  return 40 + bodyHeight + optionsHeight;
}

/**
 * Get the bottom-center anchor of a node (source connection point).
 * @param {object} node
 * @returns {{x:number, y:number}}
 */
export function getBottomAnchor(node) {
  return {
    x: node.position.x + NODE_WIDTH / 2,
    y: node.position.y + estimateNodeHeight(node),
  };
}

/**
 * Get the top-center anchor of a node (target connection point).
 * @param {object} node
 * @returns {{x:number, y:number}}
 */
export function getTopAnchor(node) {
  return {
    x: node.position.x + NODE_WIDTH / 2,
    y: node.position.y,
  };
}

/**
 * Build a cubic Bézier SVG path string from source to destination.
 * Control points create a smooth S-curve regardless of direction.
 *
 * @param {{x:number, y:number}} src
 * @param {{x:number, y:number}} dst
 * @returns {string} SVG path `d` attribute value
 */
export function cubicBezierPath(src, dst) {
  const dy = Math.abs(dst.y - src.y);
  const tension = Math.max(dy * 0.5, 60);   // minimum curve tension
  const cp1x = src.x;
  const cp1y = src.y + tension;
  const cp2x = dst.x;
  const cp2y = dst.y - tension;
  return `M ${src.x} ${src.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${dst.x} ${dst.y}`;
}
