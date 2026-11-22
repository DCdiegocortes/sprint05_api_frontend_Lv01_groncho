import { useEffect, useRef, useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { ArrowLeftRight, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { useDeletePiece } from './useCloset.js'

const KNOB = 50
const CONFIRM_AT = 0.85

function SlideToDelete({ disabled, onConfirm }) {
  const track = useRef(null)
  const [range, setRange] = useState(300)
  const x = useMotionValue(0)
  const hint = useTransform(x, [0, range * 0.5], [1, 0])

  useEffect(() => {
    const measure = () => setRange(Math.max(120, (track.current?.offsetWidth ?? 392) - KNOB - 12))
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const release = () => {
    if (x.get() >= range * CONFIRM_AT) {
      animate(x, range, { duration: 0.16, ease: [0.23, 1, 0.32, 1] }).then(onConfirm)
    } else {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 34 })
    }
  }

  return (
    <div ref={track} className="relative flex h-[62px] w-full items-center rounded-full bg-paper px-1.5 shadow-inset">
      <motion.span style={{ opacity: hint }} className="label-mono pointer-events-none absolute inset-0 grid place-items-center pl-10">
        Slide to delete
      </motion.span>
      <motion.button
        type="button"
        aria-label="Slide to delete"
        disabled={disabled}
        drag="x"
        dragConstraints={{ left: 0, right: range }}
        dragElastic={0.04}
        dragMomentum={false}
        onDragEnd={release}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onConfirm()
          }
        }}
        style={{ x }}
        className="relative grid size-[50px] cursor-grab touch-none place-items-center rounded-full bg-accent text-white shadow-accent active:cursor-grabbing"
      >
        <Trash2 className="size-[18px]" strokeWidth={1.8} />
      </motion.button>
    </div>
  )
}

export default function DeletePieceSheet({ piece, open, onOpenChange, onDeleted }) {
  const remove = useDeletePiece()
  const [kept, setKept] = useState(false)
  const [error, setError] = useState('')

  const confirm = () =>
    remove.mutate(piece.id, {
      onSuccess: () => {
        onOpenChange(false)
        onDeleted?.()
      },
      onError: (failure) => {
        if (failure?.response?.status === 409) setKept(true)
        else setError('The piece could not be deleted. Try again.')
      },
    })

  const change = (next) => {
    if (!next) {
      setKept(false)
      setError('')
    }
    onOpenChange(next)
  }

  const cover = piece?.images?.[0]?.url

  return (
    <DialogPrimitive.Root open={open} onOpenChange={change}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-40 bg-paper/70" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="sheet-content fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[440px] flex-col items-center gap-[18px] rounded-t-[36px] bg-paper px-6 pt-3.5 pb-[max(env(safe-area-inset-bottom),32px)] shadow-float outline-none md:inset-auto md:top-1/2 md:left-1/2 md:w-[440px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[32px] md:pt-8 md:pb-7"
        >
          <span aria-hidden="true" className="h-[5px] w-11 rounded-full bg-plate md:hidden" />
          {kept ? (
            <>
              <span className="grid size-16 place-items-center rounded-full bg-paper text-accent shadow-inset">
                <ArrowLeftRight className="size-6" strokeWidth={1.8} />
              </span>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <DialogPrimitive.Title className="text-2xl font-bold tracking-[-0.03em] text-ink">This piece stays</DialogPrimitive.Title>
                <p className="font-serif text-lg text-secondary">It was part of a trade, so it keeps its place in your history.</p>
              </div>
              <Button className="w-full" onClick={() => change(false)}>
                Got it
              </Button>
            </>
          ) : (
            <>
              {cover && <img src={cover} alt="" className="size-[72px] rounded-[18px] object-cover shadow-subtle" />}
              <div className="flex flex-col items-center gap-1.5 text-center">
                <DialogPrimitive.Title className="text-2xl font-bold tracking-[-0.03em] text-ink">Delete {piece?.name}?</DialogPrimitive.Title>
                <p className="font-serif text-lg text-secondary">It leaves your closet and every match stops seeing it.</p>
              </div>
              <SlideToDelete disabled={remove.isPending} onConfirm={confirm} />
              {error && (
                <p role="alert" className="flex items-center gap-2 text-[13px] text-ink">
                  <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
                  {error}
                </p>
              )}
              <Button variant="secondary" className="w-full" onClick={() => change(false)}>
                Keep it
              </Button>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
