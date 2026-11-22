import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import DecorationContent from './DecorationContent.jsx'
import { decorationStyle } from './decorationStyle.js'

function Placed({ decoration, box }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const node = ref.current
    if (!node || !box.height) return
    const place = () => {
      const top = (decoration.y * box.width) / 100
      node.style.top = `${Math.max(0, Math.min(top, box.height - node.offsetHeight))}px`
    }
    place()
    const observer = new ResizeObserver(place)
    observer.observe(node)
    return () => observer.disconnect()
  }, [decoration.y, box.width, box.height])

  return (
    <span ref={ref} style={decorationStyle(decoration)}>
      <DecorationContent decoration={decoration} />
    </span>
  )
}

export default function DecorationLayer({ decorations = [] }) {
  const [box, setBox] = useState({ width: 0, height: 0 })
  const observer = useRef(null)
  const ref = useCallback((node) => {
    observer.current?.disconnect()
    if (!node) return
    observer.current = new ResizeObserver(([entry]) => setBox({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.current.observe(node)
  }, [])

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {decorations.map((decoration, index) => (
        <Placed key={index} decoration={decoration} box={box} />
      ))}
    </div>
  )
}
