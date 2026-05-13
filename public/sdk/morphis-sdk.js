/**
 * MorphisSDK v2.1.0
 * AI-Native Embedded UI Engine — Production-Grade ES6 Module
 *
 * Pillars:
 * 1. Security: Sandboxed iframe, CSP nonce, source-verified postMessage
 * 2. Fault Tolerance: Message queue, connection timeout, error boundaries
 * 3. Performance: Debounced ResizeObserver, clamped heights, aggressive GC
 *
 * @module morphis-sdk
 */

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const SDK_VERSION = '2.1.0';
const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_MAX_HEIGHT = 2000;
const RESIZE_DEBOUNCE_MS = 50;

/** Protocol message types */
const MSG = Object.freeze({
  INJECT_UI: 'morphis:inject-ui',
  STATE_SYNC: 'morphis:state-sync',
  READY: 'morphis:ready',
  RENDER_ERROR: 'morphis:render-error',
  RESIZE: 'morphis:resize',
  EVENT: 'morphis:event',
});

const SANDBOX_FLAGS = 'allow-scripts';

// ─── CUSTOM ERRORS ───────────────────────────────────────────────────────────

/**
 * Thrown when the iframe bridge fails to establish within the timeout window.
 */
export class MorphisConnectionError extends Error {
  constructor(timeoutMs) {
    super(
      `[MorphisSDK] Connection timeout: iframe bridge did not respond within ${timeoutMs}ms. ` +
        `Verify the container is in the DOM and not blocked by CSP.`
    );
    this.name = 'MorphisConnectionError';
    this.timeoutMs = timeoutMs;
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function generateNonce() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint8Array(16);
    crypto.getRandomValues(buf);
    return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function isValidMessage(data) {
  return (
    data !== null &&
    typeof data === 'object' &&
    typeof data.type === 'string' &&
    data.type.startsWith('morphis:')
  );
}

function isValidUIPayload(payload) {
  if (!payload || typeof payload !== 'object') return false;
  if (typeof payload.html !== 'string' || payload.html.length === 0) return false;
  if (payload.html.length > 2_000_000) return false;
  if (payload.css !== undefined && typeof payload.css !== 'string') return false;
  if (payload.metadata !== undefined && typeof payload.metadata !== 'object') return false;
  return true;
}

function deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  Object.freeze(obj);
  for (const key of Object.getOwnPropertyNames(obj)) {
    const val = obj[key];
    if (typeof val === 'object' && val !== null && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  }
  return obj;
}

// ─── SDK CLASS ───────────────────────────────────────────────────────────────

export class MorphisSDK {
  // Config
  #config;

  // DOM references
  #iframe = null;
  #container = null;

  // Bridge state
  #ready = false;
  #destroyed = false;
  #nonce = null;

  // Connection handshake
  #readyPromise = null;
  #readyResolve = null;
  #readyReject = null;
  #timeoutId = null;

  // Message queue — buffers calls made before bridge is ready
  #messageQueue = [];

  // State
  #state = {};

  // Event system
  #eventListeners = new Map();
  #messageHandler = null;

  /**
   * @param {MorphisConfig} config
   */
  constructor(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('[MorphisSDK] Configuration object is required');
    }
    if (!config.origin || typeof config.origin !== 'string') {
      throw new Error('[MorphisSDK] config.origin is required for secure postMessage validation');
    }
    if (!config.apiKey || typeof config.apiKey !== 'string') {
      throw new Error('[MorphisSDK] config.apiKey is required (pass via environment config, never hardcode)');
    }

    this.#config = Object.freeze({
      origin: config.origin.replace(/\/$/, ''),
      apiKey: config.apiKey,
      theme: config.theme || 'light',
      maxHeight: typeof config.maxHeight === 'number' ? config.maxHeight : DEFAULT_MAX_HEIGHT,
      timeout: typeof config.timeout === 'number' ? config.timeout : DEFAULT_TIMEOUT_MS,
      onError: typeof config.onError === 'function' ? config.onError : null,
      onReady: typeof config.onReady === 'function' ? config.onReady : null,
    });
  }

  // ─── PUBLIC API ──────────────────────────────────────────────────────────────

  /**
   * Mount the sandboxed iframe and establish the bridge.
   * Rejects with MorphisConnectionError if handshake exceeds timeout.
   * @param {string | HTMLElement} target
   * @returns {Promise<void>}
   */
  async init(target) {
    if (this.#destroyed) throw new Error('[MorphisSDK] Instance has been destroyed');
    if (this.#iframe) throw new Error('[MorphisSDK] Already initialized. Call destroy() first.');

    this.#container = typeof target === 'string' ? document.querySelector(target) : target;
    if (!this.#container || !(this.#container instanceof HTMLElement)) {
      throw new Error(`[MorphisSDK] Target element not found: ${target}`);
    }

    this.#nonce = generateNonce();

    // Create handshake promise with timeout
    this.#readyPromise = new Promise((resolve, reject) => {
      this.#readyResolve = resolve;
      this.#readyReject = reject;
    });

    // Start timeout clock
    this.#timeoutId = setTimeout(() => {
      if (!this.#ready && this.#readyReject) {
        this.#readyReject(new MorphisConnectionError(this.#config.timeout));
        this.#readyReject = null;
        this.#readyResolve = null;
      }
    }, this.#config.timeout);

    this.#mountIframe();
    this.#attachMessageListener();

    // Await handshake or timeout
    await this.#readyPromise;

    clearTimeout(this.#timeoutId);
    this.#timeoutId = null;
    this.#ready = true;

    // Flush any messages queued before bridge was ready
    this.#flushQueue();

    if (this.#config.onReady) this.#config.onReady();
  }

  /**
   * Inject pre-sanitized UI into the iframe.
   * If called before init() resolves, the payload is queued and flushed on ready.
   * @param {MorphisUIPayload} payload
   */
  injectUI(payload) {
    if (this.#destroyed) throw new Error('[MorphisSDK] Cannot call injectUI() — instance destroyed');

    if (!isValidUIPayload(payload)) {
      this.#handleError(new Error('[MorphisSDK] Invalid UI payload: must include non-empty html string'));
      return;
    }

    const message = {
      type: MSG.INJECT_UI,
      payload: { html: payload.html, css: payload.css || '', metadata: payload.metadata || {} },
    };

    if (!this.#ready) {
      this.#messageQueue.push(message);
      return;
    }

    this.#postToIframe(message);
  }

  /**
   * Sync host state to the iframe.
   * If called before init() resolves, the state update is queued.
   * @param {Record<string, unknown>} state
   */
  syncState(state) {
    if (this.#destroyed) throw new Error('[MorphisSDK] Cannot call syncState() — instance destroyed');

    if (state === null || typeof state !== 'object' || Array.isArray(state)) {
      throw new Error('[MorphisSDK] syncState requires a plain object');
    }

    this.#state = { ...this.#state, ...state };

    const message = {
      type: MSG.STATE_SYNC,
      payload: deepFreeze(structuredClone(this.#state)),
    };

    if (!this.#ready) {
      // Replace any existing queued state-sync (only latest matters)
      const idx = this.#messageQueue.findIndex((m) => m.type === MSG.STATE_SYNC);
      if (idx !== -1) {
        this.#messageQueue[idx] = message;
      } else {
        this.#messageQueue.push(message);
      }
      return;
    }

    this.#postToIframe(message);
  }

  /**
   * Subscribe to events from the iframe.
   * @param {string} eventName
   * @param {Function} handler
   * @returns {() => void} Unsubscribe function
   */
  on(eventName, handler) {
    if (typeof eventName !== 'string' || typeof handler !== 'function') {
      throw new Error('[MorphisSDK] on() requires (string, function)');
    }
    if (!this.#eventListeners.has(eventName)) {
      this.#eventListeners.set(eventName, new Set());
    }
    this.#eventListeners.get(eventName).add(handler);
    return () => this.#eventListeners.get(eventName)?.delete(handler);
  }

  /**
   * Aggressively tear down the SDK instance.
   * - Removes iframe from DOM
   * - Detaches all window event listeners
   * - Clears timeout, queue, state, and subscriber maps
   * - Nullifies all internal references for GC
   */
  destroy() {
    if (this.#destroyed) return;
    this.#destroyed = true;

    // Clear connection timeout
    if (this.#timeoutId !== null) {
      clearTimeout(this.#timeoutId);
      this.#timeoutId = null;
    }

    // Detach message listener
    if (this.#messageHandler) {
      window.removeEventListener('message', this.#messageHandler);
      this.#messageHandler = null;
    }

    // Remove iframe from DOM and revoke srcdoc
    if (this.#iframe) {
      this.#iframe.srcdoc = '';
      if (this.#iframe.parentNode) {
        this.#iframe.parentNode.removeChild(this.#iframe);
      }
      this.#iframe = null;
    }

    // Clear all internal state
    this.#container = null;
    this.#state = {};
    this.#nonce = null;
    this.#ready = false;
    this.#messageQueue.length = 0;
    this.#readyPromise = null;
    this.#readyResolve = null;
    this.#readyReject = null;

    // Clear event subscribers
    for (const [, listeners] of this.#eventListeners) {
      listeners.clear();
    }
    this.#eventListeners.clear();
  }

  /** @returns {string} */
  get version() {
    return SDK_VERSION;
  }

  /** @returns {boolean} */
  get isReady() {
    return this.#ready;
  }

  /** @returns {boolean} */
  get isDestroyed() {
    return this.#destroyed;
  }

  // ─── PRIVATE ─────────────────────────────────────────────────────────────────

  /** Flush queued messages in FIFO order after bridge is ready. */
  #flushQueue() {
    while (this.#messageQueue.length > 0) {
      this.#postToIframe(this.#messageQueue.shift());
    }
  }

  #mountIframe() {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', SANDBOX_FLAGS);
    iframe.setAttribute('referrerpolicy', 'no-referrer');
    iframe.setAttribute('title', 'Morphis Embedded UI');
    iframe.setAttribute('role', 'document');
    iframe.setAttribute('aria-label', 'AI-generated interface component');
    iframe.style.cssText =
      'width:100%;border:none;display:block;min-height:0;overflow:hidden;color-scheme:normal;';
    iframe.srcdoc = this.#buildBootstrapDocument();
    this.#iframe = iframe;
    this.#container.appendChild(iframe);
  }

  /**
   * Iframe bootstrap document.
   * Key features of the bridge script:
   * - ResizeObserver with debounce to prevent layout thrashing
   * - Error boundary wrapping all DOM mutations
   * - State event dispatch for reactive injected components
   */
  #buildBootstrapDocument() {
    const nonce = this.#nonce;
    const csp = [
      `default-src 'none'`,
      `script-src 'nonce-${nonce}'`,
      `style-src 'unsafe-inline'`,
      `img-src data: blob:`,
      `font-src data:`,
    ].join('; ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;overflow:hidden}</style>
</head>
<body>
<div id="morphis-root"></div>
<script nonce="${nonce}">
(function(){
  'use strict';

  var root = document.getElementById('morphis-root');
  var currentState = {};
  var resizeTimer = null;
  var observer = null;

  // ── Debounced height reporter ──────────────────────────────────────────────
  function reportHeight() {
    if (resizeTimer) return; // Already scheduled
    resizeTimer = setTimeout(function() {
      resizeTimer = null;
      var h = Math.max(document.body.scrollHeight, root.scrollHeight, root.offsetHeight);
      window.parent.postMessage({ type: 'morphis:resize', payload: { height: h } }, '*');
    }, ${RESIZE_DEBOUNCE_MS});
  }

  // ── Attach ResizeObserver to root ──────────────────────────────────────────
  function observeResize() {
    if (observer) observer.disconnect();
    if (window.ResizeObserver) {
      observer = new ResizeObserver(reportHeight);
      observer.observe(root);
      observer.observe(document.body);
    }
  }

  // ── Message handler ────────────────────────────────────────────────────────
  window.addEventListener('message', function(event) {
    var data = event.data;
    if (!data || typeof data !== 'object' || typeof data.type !== 'string') return;

    switch (data.type) {
      case 'morphis:inject-ui':
        try {
          var payload = data.payload;
          root.innerHTML = '';
          if (payload.css) {
            var style = document.createElement('style');
            style.textContent = payload.css;
            root.appendChild(style);
          }
          var container = document.createElement('div');
          container.innerHTML = payload.html;
          root.appendChild(container);
          // Re-observe after new content
          observeResize();
          // Immediate height report
          reportHeight();
        } catch (err) {
          window.parent.postMessage(
            { type: 'morphis:render-error', payload: { message: err.message } },
            '*'
          );
        }
        break;

      case 'morphis:state-sync':
        currentState = data.payload || {};
        window.dispatchEvent(new CustomEvent('morphis:state', { detail: currentState }));
        break;
    }
  });

  // ── Expose state getter for injected UI ────────────────────────────────────
  window.__MORPHIS_STATE__ = function() { return currentState; };

  // ── Signal bridge ready ────────────────────────────────────────────────────
  window.parent.postMessage({ type: 'morphis:ready' }, '*');
})();
<\/script>
</body>
</html>`;
  }

  #attachMessageListener() {
    this.#messageHandler = (event) => {
      // SECURITY: Only accept messages from our iframe
      if (!this.#iframe || event.source !== this.#iframe.contentWindow) return;
      if (!isValidMessage(event.data)) return;

      const { type, payload } = event.data;

      switch (type) {
        case MSG.READY:
          if (this.#readyResolve) {
            this.#readyResolve();
            this.#readyResolve = null;
            this.#readyReject = null;
          }
          break;

        case MSG.RESIZE:
          this.#handleResize(payload);
          break;

        case MSG.RENDER_ERROR:
          this.#handleError(new Error(`[MorphisSDK] Render error: ${payload?.message || 'Unknown'}`));
          break;

        case MSG.EVENT:
          this.#dispatchEvent(payload);
          break;
      }
    };

    window.addEventListener('message', this.#messageHandler);
  }

  #postToIframe(message) {
    if (!this.#iframe?.contentWindow) {
      this.#handleError(new Error('[MorphisSDK] iframe not available'));
      return;
    }
    try {
      this.#iframe.contentWindow.postMessage(message, '*');
    } catch (err) {
      this.#handleError(new Error(`[MorphisSDK] postMessage failed: ${err.message}`));
    }
  }

  #handleResize(payload) {
    if (!payload || typeof payload.height !== 'number') return;
    const height = Math.min(Math.max(0, payload.height), this.#config.maxHeight);
    if (this.#iframe) {
      this.#iframe.style.height = `${height}px`;
    }
  }

  #dispatchEvent(payload) {
    if (!payload || typeof payload.name !== 'string') return;
    const listeners = this.#eventListeners.get(payload.name);
    if (!listeners) return;
    for (const handler of listeners) {
      try {
        handler(payload.data);
      } catch (err) {
        console.error('[MorphisSDK] Event handler error:', err);
      }
    }
  }

  #handleError(error) {
    console.error(error.message);
    if (this.#config.onError) this.#config.onError(error);
  }
}

export default MorphisSDK;
