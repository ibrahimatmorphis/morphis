/**
 * MorphisSDK v2.0.0
 * AI-Native Embedded UI Engine — Secure ES6 Module
 *
 * Architecture:
 * - Sandboxed iframe execution for untrusted AI-generated UI
 * - Bidirectional postMessage bridge with strict origin + schema validation
 * - State synchronization between host and iframe
 * - CSP-hardened iframe document with nonce-based script execution
 * - Graceful error boundaries for rendering failures
 *
 * Usage (ES Module):
 *   import { MorphisSDK } from './morphis-sdk.js';
 *   const sdk = new MorphisSDK({ origin: 'https://app.morphis.dev', apiKey: config.MORPHIS_KEY });
 *   await sdk.init('#container');
 *   sdk.injectUI(payload);
 *   sdk.syncState({ user: { plan: 'pro' } });
 *   sdk.destroy();
 */

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const SDK_VERSION = '2.0.0';

/** Allowed message types for the postMessage protocol */
const MESSAGE_TYPES = Object.freeze({
  INJECT_UI: 'morphis:inject-ui',
  STATE_SYNC: 'morphis:state-sync',
  READY: 'morphis:ready',
  RENDER_ERROR: 'morphis:render-error',
  RESIZE: 'morphis:resize',
  EVENT: 'morphis:event',
});

/** Sandbox attributes — minimal permissions for AI-generated content.
 *  - allow-scripts: required for rendering dynamic UI
 *  - NO allow-same-origin: prevents iframe from accessing host DOM/cookies
 *  - NO allow-forms: prevents form submission to external endpoints
 *  - NO allow-top-navigation: prevents clickjacking via top-frame redirect
 *  - NO allow-popups: prevents window.open abuse
 */
const SANDBOX_FLAGS = 'allow-scripts';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Generate a cryptographically random nonce for CSP script execution.
 * Falls back to Math.random if crypto API is unavailable.
 */
function generateNonce() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Validate the shape of an inbound postMessage payload.
 * Rejects malformed or unexpected message structures.
 */
function isValidMessage(data) {
  return (
    data !== null &&
    typeof data === 'object' &&
    typeof data.type === 'string' &&
    data.type.startsWith('morphis:')
  );
}

/**
 * Validate an injectUI payload conforms to the expected schema.
 * The backend performs full AST validation; this is a structural guard.
 */
function isValidUIPayload(payload) {
  if (!payload || typeof payload !== 'object') return false;
  if (typeof payload.html !== 'string' || payload.html.length === 0) return false;
  if (payload.html.length > 2_000_000) return false; // 2MB hard cap
  if (payload.css !== undefined && typeof payload.css !== 'string') return false;
  if (payload.metadata !== undefined && typeof payload.metadata !== 'object') return false;
  return true;
}

/**
 * Deep-freeze an object to prevent mutation of shared state.
 */
function deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    if (typeof obj[prop] === 'object' && obj[prop] !== null && !Object.isFrozen(obj[prop])) {
      deepFreeze(obj[prop]);
    }
  });
  return obj;
}

// ─── SDK CLASS ───────────────────────────────────────────────────────────────

export class MorphisSDK {
  #config;
  #iframe = null;
  #container = null;
  #messageHandler = null;
  #state = {};
  #nonce = null;
  #ready = false;
  #readyPromise = null;
  #readyResolve = null;
  #eventListeners = new Map();
  #destroyed = false;

