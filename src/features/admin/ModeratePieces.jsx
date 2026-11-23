import { useQueryClient } from '@tanstack/react-query'
import Loader from '@/components/Loader.jsx'
import { loadingLines } from '@/lib/loadingLines.js'
import { deleteItemImages, deleteItems } from '@/api/items.js'
import PhotoAction from '@/components/PhotoAction.jsx'
import { OfferType } from '@/lib/constants.js'
import { queryKeys } from '@/lib/queryKeys.js'
import { cn } from '@/lib/utils'
import { UNDO_MS, useUndoableRemoval, useUserItems } from './useAdmin.js'

const offerWord = { [OfferType.TRADE]: 'Trade', [OfferType.GIFT]: 'Gift', [OfferType.BOTH]: 'Trade or gift' }

function Piece({ piece, photos, fine, onRemovePiece, onRemovePhoto }) {
  return (
    <li className="flex flex-col gap-3.5 rounded-[20px] bg-paper p-4 shadow-raised xl:p-5">
      <div className="flex items-start gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">{piece.name}</h3>
          <span className="font-mono text-[10px] tracking-[0.12em] text-secondary uppercase">
            {offerWord[piece.offer_type] ?? 'Trade'} · {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
          </span>
        </div>
        <button
          type="button"
          onClick={onRemovePiece}
          className="press shrink-0 text-[15px] font-medium text-accent transition-opacity duration-220 ease-ui hover:opacity-70"
        >
          Remove piece
        </button>
      </div>
      {photos.length > 0 && (
        <ul className="grid grid-cols-3 gap-2.5">
          {photos.map((photo, index) => (
            <li key={photo.id} className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-raised">
              <img src={photo.url} alt="" className="size-full object-cover" />
              <PhotoAction
                icon="delete"
                label={`Remove photo ${index + 1} of ${piece.name}`}
                size={18}
                onClick={() => onRemovePhoto(photo)}
                className={cn(
                  'absolute top-1.5 right-1.5 size-9 transition-opacity duration-220 ease-ui',
                  fine && 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
                )}
              />
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export default function ModeratePieces({ userId, fine, notify }) {
  const queryClient = useQueryClient()
  const { data: items = [], isPending, isError } = useUserItems(userId)
  const pieces = useUndoableRemoval()
  const photos = useUndoableRemoval()
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.userItems(String(userId)) })

  const removePiece = (piece) => {
    const undo = pieces.remove([piece.id], async () => {
      try {
        await deleteItems([piece.id])
        await refresh()
      } catch (error) {
        notify({
          title: `${piece.name} stays`,
          hint: error?.response?.status === 409 ? 'It was part of a swap' : 'Try again',
          tone: 'alert',
        })
      }
    })
    notify({
      key: `piece-${piece.id}`,
      title: `${piece.name} removed`,
      hint: 'Gone in 5 seconds',
      action: { label: 'Undo', onClick: undo },
      duration: UNDO_MS,
    })
  }

  const removePhoto = (photo) => {
    const undo = photos.remove([photo.id], async () => {
      try {
        await deleteItemImages([photo.id])
        await refresh()
      } catch {
        notify({ title: 'That photo stays', hint: 'Try again', tone: 'alert' })
      }
    })
    notify({
      key: `photo-${photo.id}`,
      title: 'Photo removed',
      hint: 'Gone in 5 seconds',
      action: { label: 'Undo', onClick: undo },
      duration: UNDO_MS,
    })
  }

  if (isPending) return <Loader line={loadingLines.admin} />
  if (isError) return <p className="text-sm text-secondary">The pieces could not be loaded. Try again in a moment.</p>

  const shown = items.filter((piece) => !pieces.hidden.has(piece.id))
  if (!shown.length) return <p className="text-sm text-secondary">No pieces to moderate.</p>

  return (
    <ul className="grid gap-3.5 pb-28 xl:grid-cols-2 xl:items-start xl:gap-4">
      {shown.map((piece) => (
        <Piece
          key={piece.id}
          piece={piece}
          fine={fine}
          photos={(piece.images ?? []).filter((photo) => !photos.hidden.has(photo.id))}
          onRemovePiece={() => removePiece(piece)}
          onRemovePhoto={removePhoto}
        />
      ))}
    </ul>
  )
}
