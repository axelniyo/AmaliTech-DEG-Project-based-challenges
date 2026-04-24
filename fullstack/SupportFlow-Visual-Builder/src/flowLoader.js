/**
 * flowLoader.js — Fetch and parse flow_data.json
 */
import { setState } from './state.js';

/**
 * Load flow data from /flow_data.json and hydrate state.
 */
export async function loadFlow() {
  const res = await fetch('/flow_data.json');
  if (!res.ok) throw new Error(`Failed to load flow data: ${res.status}`);

  const data = await res.json();

  /** @type {Map<string, object>} */
  const nodes = new Map();
  for (const node of data.nodes) {
    nodes.set(node.id, {
      id: node.id,
      type: node.type,           // 'start' | 'question' | 'end'
      text: node.text,
      position: { ...node.position },
      options: (node.options || []).map(o => ({ label: o.label, nextId: o.nextId })),
    });
  }

  // Find start node id
  const startNode = [...nodes.values()].find(n => n.type === 'start');
  const startNodeId = startNode ? startNode.id : data.nodes[0]?.id;

  setState({ nodes, previewCurrentNodeId: startNodeId });
  return { nodes, startNodeId };
}

/**
 * Export current nodes map back to flow_data.json format and trigger download.
 * @param {Map<string, object>} nodes
 */
export function exportFlow(nodes) {
  const flowData = {
    meta: { theme: 'dark', canvas_size: { w: 1200, h: 800 } },
    nodes: [...nodes.values()].map(n => ({
      id: n.id,
      type: n.type,
      text: n.text,
      position: { ...n.position },
      options: n.options.map(o => ({ label: o.label, nextId: o.nextId })),
    })),
  };

  const json = JSON.stringify(flowData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'flow_data.json';
  a.click();
  URL.revokeObjectURL(url);
}
