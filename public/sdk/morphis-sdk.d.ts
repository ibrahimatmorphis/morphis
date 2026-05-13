/**
 * MorphisSDK v2.1.0 — TypeScript Declarations
 * @module morphis-sdk
 */

/** Configuration object passed to the MorphisSDK constructor. */
export interface MorphisConfig {
  /** Trusted origin for postMessage security validation (e.g., 'https://app.getmorphis.com'). */
  origin: string;

  /** API key — must be passed via environment config, never hardcoded. */
  apiKey: string;

  /** UI theme preference. Defaults to 'light'. */
  theme?: 'light' | 'dark';

  /** Maximum iframe height in pixels. Prevents malicious content expansion. Defaults to 2000. */
  maxHeight?: number;

  /** Connection timeout in milliseconds. Defaults to 5000. */
  timeout?: number;

  /** Global error handler invoked on bridge/render failures. */
  onError?: (error: Error) => void;

  /** Callback fired when the iframe bridge handshake completes. */
  onReady?: () => void;
}

/** Payload structure for injecting UI into the sandboxed iframe. */
export interface MorphisUIPayload {
  /** Pre-sanitized HTML content (AST-validated by backend). */
  html: string;

  /** Optional scoped CSS styles for the injected component. */
  css?: string;

  /** Optional metadata from the backend generation pipeline. */
  metadata?: Record<string, unknown>;
}

/** JSON-serializable state object synchronized between host and iframe. */
export type MorphisState = Record<string, unknown>;

/** Event payload dispatched from iframe to host. */
export interface MorphisEvent<T = unknown> {
  /** Event name identifier. */
  name: string;

  /** Arbitrary event data. */
  data: T;
}

/** Unsubscribe function returned by `sdk.on()`. */
export type MorphisUnsubscribe = () => void;

/**
 * Thrown when the iframe bridge fails to establish within the configured timeout.
 */
export declare class MorphisConnectionError extends Error {
  readonly name: 'MorphisConnectionError';
  readonly timeoutMs: number;
  constructor(timeoutMs: number);
}

/**
 * MorphisSDK — Secure embedded AI-native UI engine.
 *
 * Lifecycle: `new MorphisSDK(config)` → `init(target)` → `injectUI()` / `syncState()` → `destroy()`
 *
 * @example
 * ```ts
 * import { MorphisSDK } from 'morphis-sdk';
 *
 * const sdk = new MorphisSDK({
 *   origin: 'https://app.getmorphis.com',
 *   apiKey: process.env.MORPHIS_API_KEY!,
 * });
 *
 * await sdk.init('#container');
 * sdk.injectUI({ html: '<div>Hello</div>' });
 * sdk.syncState({ user: { plan: 'pro' } });
 * sdk.destroy();
 * ```
 */
export declare class MorphisSDK {
  /** SDK version string. */
  readonly version: string;

  /** Whether the iframe bridge handshake has completed. */
  readonly isReady: boolean;

  /** Whether destroy() has been called. */
  readonly isDestroyed: boolean;

  constructor(config: MorphisConfig);

  /**
   * Mount the sandboxed iframe into the target container and establish the bridge.
   * Resolves when the iframe signals readiness.
   * Rejects with `MorphisConnectionError` if the handshake exceeds the configured timeout.
   *
   * @param target - CSS selector string or HTMLElement reference.
   * @throws {MorphisConnectionError} If bridge handshake times out.
   * @throws {Error} If target element is not found or SDK is already initialized.
   */
  init(target: string | HTMLElement): Promise<void>;

  /**
   * Inject pre-sanitized UI content into the sandboxed iframe.
   * If called before `init()` resolves, the payload is buffered and flushed on ready.
   *
   * @param payload - UI payload with html, optional css, and optional metadata.
   */
  injectUI(payload: MorphisUIPayload): void;

  /**
   * Synchronize state from the host application to the iframe.
   * Merges with existing state (shallow merge at top level).
   * If called before `init()` resolves, the state is buffered (latest wins).
   *
   * @param state - JSON-serializable plain object.
   */
  syncState(state: MorphisState): void;

  /**
   * Subscribe to custom events emitted from the iframe content.
   *
   * @param eventName - Event name to listen for.
   * @param handler - Callback receiving the event data.
   * @returns Unsubscribe function.
   */
  on<T = unknown>(eventName: string, handler: (data: T) => void): MorphisUnsubscribe;

  /**
   * Tear down the SDK instance.
   * Removes the iframe, detaches all listeners, clears queues and state.
   * Safe to call multiple times (idempotent).
   */
  destroy(): void;
}

export default MorphisSDK;
