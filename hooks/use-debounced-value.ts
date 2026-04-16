import { useState, useEffect } from "react";

/**
 * Custom hook that debounces a value by the specified delay.
 *
 * Useful for search inputs — instead of triggering an API call on every
 * keystroke, the returned value only updates after the user has stopped
 * typing for `delay` milliseconds. This dramatically reduces the number
 * of network requests sent to the backend.
 *
 * @param value  The raw value to debounce (e.g. the current search input string).
 * @param delay  How long (ms) to wait after the last change before updating.
 *               Defaults to 500ms which feels responsive without spamming.
 * @returns      The debounced version of `value`.
 */
export function useDebouncedValue<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the delay
    const timer = setTimeout(() => setDebouncedValue(value), delay);

    // If value changes before the delay completes, clear the previous timer
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
