import { Link } from 'react-router'
import { cn } from '@/lib/utils'
import { isLocked, offerLabel } from './pieces.js'

export default function PieceCard({ piece }) {
  const cover = piece.images?.[0]?.url
  const locked = isLocked(piece)

  return (
    <Link to={`/closet/${piece.id}`} className="press group flex flex-col overflow-hidden rounded-[20px] bg-paper shadow-raised">
      <span className="relative block aspect-[190/214] overflow-hidden bg-plate">
        {cover && (
          <img
            src={cover}
            alt=""
            className={cn('size-full object-cover transition-transform duration-300 ease-ui group-hover:scale-[1.03]', locked && 'opacity-55')}
          />
        )}
        {locked && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-1.5 shadow-subtle">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            <span className="font-mono text-[10px] font-medium tracking-[0.12em] text-ink uppercase">In a trade</span>
          </span>
        )}
      </span>
      <span className="flex flex-col items-start gap-2 p-3">
        <span className="line-clamp-1 text-[13px] font-semibold tracking-[-0.01em] text-ink">{piece.name}</span>
        <span className="rounded-[4px] bg-ink/[0.06] px-2 py-[3px] font-mono text-[10px] font-medium tracking-[0.12em] text-secondary uppercase">
          {offerLabel[piece.offer_type]}
        </span>
      </span>
    </Link>
  )
}
