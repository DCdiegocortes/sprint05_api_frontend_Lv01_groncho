import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { deleteUniverseImages } from '@/api/universes.js'
import PhotoAction from '@/components/PhotoAction.jsx'
import { Button } from '@/components/ui/button.jsx'
import { queryKeys } from '@/lib/queryKeys.js'
import { cn } from '@/lib/utils'
import { UNDO_MS, useUndoableRemoval } from './useAdmin.js'

const LONG_PRESS_MS = 450

export function PhotoTile({ photo, index, selected, selecting, fine, onToggle, onRemove }) {
  const timer = useRef(null)
  const pressed = useRef(false)
  const cancel = () => clearTimeout(timer.current)

  return (
    <li className="group relative">
      <div
        role="checkbox"
        tabIndex={0}
        aria-checked={selected}
        aria-label={`Photo ${index + 1}`}
        onPointerDown={(event) => {
          if (event.pointerType === 'mouse') return
          timer.current = setTimeout(() => {
            pressed.current = true
            onToggle()
          }, LONG_PRESS_MS)
        }}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onContextMenu={(event) => event.pointerType !== 'mouse' && event.preventDefault()}
        onClick={(event) => {
          if (pressed.current) {
            pressed.current = false
            return
          }
          if (selecting || event.shiftKey) onToggle()
        }}
        onKeyDown={(event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault()
            onToggle()
          }
        }}
        className="relative aspect-[4/5] cursor-pointer overflow-hidden rounded-[20px] shadow-raised outline-offset-4 select-none [-webkit-touch-callout:none]"
      >
        <img src={photo.url} alt="" draggable={false} className="size-full object-cover" />
        {selected && <span aria-hidden="true" className="absolute inset-0 rounded-[20px] border-[3px] border-accent" />}
        {selecting && (
          <span
            aria-hidden="true"
            className={cn(
              'absolute top-3 right-3 grid size-7 place-items-center rounded-full xl:top-3.5 xl:right-3.5',
              selected ? 'bg-accent text-white' : 'border-[1.5px] border-white bg-white/55',
            )}
          >
            {selected && <Check className="size-4" strokeWidth={2.4} />}
          </span>
        )}
      </div>
      {!selecting && (
        <PhotoAction
          icon="delete"
          label={`Remove photo ${index + 1}`}
          size={18}
          onClick={onRemove}
          className={cn(
            'absolute top-2.5 right-2.5 size-9 transition-opacity duration-220 ease-ui',
            fine && 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
          )}
        />
      )}
    </li>
  )
}

export function SelectionBar({ count, total, fine, unit, onSelectAll, onRemove }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[440px] px-6 pb-[max(env(safe-area-inset-bottom),20px)] xl:inset-x-auto xl:left-[var(--content-center,50%)] xl:w-[560px] xl:max-w-none xl:-translate-x-1/2 xl:px-0 xl:pb-6">
      <div role="toolbar" aria-label="Selection" className="flex h-[81px] items-center gap-4 rounded-[38px] bg-paper pr-3.5 pl-6 shadow-float">
        <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <span className="text-[15px] font-semibold text-ink">{count} selected</span>
          <span className="truncate font-mono text-[10px] tracking-[0.12em] text-secondary uppercase">
            {fine ? 'Esc to clear · Del to remove' : `Of ${total} ${unit}`}
          </span>
        </span>
        {count < total && (
          <button
            type="button"
            onClick={onSelectAll}
            className="press text-[15px] font-medium text-accent transition-opacity duration-220 ease-ui hover:opacity-70"
          >
            Select all
          </button>
        )}
        <Button onClick={onRemove}>Remove {count}</Button>
      </div>
    </div>
  )
}

export default function ModeratePhotos({ user, fine, notify }) {
  const queryClient = useQueryClient()
  const universe = user.universe
  const { hidden, remove } = useUndoableRemoval()
  const [selected, setSelected] = useState(() => new Set())
  const photos = (universe?.images ?? []).filter((photo) => !hidden.has(photo.id))
  const selecting = selected.size > 0

  const toggle = (id) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const removePhotos = (ids) => {
    setSelected(new Set())
    const undo = remove(ids, async () => {
      try {
        await deleteUniverseImages(universe.id, ids)
        await queryClient.invalidateQueries({ queryKey: queryKeys.user(String(user.id)) })
      } catch {
        notify({ title: ids.length > 1 ? 'Those photos stay' : 'That photo stays', hint: 'Try again', tone: 'alert' })
      }
    })
    notify({
      key: ids.join('-'),
      title: ids.length > 1 ? `${ids.length} photos removed` : 'Photo removed',
      hint: 'Gone in 5 seconds',
      action: { label: 'Undo', onClick: undo },
      duration: UNDO_MS,
    })
  }

  useEffect(() => {
    if (!selecting) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setSelected(new Set())
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        removePhotos([...selected])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!universe) return <p className="text-sm text-secondary">{user.name} has no universe yet.</p>
  if (!photos.length) return <p className="text-sm text-secondary">No photos left in this universe.</p>

  return (
    <>
      <ul className="grid grid-cols-2 gap-2.5 pb-28 xl:grid-cols-4 xl:gap-4">
        {photos.map((photo, index) => (
          <PhotoTile
            key={photo.id}
            photo={photo}
            index={index}
            fine={fine}
            selected={selected.has(photo.id)}
            selecting={selecting}
            onToggle={() => toggle(photo.id)}
            onRemove={() => removePhotos([photo.id])}
          />
        ))}
      </ul>
      {selecting && (
        <SelectionBar
          count={selected.size}
          total={photos.length}
          unit="photos"
          fine={fine}
          onSelectAll={() => setSelected(new Set(photos.map((photo) => photo.id)))}
          onRemove={() => removePhotos([...selected])}
        />
      )}
    </>
  )
}
