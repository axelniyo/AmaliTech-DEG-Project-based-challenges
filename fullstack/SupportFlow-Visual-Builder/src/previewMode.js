/**
 * previewMode.js — Chat simulation / "Test Drive" mode
 *
 * Renders a full chat UI overlaid on the canvas.
 * Traverses the decision tree node by node based on user option selection.
 */
import { getState, setState } from './state.js';

const overlay = document.getElementById('preview-overlay');

let messages = [];   // {from:'bot'|'user', text:string}[]
let historyStack = []; // Array of node IDs to allow backing up

/**
 * Enter preview mode — internal use; consumers call initPreview() instead.
 */
function startPreview() {
  const { nodes } = getState();
  const startNode = [...nodes.values()].find(n => n.type === 'start') || [...nodes.values()][0];
  if (!startNode) return;

  messages = [];
  historyStack = [];
  setState({ previewCurrentNodeId: startNode.id });
  overlay.classList.remove('hidden');
  renderChat();
}

/**
 * Exit preview mode.
 */
export function stopPreview() {
  overlay.classList.add('hidden');
  messages = [];
  historyStack = [];
}

/**
 * Full re-render of the chat UI from current state + messages array.
 */
function renderChat() {
  const { nodes, previewCurrentNodeId } = getState();
  const currentNode = nodes.get(previewCurrentNodeId);

  overlay.innerHTML = `
    <div class="chat-window">
      ${buildChatHeader()}
      <div class="chat-messages" id="chat-messages">
        ${messages.map(buildMessageBubble).join('')}
      </div>
      ${currentNode ? buildChatInput(currentNode) : ''}
    </div>
  `;

  // Auto-scroll messages
  const msgEl = document.getElementById('chat-messages');
  if (msgEl) msgEl.scrollTop = msgEl.scrollHeight;

  attachChatListeners(currentNode);
}

// ── HTML builders ──────────────────────────────────────────────

function buildChatHeader() {
  return `
    <div class="chat-header">
      <div class="chat-avatar">🤖</div>
      <div class="chat-bot-info">
        <div class="chat-bot-name">SupportFlow Bot</div>
        <div class="chat-bot-status">
          <span class="chat-status-dot"></span>
          Online · Preview Mode
        </div>
      </div>
      <button class="chat-close-btn" id="chat-close-btn" title="Exit preview">
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06z"/>
        </svg>
      </button>
    </div>
  `;
}

function buildMessageBubble({ from, text }) {
  if (from === 'bot') {
    return `
      <div class="msg msg--bot">
        <div class="msg-avatar">🤖</div>
        <div class="msg-bubble">${escHtml(text)}</div>
      </div>
    `;
  }
  return `
    <div class="msg msg--user">
      <div class="msg-bubble">${escHtml(text)}</div>
    </div>
  `;
}

function buildChatInput(node) {
  // Leaf node — end of conversation
  if (node.options.length === 0) {
    return `
      <div class="chat-end-section">
        <div class="chat-end-icon">✅</div>
        <div class="chat-end-label">End of conversation</div>
        <button class="chat-restart-btn" id="chat-restart-btn">↺ Restart</button>
        ${historyStack.length > 0 ? `
          <button class="chat-back-btn-end" style="margin-top: 8px; background: transparent; border: 1px solid var(--clr-border); padding: 8px 16px; border-radius: 6px; cursor: pointer; color: var(--clr-text-secondary); width: 100%;">↩ Go Back</button>
        ` : ''}
      </div>
    `;
  }

  // Normal node — show option buttons
  return `
    <div class="chat-options">
      <div class="chat-options-label">Choose a response:</div>
      ${node.options.map((opt, idx) => `
        <button class="chat-option-btn" data-next="${opt.nextId}" data-label="${escHtml(opt.label)}">
          ${escHtml(opt.label)}
          <span class="chat-option-arrow">›</span>
        </button>
      `).join('')}
      ${historyStack.length > 0 ? `
        <button class="chat-option-btn chat-back-btn" style="background: rgba(255,255,255,0.05); border: 1px solid var(--clr-border); color: var(--clr-text-secondary);">
          Go Back
          <span class="chat-option-arrow">↩</span>
        </button>
      ` : ''}
    </div>
  `;
}

// ── Event listeners ────────────────────────────────────────────

function attachChatListeners(currentNode) {
  // Close button
  document.getElementById('chat-close-btn')?.addEventListener('click', () => {
    stopPreview();
    setState({ mode: 'editor' });
    // Notify toolbar via custom event
    window.dispatchEvent(new CustomEvent('previewStopped'));
  });

  // Restart button
  document.getElementById('chat-restart-btn')?.addEventListener('click', () => {
    startPreview();
  });

  // Option buttons & Back buttons — traverse graph
  overlay.querySelectorAll('.chat-option-btn, .chat-back-btn-end').forEach(btn => {
    btn.addEventListener('click', () => {
      // Handle Go Back logic
      if (btn.classList.contains('chat-back-btn') || btn.classList.contains('chat-back-btn-end')) {
        const prevNodeId = historyStack.pop();
        if (prevNodeId) {
          setState({ previewCurrentNodeId: prevNodeId });
          messages.splice(-2); // Delete last user answer and bot response
          renderChat();
        }
        return;
      }

      const nextNodeId = btn.dataset.next;
      const label = btn.dataset.label;
      const { nodes, previewCurrentNodeId } = getState();
      const thisNode = nodes.get(previewCurrentNodeId);

      // Show bot message first if not yet shown
      if (messages.length === 0 || messages[messages.length - 1].from !== 'bot') {
        messages.push({ from: 'bot', text: thisNode?.text || '' });
      }

      // Track history before jumping
      historyStack.push(previewCurrentNodeId);

      // User selection
      messages.push({ from: 'user', text: label });

      // Next node
      const nextNode = nodes.get(nextNodeId);
      if (nextNode) {
        messages.push({ from: 'bot', text: nextNode.text });
        setState({ previewCurrentNodeId: nextNodeId });
      }

      renderChat();
    });
  });
}

// First render — show the start node's message as the first bot message
function initFirstMessage() {
  const { nodes, previewCurrentNodeId } = getState();
  const node = nodes.get(previewCurrentNodeId);
  if (node && messages.length === 0) {
    messages.push({ from: 'bot', text: node.text });
  }
}

/** Re-initialised start that includes first bot message */
export function initPreview() {
  const { nodes } = getState();
  const startNode = [...nodes.values()].find(n => n.type === 'start') || [...nodes.values()][0];
  if (!startNode) return;
  messages = [{ from: 'bot', text: startNode.text }];
  historyStack = [];
  setState({ previewCurrentNodeId: startNode.id });
  overlay.classList.remove('hidden');
  renderChat();
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}