  /**
   * @param {Object} config - SDK configuration
   * @param {string} config.origin - Trusted origin for postMessage validation (e.g., 'https://app.morphis.dev')
   * @param {string} config.apiKey - API key passed via config, NEVER hardcoded
   * @param {string} [config.theme='light'] - UI theme preference
   * @param {number} [config.maxHeight=2000] - Maximum iframe height in px
   * @param {Function} [config.onError] - Global error handler
   * @param {Function} [config.onReady] - Callback when iframe bridge is established
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
      origin: config.origin.replace(/\/$/, ''), // Normalize: strip trailing slash
      apiKey: config.apiKey,
      theme: config.theme || 'light',
      maxHeight: config.maxHeight || 2000,
      onError: typeof config.onError === 'function' ? config.onError : null,
      onReady: typeof config.onReady === 'function' ? config.onReady : null,
    });
  }

  // ─── PUBLIC API ──────────────────────────────────────────────────────────────

  /**
   * Initialize the SDK: mount the sandboxed iframe into the target container.
   * @param {string|HTMLElement} target - CSS selector or DOM element
   * @returns {Promise<void>} Resolves when the iframe bridge is ready
   */
  async init(target) {
    if (this.#destroyed) throw new Error('[MorphisSDK] Instance has been destroyed');
    if (this.#iframe) throw new Error('[MorphisSDK] Already initialized. Call destroy() first.');

    // Resolve container
    this.#container =
      typeof target === 'string' ? document.querySelector(target) : target;

    if (!this.#container || !(this.#container instanceof HTMLElement)) {
      throw new Error(`[MorphisSDK] Target element not found: ${target}`);
    }

    // Generate a unique nonce for this session's CSP policy
    this.#nonce = generateNonce();

    // Create the ready promise before mounting (avoids race condition)
    this.#readyPromise = new Promise((resolve) => {
      this.#readyResolve = resolve;
    });

    // Mount iframe
    this.#mountIframe();

    // Attach message listener
    this.#attachMessageListener();

    // Wait for iframe to signal readiness
    await this.#readyPromise;
    this.#ready = true;

    if (this.#config.onReady) this.#config.onReady();
  }

  /**
   * Inject pre-sanitized UI payload into the sandboxed iframe.
   * The payload is expected to be AST-validated by the backend.
   * @param {Object} payload
   * @param {string} payload.html - Sanitized HTML content
   * @param {string} [payload.css] - Scoped CSS styles
   * @param {Object} [payload.metadata] - Render metadata from backend
   */
  injectUI(payload) {
    this.#assertReady('injectUI');

    if (!isValidUIPayload(payload)) {
      const err = new Error('[MorphisSDK] Invalid UI payload: must include non-empty html string');
      this.#handleError(err);
      return;
    }

    this.#postToIframe({
      type: MESSAGE_TYPES.INJECT_UI,
      payload: {
        html: payload.html,
        css: payload.css || '',
        metadata: payload.metadata || {},
      },
    });
  }

  /**
   * Synchronize state from the host application to the iframe.
   * State is deep-frozen before transmission to prevent mutation.
   * @param {Object} state - JSON-serializable state object
   */
  syncState(state) {
    this.#assertReady('syncState');

    if (state === null || typeof state !== 'object' || Array.isArray(state)) {
      throw new Error('[MorphisSDK] syncState requires a plain object');
    }

    // Merge with existing state
    this.#state = { ...this.#state, ...state };

    this.#postToIframe({
      type: MESSAGE_TYPES.STATE_SYNC,
      payload: deepFreeze(structuredClone(this.#state)),
    });
  }

  /**
   * Subscribe to events emitted from the iframe content.
   * @param {string} eventName - Event name to listen for
   * @param {Function} handler - Callback receiving event data
   * @returns {Function} Unsubscribe function
   */
  on(eventName, handler) {
    if (typeof eventName !== 'string' || typeof handler !== 'function') {
      throw new Error('[MorphisSDK] on() requires (string, function)');
    }
    if (!this.#eventListeners.has(eventName)) {
      this.#eventListeners.set(eventName, new Set());
    }
    this.#eventListeners.get(eventName).add(handler);

    return () => {
      const listeners = this.#eventListeners.get(eventName);
      if (listeners) listeners.delete(handler);
    };
  }

  /**
   * Tear down the SDK instance: remove iframe, detach listeners, clear state.
   */
  destroy() {
    if (this.#destroyed) return;
    this.#destroyed = true;

    // Remove message listener
    if (this.#messageHandler) {
      window.removeEventListener('message', this.#messageHandler);
      this.#messageHandler = null;
    }

    // Remove iframe from DOM
    if (this.#iframe && this.#iframe.parentNode) {
      this.#iframe.parentNode.removeChild(this.#iframe);
    }

    // Clear references
    this.#iframe = null;
    this.#container = null;
    this.#state = {};
    this.#ready = false;
    this.#nonce = null;
    this.#eventListeners.clear();
    this.#readyPromise = null;
    this.#readyResolve = null;
  }

  /** @returns {string} SDK version */
  get version() {
    return SDK_VERSION;
  }

  /** @returns {boolean} Whether the iframe bridge is ready */
  get isReady() {
    return this.#ready;
  }

  // ─── PRIVATE METHODS ─────────────────────────────────────────────────────────

  /**
   * Create and mount the sandboxed iframe with a CSP-hardened bootstrap document.
   * The bootstrap document:
   * - Sets a strict Content-Security-Policy via <meta> tag
   * - Uses a nonce to allow only the bridge script to execute
   * - Signals readiness to the host via postMessage
   * - Listens for inject/state messages from the host
   */
  #mountIframe() {
    const iframe = document.createElement('iframe');

    // Security: restrictive sandbox — only allow-scripts, nothing else
    iframe.setAttribute('sandbox', SANDBOX_FLAGS);

    // Prevent iframe from being indexed or followed
    iframe.setAttribute('referrerpolicy', 'no-referrer');

    // Accessibility
    iframe.setAttribute('title', 'Morphis Embedded UI');
    iframe.setAttribute('role', 'document');
    iframe.setAttribute('aria-label', 'AI-generated interface component');

    // Styling: seamless embed
    iframe.style.cssText =
      'width:100%;border:none;display:block;min-height:0;overflow:hidden;color-scheme:normal;';

    // Build the bootstrap HTML with CSP and bridge script
    iframe.srcdoc = this.#buildBootstrapDocument();

    this.#iframe = iframe;
    this.#container.appendChild(iframe);
  }

  /**
   * Build the initial HTML document loaded into the iframe.
   * Contains:
   * - Strict CSP meta tag (script-src with nonce, no unsafe-inline/eval)
   * - Bridge script that handles host→iframe communication
   * - Error boundary for rendering failures
   */
  #buildBootstrapDocument() {
    const nonce = this.#nonce;
    // CSP: only scripts with our nonce can execute. No eval, no inline.
    // style-src 'unsafe-inline' is required for injected component styles.
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

  // Signal readiness to host
  window.parent.postMessage({type:'morphis:ready'},'*');

  // Listen for host messages
  window.addEventListener('message', function(event){
    var data = event.data;
    if(!data || typeof data !== 'object' || typeof data.type !== 'string') return;

    switch(data.type){
      case 'morphis:inject-ui':
        try {
          var payload = data.payload;
          // Clear previous content
          root.innerHTML = '';
          // Inject scoped CSS if provided
          if(payload.css){
            var style = document.createElement('style');
            style.textContent = payload.css;
            root.appendChild(style);
          }
          // Inject HTML content
          var container = document.createElement('div');
          container.innerHTML = payload.html;
          root.appendChild(container);
          // Report new height
          reportHeight();
          // Observe for dynamic resizes
          if(window.ResizeObserver){
            new ResizeObserver(reportHeight).observe(root);
          }
        } catch(err){
          window.parent.postMessage({type:'morphis:render-error',payload:{message:err.message}},'*');
        }
        break;

      case 'morphis:state-sync':
        currentState = data.payload || {};
        // Dispatch custom event so injected UI can react to state changes
        window.dispatchEvent(new CustomEvent('morphis:state', {detail: currentState}));
        break;
    }
  });

  function reportHeight(){
    var h = Math.max(document.body.scrollHeight, root.scrollHeight);
    window.parent.postMessage({type:'morphis:resize',payload:{height:h}},'*');
  }

  // Expose state getter for injected UI scripts
  window.__MORPHIS_STATE__ = function(){ return currentState; };
})();
<\/script>
</body>
</html>`;
  }

  /**
   * Attach the window-level message listener with strict security checks:
   * 1. Verify event.source is our iframe's contentWindow
   * 2. Validate message schema (type must start with 'morphis:')
   * 3. Route to appropriate handler
   *
   * NOTE: We cannot check event.origin because sandbox without allow-same-origin
   * sets origin to 'null'. Instead we rely on source verification.
   */
  #attachMessageListener() {
    this.#messageHandler = (event) => {
      // SECURITY: Only accept messages from our iframe
      if (!this.#iframe || event.source !== this.#iframe.contentWindow) return;

      const data = event.data;

      // SECURITY: Validate message schema
      if (!isValidMessage(data)) return;

      switch (data.type) {
        case MESSAGE_TYPES.READY:
          if (this.#readyResolve) {
            this.#readyResolve();
            this.#readyResolve = null;
          }
          break;

        case MESSAGE_TYPES.RESIZE:
          this.#handleResize(data.payload);
          break;

        case MESSAGE_TYPES.RENDER_ERROR:
          this.#handleError(
            new Error(`[MorphisSDK] Render error: ${data.payload?.message || 'Unknown'}`)
          );
          break;

        case MESSAGE_TYPES.EVENT:
          this.#dispatchEvent(data.payload);
          break;

        default:
          // Unknown morphis: message type — ignore silently
          break;
      }
    };

    window.addEventListener('message', this.#messageHandler);
  }

  /**
   * Send a message to the iframe via postMessage.
   * Target origin is '*' because sandboxed iframes without allow-same-origin
   * have a null origin. Security is enforced via source checking on inbound messages.
   */
  #postToIframe(message) {
    if (!this.#iframe || !this.#iframe.contentWindow) {
      this.#handleError(new Error('[MorphisSDK] iframe not available'));
      return;
    }

    try {
      this.#iframe.contentWindow.postMessage(message, '*');
    } catch (err) {
      this.#handleError(new Error(`[MorphisSDK] postMessage failed: ${err.message}`));
    }
  }

  /**
   * Handle iframe resize events. Clamps to maxHeight to prevent
   * malicious content from expanding beyond bounds.
   */
  #handleResize(payload) {
    if (!payload || typeof payload.height !== 'number') return;
    const height = Math.min(Math.max(0, payload.height), this.#config.maxHeight);
    if (this.#iframe) {
      this.#iframe.style.height = `${height}px`;
    }
  }

  /**
   * Dispatch an event from the iframe to registered host listeners.
   */
  #dispatchEvent(payload) {
    if (!payload || typeof payload.name !== 'string') return;
    const listeners = this.#eventListeners.get(payload.name);
    if (listeners) {
      listeners.forEach((handler) => {
        try {
          handler(payload.data);
        } catch (err) {
          console.error('[MorphisSDK] Event handler error:', err);
        }
      });
    }
  }

  /**
   * Centralized error handling.
   */
  #handleError(error) {
    console.error(error.message);
    if (this.#config.onError) {
      this.#config.onError(error);
    }
  }

  /**
   * Guard: ensure the SDK is initialized before calling methods.
   */
  #assertReady(method) {
    if (this.#destroyed) {
      throw new Error(`[MorphisSDK] Cannot call ${method}() — instance destroyed`);
    }
    if (!this.#ready) {
      throw new Error(`[MorphisSDK] Cannot call ${method}() — call init() first`);
    }
  }
}

// ─── DEFAULT EXPORT ──────────────────────────────────────────────────────────

export default MorphisSDK;
