import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function OwnPiecesCarousel({ pieces, value, onChange }) {
  const track = useRef(null)
  const [more, setMore] = useState(false)

  const measure = useCallback(() => {
    const node = track.current
    if (node) setMore(node.scrollLeft + node.clientWidth < node.scrollWidth - 4)
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure, pieces.length])

  return (
    <div className="flex items-center gap-1.5">
      <ul
        ref={track}
        role="radiogroup"
        aria-label="Your pieces"
        onScroll={measure}
        className="no-scrollbar -my-2 flex min-w-0 flex-1 snap-x gap-3.5 overflow-x-auto px-0.5 py-2"
      >
        {pieces.map((piece) => {
          const selected = piece.id === value
          return (
            <li key={piece.id} className="snap-start">
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(piece.id)}
                className={cn(
                  'press flex w-[116px] flex-col overflow-hidden rounded-[18px] bg-paper text-left shadow-raised ring-2 transition-shadow duration-220 ease-ui md:w-[134px]',
                  selected ? 'ring-accent' : 'ring-transparent',
                )}
              >
                <span className="block aspect-[134/160] bg-plate">
                  {piece.images?.[0] && <img src={piece.images[0].url} alt="" className="size-full object-cover" />}
                </span>
                <span className="flex items-center gap-1.5 px-2.5 pt-2 pb-2.5">
                  {selected && <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />}
                  <span className="truncate text-xs font-semibold text-ink">{piece.name}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {more && (
        <button
          type="button"
          aria-label="Next pieces"
          onClick={() => track.current?.scrollBy({ left: track.current.clientWidth * 0.8, behavior: 'smooth' })}
          className="grid h-11 w-8 shrink-0 place-items-center text-accent/60 transition-[color,transform] duration-220 ease-ui hover:translate-x-[3px] hover:text-accent active:scale-[0.88] active:text-accent"
        >
          <ChevronRight className="size-[22px]" strokeWidth={2} />
        </button>
      )}
    </div>
  )
}
