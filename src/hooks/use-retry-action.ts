'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'

const DEFAULT_TIMEOUT_MS = 10_000
const MAX_RETRIES = 3

interface UseRetryActionOptions {
  /** Timeout in milliseconds before the request is considered failed. Defaults to 10000 (10s). */
  timeoutMs?: number
  /** Maximum number of retry attempts. Defaults to 3. */
  maxRetries?: number
  /** Custom timeout error message shown in the toast. */
  timeoutMessage?: string
  /** Custom error message shown in the toast on non-timeout failures. */
  errorMessage?: string
}

interface UseRetryActionReturn<T> {
  /** Execute the action with timeout and retry logic. */
  execute: () => Promise<T | null>
  /** Retry the last failed action. Only available after a failure. */
  retry: () => Promise<T | null>
  /** Whether the action is currently in progress. */
  isLoading: boolean
  /** The current retry attempt count (0 = first attempt, 1 = first retry, etc.). */
  retryCount: number
  /** Whether retries are exhausted (retryCount >= maxRetries). */
  retriesExhausted: boolean
  /** Reset the retry counter back to 0. */
  reset: () => void
}

/**
 * A React hook that wraps an async action with:
 * - A 10-second network timeout (configurable)
 * - Automatic toast error on timeout
 * - A retry mechanism limited to 3 attempts (configurable)
 *
 * Usage:
 * ```tsx
 * const { execute, retry, isLoading, retryCount, retriesExhausted } = useRetryAction(
 *   () => someServerAction(),
 *   { timeoutMessage: 'Request timed out. Please try again.' }
 * )
 * ```
 */
export function useRetryAction<T>(
  action: () => Promise<T>,
  options: UseRetryActionOptions = {}
): UseRetryActionReturn<T> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRetries = MAX_RETRIES,
    timeoutMessage = 'Request timed out. Please check your connection and try again.',
    errorMessage = 'An unexpected error occurred. Please try again.',
  } = options

  const [isLoading, setIsLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const actionRef = useRef(action)
  actionRef.current = action

  const retriesExhausted = retryCount >= maxRetries

  const executeWithTimeout = useCallback(async (): Promise<T | null> => {
    if (retriesExhausted) {
      toast.error('Maximum retry attempts reached. Please try again later.')
      return null
    }

    setIsLoading(true)

    try {
      const result = await Promise.race([
        actionRef.current(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
        }),
      ])

      // Reset retry count on success
      setRetryCount(0)
      return result
    } catch (err) {
      if (err instanceof Error && err.message === 'TIMEOUT') {
        toast.error(timeoutMessage, {
          description: retryCount < maxRetries - 1
            ? `Attempt ${retryCount + 1} of ${maxRetries}. You can retry.`
            : 'Maximum retry attempts reached.',
        })
      } else {
        toast.error(errorMessage)
      }
      setRetryCount((prev) => prev + 1)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [retriesExhausted, timeoutMs, timeoutMessage, errorMessage, retryCount, maxRetries])

  const retry = useCallback(async (): Promise<T | null> => {
    return executeWithTimeout()
  }, [executeWithTimeout])

  const reset = useCallback(() => {
    setRetryCount(0)
  }, [])

  return {
    execute: executeWithTimeout,
    retry,
    isLoading,
    retryCount,
    retriesExhausted,
    reset,
  }
}
