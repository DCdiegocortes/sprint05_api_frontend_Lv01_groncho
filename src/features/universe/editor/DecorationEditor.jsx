import { useRef } from 'react'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import DecorationContent from '../DecorationContent.jsx'
import { decorationStyle } from '../decorationStyle.js'

const round = (value) => Math.round(value * 10) / 10
const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max))

export default function DecorationEditor({ decorations, selected, onSelect, onChange, onRemove }) {
  const layer = useRef(null)
  const drag = useRef(null)

  const start = (event, index) => {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    onSelect(index)
    const box = layer.current.getBoundingClientRect()
    const item = event.currentTarget.getBoundingClientRect()
    drag.current = {
      index,
      x: event.clientX,
      y: event.clientY,
      origin: decorations[index],
      maxX: ((box.width - item.width) / box.width) * 100,
      maxY: ((box.height - item.height) / box.width) * 100,
      width: box.width,
    }
  }

  const move = (event) => {
    if (!drag.current) return
    const { index, x, y, origin, maxX, maxY, width } = drag.current
    const nextX = clamp(origin.x + ((event.clientX - x) / width) * 100, 0, maxX)
    const nextY = clamp(origin.y + ((event.clientY - y) / width) * 100, 0, maxY)
    onChange(index, { x: round(nextX), y: round(nextY) })
  }

  const end = () => {
    drag.current = null
  }

  const resize = (size) => {
    const box = layer.current.getBoundingClientRect()
    const current = decorations[selected]
    const room = Math.max(4, 100 - current.x)
    const tallest = ((box.height / box.width) * 100 - current.y) * 2
    onChange(selected, { size: Math.min(size, room, Math.max(4, tallest)) })
  }

  const current = selected !== null ? decorations[selected] : null

  return (
    <>
      <div ref={layer} className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        {decorations.map((decoration, index) => (
          <span
            key={index}
            role="button"
            tabIndex={0}
            aria-label={`Decoration ${index + 1}`}
            onPointerDown={(event) => start(event, index)}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            style={decorationStyle(decoration)}
            className={cn(
              'pointer-events-auto cursor-grab touch-none rounded-md select-none active:cursor-grabbing',
              selected === index && 'outline-2 outline-offset-4 outline-accent outline-dashed',
            )}
          >
            <DecorationContent decoration={decoration} />
          </span>
        ))}
      </div>
      {current && (
        <div className="absolute inset-x-3 bottom-3 z-20 flex items-center gap-3 rounded-full bg-card/95 px-4 py-2.5 shadow-float">
          <span className="label-mono text-[8.5px]">Size</span>
          <input
            type="range"
            aria-label="Decoration size"
            min={4}
            max={60}
            value={current.size}
            onChange={(event) => resize(Number(event.target.value))}
            className="flex-1 accent-[var(--color-accent)]"
          />
          <button
            type="button"
            aria-label="Remove decoration"
            onClick={() => onRemove(selected)}
            className="press grid size-9 place-items-center rounded-full bg-paper text-ink shadow-subtle"
          >
            <Trash2 className="size-4" strokeWidth={1.6} />
          </button>
        </div>
      )}
    </>
  )
}
