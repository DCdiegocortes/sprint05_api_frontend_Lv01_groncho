import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { cn } from '@/lib/utils'
import PhotoViewer from './PhotoViewer.jsx'
import { conditionOptions, isLocked, labelOf, offerLabel, typeOptions } from './pieces.js'

function Tag({ dot = false, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-[7px] shadow-inset">
      {dot && <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />}
      <span className="font-mono text-[10px] font-medium tracking-[0.12em] text-ink uppercase">{children}</span>
    </span>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline py-3 last:border-0">
      <span className="label-mono">{label}</span>
      <span className="text-sm font-semibold text-ink">{value}</span>
    </div>
  )
}

export default function PieceDetail({ piece, onEdit, onDelete, layout = 'page' }) {
  const [viewing, setViewing] = useState(null)
  const photos = (piece.images ?? []).map((image) => ({ key: image.id, url: image.url }))
  const cover = photos[0]
  const dialog = layout === 'dialog'

  return (
    <div className={cn('flex flex-col gap-4', dialog && 'md:flex-row md:gap-8')}>
      <div className={cn('flex flex-col gap-4', dialog && 'md:w-[400px] md:shrink-0')}>
        {cover ? (
          <button
            type="button"
            aria-label="Open photo"
            onClick={() => setViewing(0)}
            className={cn(
              'block aspect-[392/300] w-full cursor-zoom-in overflow-hidden rounded-[28px] shadow-float',
              dialog && 'md:aspect-[400/460]',
            )}
          >
            <img src={cover.url} alt="" className="size-full object-cover" />
          </button>
        ) : (
          <div className="grid aspect-[392/300] w-full place-items-center rounded-[28px] bg-paper shadow-inset">
            <span className="label-mono">No photo yet</span>
          </div>
        )}
        {photos.length > 1 && (
          <div className="flex justify-center gap-1.5" aria-hidden="true">
            {photos.map((photo, index) => (
              <span key={photo.key} className={cn('h-1.5 rounded-full', index === 0 ? 'w-[18px] bg-accent' : 'w-1.5 bg-ink/15')} />
            ))}
          </div>
        )}
      </div>

      <div className={cn('flex flex-col gap-4', dialog && 'md:min-w-0 md:flex-1')}>
        <div className="flex flex-col gap-2">
          <span className="label-mono">002 — Piece</span>
          <h2 className="text-[32px] leading-[1.05] font-bold tracking-[-0.03em] text-ink">{piece.name}</h2>
          <div className="flex flex-wrap gap-2">
            <Tag>{offerLabel[piece.offer_type]}</Tag>
            <Tag dot>{isLocked(piece) ? 'In a trade' : 'Available'}</Tag>
          </div>
        </div>

        <div className="rounded-[20px] bg-paper px-[18px] py-1.5 shadow-raised">
          <Row label="Size" value={piece.size || '—'} />
          <Row label="Condition" value={labelOf(conditionOptions, piece.item_condition)} />
          <Row label="Type" value={labelOf(typeOptions, piece.type)} />
        </div>

        {piece.description && <p className="font-serif text-[19px] leading-snug text-secondary">{piece.description}</p>}

        <div className={cn('grid grid-cols-2 gap-3', dialog && 'md:mt-auto')}>
          <Button variant="secondary" onClick={onDelete}>
            Delete
          </Button>
          <Button onClick={onEdit}>Edit piece</Button>
        </div>
      </div>

      <PhotoViewer
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
        photos={photos}
        index={viewing ?? 0}
        onIndexChange={setViewing}
        title={piece.name}
      />
    </div>
  )
}
