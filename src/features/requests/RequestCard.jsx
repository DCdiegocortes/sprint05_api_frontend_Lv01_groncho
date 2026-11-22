import { useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import Avatar from '@/components/Avatar.jsx'
import { Button } from '@/components/ui/button.jsx'
import PhotoViewer from '@/features/closet/PhotoViewer.jsx'
import { ExchangeStatus } from '@/lib/constants.js'
import { cn } from '@/lib/utils'
import { describe } from './describe.js'

function Status({ status }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-paper px-3 py-[7px] shadow-inset">
      {status.dot && <span aria-hidden="true" className={cn('size-1.5 rounded-full', status.dot === 'ink' ? 'bg-ink' : 'bg-accent')} />}
      <span
        className={cn('font-mono text-[10px] leading-[13px] font-medium tracking-[0.12em] uppercase', status.dot ? 'text-ink' : 'text-secondary')}
      >
        {status.label}
      </span>
    </span>
  )
}

const COLUMNS = 'grid grid-cols-[minmax(0,1fr)_36px_minmax(0,1fr)] gap-x-3'

function PiecePhoto({ piece, onOpen }) {
  const cover = piece?.images?.[0]?.url
  return (
    <button
      type="button"
      aria-label={`Open photo of ${piece?.name}`}
      onClick={onOpen}
      disabled={!cover}
      className="block aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-[18px] bg-plate shadow-subtle disabled:cursor-default"
    >
      {cover && <img src={cover} alt="" className="size-full object-cover" />}
    </button>
  )
}

function PieceCaption({ piece, caption }) {
  return (
    <div className="flex min-w-0 flex-col gap-[3px]">
      <span className="font-mono text-[10px] leading-[13px] tracking-[0.12em] text-secondary uppercase">{caption}</span>
      <span className="truncate text-[13px] leading-4 font-semibold tracking-[-0.01em] text-ink">{piece?.name}</span>
    </div>
  )
}

function Note({ children, action }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="font-serif text-[17px] leading-[1.2] text-secondary">{children}</p>
      {action}
    </div>
  )
}

export default function RequestCard({ request, userId, onAccept, onReject, onFinish, onCancel }) {
  const info = describe(request, userId)
  const [viewing, setViewing] = useState(null)
  const requested = request.requested_item?.name
  const offered = request.offered_item?.name
  const status = request.status
  const [first, second] = info.pieces
  const open = (piece) => setViewing(photos.findIndex((photo) => photo.key === piece?.id))
  const photos = info.pieces.flatMap(({ piece }) => (piece?.images?.[0] ? [{ key: piece.id, url: piece.images[0].url, name: piece.name }] : []))
  const cancel = (
    <button
      type="button"
      onClick={onCancel}
      className="press shrink-0 px-1 py-2 text-[15px] font-medium text-accent transition-opacity duration-220 ease-ui hover:opacity-70"
    >
      Cancel request
    </button>
  )

  let footer = null
  if (!info.mine && status === ExchangeStatus.PENDING) {
    footer = (
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={onReject}>
          Reject
        </Button>
        <Button onClick={onAccept}>Accept</Button>
      </div>
    )
  } else if (!info.mine && status === ExchangeStatus.ACCEPTED) {
    footer = (
      <>
        <Note>{info.trade ? 'Swap the pieces, then mark it finished.' : 'Hand it over, then mark it finished.'}</Note>
        <Button onClick={onFinish}>Mark as finished</Button>
      </>
    )
  } else if (info.mine && status === ExchangeStatus.PENDING) {
    footer = <Note action={cancel}>Waiting for {info.handle}.</Note>
  } else if (info.mine && status === ExchangeStatus.ACCEPTED) {
    footer = <Note action={cancel}>{info.handle} marks it finished after the swap.</Note>
  } else if (status === ExchangeStatus.REJECTED) {
    footer = <Note>{info.mine ? `${info.handle} said no this time.` : 'Declined.'}</Note>
  } else if (status === ExchangeStatus.FINISHED) {
    footer = (
      <Note>
        {info.mine
          ? `${requested} is in your closet now.`
          : info.trade
            ? `${requested} is in their closet now. ${offered} is in yours.`
            : `${requested} is in their closet now.`}
      </Note>
    )
  }

  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-[24px] bg-paper p-[18px] shadow-raised transition-opacity duration-220 ease-ui',
        status === ExchangeStatus.REJECTED && 'opacity-55',
      )}
    >
      <header className="flex items-center gap-3">
        <Avatar user={info.partner} size={46} className="shadow-inset" />
        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <span className="truncate text-[17px] leading-[21px] font-semibold tracking-[-0.01em] text-ink">{info.handle}</span>
          <span className="truncate font-mono text-[10px] leading-[13px] tracking-[0.12em] text-secondary uppercase">{info.verb}</span>
        </div>
        <Status status={info.status} />
      </header>

      <div className="flex flex-col gap-2">
        <div className={cn(COLUMNS, 'items-center')}>
          <PiecePhoto piece={first.piece} onOpen={() => open(first.piece)} />
          {second ? (
            <>
              <span className="grid size-9 place-items-center rounded-full bg-paper text-accent shadow-inset">
                <ArrowLeftRight className="size-4" strokeWidth={1.8} />
              </span>
              <PiecePhoto piece={second.piece} onOpen={() => open(second.piece)} />
            </>
          ) : null}
        </div>
        <div className={COLUMNS}>
          <PieceCaption {...first} />
          {second && <span aria-hidden="true" />}
          {second && <PieceCaption {...second} />}
        </div>
      </div>

      {request.message && (
        <p className="rounded-[14px] bg-paper px-4 py-3.5 font-serif text-lg leading-[1.2] text-ink shadow-inset">“{request.message}”</p>
      )}

      {footer}

      <PhotoViewer
        open={viewing !== null && viewing >= 0}
        onOpenChange={(open) => !open && setViewing(null)}
        photos={photos}
        index={Math.max(viewing ?? 0, 0)}
        onIndexChange={setViewing}
        title={photos[viewing ?? 0]?.name ?? ''}
      />
    </article>
  )
}
