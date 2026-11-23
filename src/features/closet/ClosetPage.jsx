import { useState } from 'react'
import Loader from '@/components/Loader.jsx'
import { loadingLines } from '@/lib/loadingLines.js'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Plus, Shirt, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import BackLink from '@/components/BackLink.jsx'
import EmptyWall from '@/components/EmptyWall.jsx'
import { OfferType } from '@/lib/constants.js'
import PageHeader from '@/components/PageHeader.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Chip } from '@/components/ui/chip.jsx'
import { useMediaQuery } from '@/hooks/useMediaQuery.js'
import DeletePieceSheet from './DeletePieceSheet.jsx'
import PieceCard from './PieceCard.jsx'
import PieceDetail from './PieceDetail.jsx'
import PieceSheet from './PieceSheet.jsx'
import { closetSubline, filters, matchesFilter } from './pieces.js'
import { useItems } from './useCloset.js'

const emptyLines = {
  ALL: 'Nothing to swap but your opinions.',
  [OfferType.GIFT]: 'No gifts yet. Generosity pending.',
  [OfferType.TRADE]: 'Nothing to trade. Bold strategy.',
}

function EmptyCloset({ filter = 'ALL', onAdd }) {
  return <EmptyWall icon={Shirt} line={emptyLines[filter]} action="Add a piece?" onClick={onAdd} label="Add a piece to your closet" />
}

function PieceDialog({ piece, onClose, onEdit, onDelete }) {
  return (
    <DialogPrimitive.Root open={Boolean(piece)} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-40 bg-paper/70" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="sheet-content fixed top-1/2 left-[var(--content-center,50%)] z-50 max-h-[88dvh] w-[min(872px,calc(100vw-64px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[32px] bg-paper p-7 shadow-float outline-none"
        >
          <DialogPrimitive.Title className="sr-only">{piece?.name}</DialogPrimitive.Title>
          <DialogPrimitive.Close
            aria-label="Close"
            className="press absolute top-7 right-7 z-10 grid size-10 place-items-center rounded-full bg-paper text-ink shadow-raised active:shadow-pressed"
          >
            <X className="size-4" strokeWidth={1.8} />
          </DialogPrimitive.Close>
          {piece && <PieceDetail piece={piece} layout="dialog" onEdit={onEdit} onDelete={onDelete} />}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export default function ClosetPage() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const wide = useMediaQuery('(min-width: 768px)')
  const { data: pieces } = useItems()
  const [filter, setFilter] = useState('ALL')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const piece = itemId ? pieces?.find((item) => String(item.id) === itemId) : null
  const openForm = (target = null) => setEditing({ piece: target })
  const sheets = (
    <>
      <PieceSheet
        key={editing?.piece?.id ?? 'new'}
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        piece={editing?.piece ?? null}
      />
      {piece && <DeletePieceSheet piece={piece} open={deleting} onOpenChange={setDeleting} onDeleted={() => navigate('/closet')} />}
    </>
  )

  if (!pieces)
    return (
      <div className="flex flex-col">
        <PageHeader label="002 — Closet" title="Closet" />
        <Loader line={loadingLines.closet} />
      </div>
    )

  if (piece && !wide) {
    return (
      <div className="flex flex-col gap-4">
        <BackLink to="/closet">Closet</BackLink>
        <PieceDetail piece={piece} onEdit={() => openForm(piece)} onDelete={() => setDeleting(true)} />
        {sheets}
      </div>
    )
  }

  const shown = pieces.filter((item) => matchesFilter(item, filter))

  return (
    <div className="flex flex-col gap-[18px] xl:gap-10">
      <PageHeader label="002 — Closet" title="Closet" subline={closetSubline(pieces)} />

      {pieces.length === 0 ? (
        <EmptyCloset onAdd={() => openForm()} />
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2.5 xl:gap-3">
              {filters.map((option) => (
                <Chip
                  key={option.value}
                  selected={filter === option.value}
                  onSelectedChange={() => setFilter(option.value)}
                  className={filter === option.value ? 'bg-accent text-white shadow-accent' : ''}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
            <Button className="hidden h-[50px] px-7 xl:inline-flex" onClick={() => openForm()}>
              Add a piece
            </Button>
          </div>

          {shown.length ? (
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 xl:gap-6 2xl:grid-cols-5">
              {shown.map((item) => (
                <li key={item.id}>
                  <PieceCard piece={item} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyCloset filter={filter} onAdd={() => openForm()} />
          )}

          <button
            type="button"
            aria-label="Add a piece"
            onClick={() => openForm()}
            className="press fixed right-[max(24px,calc(50vw-196px))] bottom-[calc(max(env(safe-area-inset-bottom),20px)+100px)] z-20 grid size-[60px] place-items-center rounded-full bg-accent text-white shadow-accent md:right-[max(24px,calc(50vw-360px))] xl:hidden"
          >
            <Plus className="size-6" strokeWidth={1.8} />
          </button>
        </>
      )}

      {wide && (
        <PieceDialog
          piece={editing || deleting ? null : piece}
          onClose={() => navigate('/closet')}
          onEdit={() => openForm(piece)}
          onDelete={() => setDeleting(true)}
        />
      )}
      {sheets}
    </div>
  )
}
