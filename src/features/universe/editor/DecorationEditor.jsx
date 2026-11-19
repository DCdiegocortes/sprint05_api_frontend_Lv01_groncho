import { useRef } from 'react'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import DecorationContent from '../DecorationContent.jsx'
import { decorationStyle } from '../decorationStyle.js'

const round = (value) => Math.round(value * 10) / 10

export default function DecorationEditor({ decorations, selected, onSelect, onChange, onRemove }) {
  const layer = useRef(null)
  const drag = useRef(null)

  const start = (event, index) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    onSelect(index)
    drag.current = { index, x: event.clientX, y: event.clientY, origin: decorations[index] }
  }

  const move = (event) => {
    if (!drag.current) return
    const width = layer.current.getBoundingClientRect().width
    const { index, x, y, origin } = drag.current
    const nextX = Math.min(100, Math.max(0, origin.x + ((event.clientX - x) / width) * 100))
    const nextY = Math.max(0, origin.y + ((event.clientY - y) / width) * 100)
    onChange(index, { x: round(nextX), y: round(nextY) })
  }

  const end = () => {
    drag.current = null
  }

  const current = selected !== null ? decorations[selected] : null

  return (
    <>
      <div ref={layer} className="absolute inset-0" onPointerDown={(event) => event.target === layer.current && onSelect(null)}>
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
              'cursor-grab touch-none rounded-md select-none active:cursor-grabbing',
              selected === index && 'outline-2 outline-offset-4 outline-accent outline-dashed',
            )}
          >
            <DecorationContent decoration={decoration} />
          </span>
        ))}
      </div>
      {current && (
        <div className="sticky bottom-[120px] z-20 mt-3 flex items-center gap-3 rounded-full bg-card px-4 py-2.5 shadow-float">
          <span className="label-mono text-[8.5px]">Size</span>
          <input
            type="range"
            aria-label="Decoration size"
            min={1}
            max={100}
            value={current.size}
            onChange={(event) => onChange(selected, { size: Number(event.target.value) })}
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
