import { useState, useCallback } from 'react'

/**
 * Debounces a callback function by the specified delay.
 * Useful for preventing excessive updates from rapid input changes.
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      const newTimeoutId = setTimeout(() => callback(...args), delay)
      setTimeoutId(newTimeoutId)
    },
    [callback, delay, timeoutId]
  ) as T
}