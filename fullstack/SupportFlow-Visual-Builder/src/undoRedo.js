/**
 * undoRedo.js — Undo/Redo history using node Map snapshots
 *
 * Wildcard Feature: Allows non-technical managers to recover from
 * accidental moves or edits — essential for a production-grade editor.
 */
import { getState, setState, cloneNodes } from './state.js';

const MAX_HISTORY = 50;
let history = [];   // Array of Map snapshots
let histIdx = -1;   // Current position in history

/** Push a snapshot of the current nodes into history. */
export function pushSnapshot() {
  const { nodes } = getState();
  // Drop any "future" history if we branched
  history = history.slice(0, histIdx + 1);
  history.push(cloneNodes(nodes));
  if (history.length > MAX_HISTORY) history.shift();
  histIdx = history.length - 1;
  _notifyListeners();
}

/** Undo: restore previous snapshot */
export function undo() {
  if (histIdx <= 0) return;
  histIdx--;
  setState({ nodes: cloneNodes(history[histIdx]) });
  _notifyListeners();
}

/** Redo: restore next snapshot */
export function redo() {
  if (histIdx >= history.length - 1) return;
  histIdx++;
  setState({ nodes: cloneNodes(history[histIdx]) });
  _notifyListeners();
}

export function canUndo() { return histIdx > 0; }
export function canRedo() { return histIdx < history.length - 1; }

// ── Internal change listeners (for toolbar button enable/disable) ──
const listeners = new Set();
export function onHistoryChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function _notifyListeners() {
  listeners.forEach(fn => fn({ canUndo: canUndo(), canRedo: canRedo() }));
}

/** Initialise history with the loaded state (call after loadFlow). */
export function init() {
  history = [];
  histIdx = -1;
  pushSnapshot(); // snapshot 0 = initial state
}
