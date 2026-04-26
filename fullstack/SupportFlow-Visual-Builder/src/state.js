/**
 * state.js — Central pub/sub state management
 * A lightweight reactive store. No framework needed.
 */

const initialState = {
  /** @type {Map<string, {id:string, type:string, text:string, position:{x:number,y:number}, options:{label:string,nextId:string}[]}>} */
  nodes: new Map(),
  /** @type {string|null} */
  selectedNodeId: null,
  /** @type {'editor'|'preview'} */
  mode: 'editor',
  /** @type {string|null} */
  previewCurrentNodeId: null,
  /** @type {number} */
  scale: 0.7,
  /** @type {{x:number, y:number}} */
  pan: { x: 255, y: 15 },
};

let state = { ...initialState };
const listeners = new Set();

/**
 * Subscribe to state changes.
 * @param {(state: typeof initialState) => void} fn
 * @returns {() => void} unsubscribe function
 */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Get current state snapshot (read-only reference) */
export function getState() {
  return state;
}

/**
 * Merge partial updates into state and notify all listeners.
 * @param {Partial<typeof initialState>} partial
 */
export function setState(partial) {
  state = { ...state, ...partial };
  listeners.forEach(fn => fn(state));
}

/**
 * Deep-clone nodes map for undo/redo snapshots.
 */
export function cloneNodes(nodesMap) {
  const clone = new Map();
  nodesMap.forEach((node, id) => {
    clone.set(id, {
      ...node,
      position: { ...node.position },
      options: node.options.map(o => ({ ...o })),
    });
  });
  return clone;
}
