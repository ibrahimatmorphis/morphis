/**
 * Wraps an async function with a timeout and retry mechanism.
 *
 * - Applies a 10-second timeout (configurable) using Promise.race
 * - On timeout or failure, retries up to 3 times (configurable)
 * - Returns the result on success, or throws after all retries are exhausted
 *
 * This is a standalone utility (not a React hook) suitable for use in
 * server actions, API routes, or non-component code.
 */

const DEFAULT_TIMEOUT_MS = 10_000
const DEFAULT_MAX_RETRIES = 3

export class TimeoutError extends Error {
  constructor(message = 'Request timed out') {
    super(message)
    this.name = 'TimeoutError'
  }
}

export class RetriesExhaustedError extends Error {
  public readonly attempts: number
  public readonly lastError: Error

  constructor(attempts: number, lastError: Error) {
    super(`All ${attempts} retry attempts exhausted. Last error: ${lastError.message}`)
    this.name = 'RetriesExhaustedError'
    this.attempts = attempts
    this.lastError = lastError
  }
}

interface FetchWithRetryOptions {
  /** Timeout in milliseconds. Defaults to 10000 (10s). */
  timeoutMs?: number
  /** Maximum number of total attempts (initial + retries). Defaults to 3. */
  maxRetries?: number
  /** Optional callback invoked before each retry with the attempt number (1-indexed). */
  onRetry?: (attempt: number, error: Error) => void
}

/**
 * Execute an async function with timeout and retry logic.
 *
 * @param fn - The async function to execute
 * @param options - Configuration for timeout and retries
 * @returns The result of the async function
 * @throws {RetriesExhaustedError} When all retry attempts fail
 *
 * @example
 * ```ts
 * import { fetchWithRetry, TimeoutError } from '@/lib/fetch-with-retry'
 *
 * const data = await fetchWithRetry(
 *   () => fetch('/api/data').then(r => r.json()),
 *   { timeoutMs: 10000, maxRetries: 3 }
 * )
 * ```
 */
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  options: FetchWithRetryOptions = {}
): Promise<T> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRetries = DEFAULT_MAX_RETRIES,
    onRetry,
  } = options

  let lastError: Error = new Error('Unknown error')

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new TimeoutError()), timeoutMs)
        }),
      ])
      return result
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))

      if (attempt < maxRetries) {
        onRetry?.(attempt, lastError)
      }
    }
  }

  throw new RetriesExhaustedError(maxRetries, lastError)
}
