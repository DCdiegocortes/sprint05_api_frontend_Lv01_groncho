import { useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ChevronLeft, Plus, Shirt, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
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

function EmptyCloset({ onAdd }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[28px] bg-paper px-7 py-9 text-center shadow-inset md:max-w-[480px]">
      <Shirt className="size-11 text-secondary" strokeWidth={1.2} />
      <p className="text-[17px] font-semibold text-ink">Your closet is the other half of a match.</p>
      <p className="font-serif text-lg leading-tight text-secondary">Add the pieces you would trade or gift. Matches only see what is here.</p>
      <Button className="w-full" onClick={onAdd}>
        Add your first piece
      </Button>
    </div>
  )
}

function PieceDialog({ piece, onClose, onEdit, onDelete }) {
  return (
    <DialogPrimitive.Root open={Boolean(piece)} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-40 bg-paper/70" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="sheet-content fixed top-1/2 left-1/2 z-50 max-h-[88dvh] w-[min(872px,calc(100vw-64px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[32px] bg-paper p-7 shadow-float outline-none"
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

  if (!pieces) return <PageHeader label="002 — Closet" title="Closet" />

  if (piece && !wide) {
    return (
      <div className="flex flex-col gap-4">
        <Link to="/closet" className="press flex w-fit items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-full bg-paper text-ink shadow-raised">
            <ChevronLeft className="size-[18px]" strokeWidth={1.8} />
          </span>
          <span className="label-mono">Closet</span>
        </Link>
        <PieceDetail piece={piece} onEdit={() => openForm(piece)} onDelete={() => setDeleting(true)} />
        {sheets}
      </div>
    )
  }

  const shown = pieces.filter((item) => matchesFilter(item, filter))

  return (
    <div className="flex flex-col gap-[18px] xl:gap-8">
      <PageHeader label="002 — Closet" title="Closet" subline={closetSubline(pieces)} />

      {pieces.length === 0 ? (
        <EmptyCloset onAdd={() => openForm()} />
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2.5">
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
            <Button className="hidden xl:inline-flex" onClick={() => openForm()}>
              Add a piece
            </Button>
          </div>

          {shown.length ? (
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 xl:gap-4 2xl:grid-cols-5">
              {shown.map((item) => (
                <li key={item.id}>
                  <PieceCard piece={item} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-serif text-lg text-secondary">No pieces offered this way yet.</p>
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
