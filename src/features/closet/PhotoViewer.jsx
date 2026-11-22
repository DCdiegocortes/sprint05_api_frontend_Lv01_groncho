import { useEffect } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PhotoAction from '@/components/PhotoAction.jsx'
import { cn } from '@/lib/utils'

const SWIPE = 60

function NavButton({ side, disabled, onClick }) {
  const Icon = side === 'previous' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      aria-label={side === 'previous' ? 'Previous photo' : 'Next photo'}
      disabled={disabled}
      onClick={onClick}
      className="press hidden size-[52px] shrink-0 place-items-center rounded-full bg-paper text-ink shadow-raised active:shadow-pressed disabled:opacity-40 md:grid"
    >
      <Icon className="size-5" strokeWidth={1.8} />
    </button>
  )
}

export default function PhotoViewer({ open, onOpenChange, photos, index, onIndexChange, title, footer = null }) {
  const count = photos.length
  const current = photos[Math.min(index, count - 1)]
  const go = (step) => onIndexChange(Math.min(Math.max(index + step, 0), count - 1))

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'ArrowRight') onIndexChange(Math.min(index + 1, count - 1))
      if (event.key === 'ArrowLeft') onIndexChange(Math.max(index - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, index, count, onIndexChange])

  if (!current) return null

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-50 bg-paper" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="dialog-overlay fixed inset-0 z-50 flex flex-col px-4 pt-[max(env(safe-area-inset-top),28px)] pb-[max(env(safe-area-inset-bottom),28px)] outline-none md:px-12"
        >
          <div className="flex flex-col gap-1 px-2 md:px-0">
            <span className="font-mono text-[11px] font-medium tracking-[0.12em] text-secondary">
              {Math.min(index, count - 1) + 1} / {count}
            </span>
            <DialogPrimitive.Title className="text-[15px] font-semibold text-ink">{title}</DialogPrimitive.Title>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center gap-10 py-6">
            <NavButton side="previous" disabled={index === 0} onClick={() => go(-1)} />
            <div className="relative flex h-full min-w-0 flex-1 items-center justify-center md:flex-none">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={current.key}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  drag={count > 1 ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.25}
                  onDragEnd={(_event, info) => {
                    if (info.offset.x < -SWIPE || info.velocity.x < -500) go(1)
                    else if (info.offset.x > SWIPE || info.velocity.x > 500) go(-1)
                  }}
                  className="relative max-h-full touch-pan-y"
                >
                  <img
                    src={current.url}
                    alt=""
                    draggable={false}
                    className="block max-h-[calc(100dvh-220px)] w-auto max-w-full rounded-[28px] object-contain shadow-float select-none md:max-h-[calc(100dvh-180px)]"
                  />
                  <DialogPrimitive.Close asChild>
                    <PhotoAction icon="close" label="Close photo" size={22} className="absolute top-3.5 right-3.5 size-11" />
                  </DialogPrimitive.Close>
                </motion.div>
              </AnimatePresence>
            </div>
            <NavButton side="next" disabled={index >= count - 1} onClick={() => go(1)} />
          </div>

          <div className="flex flex-col items-center gap-4">
            {count > 1 && (
              <div className="flex gap-1.5" aria-hidden="true">
                {photos.map((photo, i) => (
                  <span
                    key={photo.key}
                    className={cn('h-1.5 rounded-full transition-all duration-220 ease-ui', i === index ? 'w-[18px] bg-accent' : 'w-1.5 bg-ink/15')}
                  />
                ))}
              </div>
            )}
            {footer ?? (
              <span className="label-mono text-center">
                <span className="md:hidden">{count > 1 ? 'Swipe for the next photo · pinch to zoom' : 'Pinch to zoom'}</span>
                <span className="hidden md:inline">{count > 1 ? '← → to browse · Esc to close' : 'Esc to close'}</span>
              </span>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
