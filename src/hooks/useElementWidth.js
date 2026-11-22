import { useCallback, useState } from 'react'

export function useElementWidth() {
  const [width, setWidth] = useState(0)
  const ref = useCallback((node) => {
    if (!node) return
    setWidth(node.getBoundingClientRect().width)
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(node)
  }, [])

  return [ref, width]
}
