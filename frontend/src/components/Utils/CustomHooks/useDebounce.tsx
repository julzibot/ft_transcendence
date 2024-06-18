import { useState, useEffect } from "react"

export default function useDebounce (value: any, delay: number) {
  const [debounceValue, setDebounceValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceValue(value)
    }, delay);
    return () => {
      clearTimeout(handler);
    }
  }, [value])

  return debounceValue
}