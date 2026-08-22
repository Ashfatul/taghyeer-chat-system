import { useState, useEffect } from "react";

/**
 * Custom hook to debounce rapid value changes (such as search input keystrokes).
 * Delays updating the debounced value until the specified delay has passed
 * without new changes, preventing excess network requests and re-renders.
 *
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds (default: 300ms).
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
