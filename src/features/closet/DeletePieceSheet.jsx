import { useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ArrowLeftRight, Trash2 } from 'lucide-react'
import SlideToConfirm from '@/components/SlideToConfirm.jsx'
import { Button } from '@/components/ui/button.jsx'
import { useDeletePiece } from './useCloset.js'

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
          className="sheet-content fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[440px] flex-col items-center gap-[18px] rounded-t-[36px] bg-paper px-6 pt-3.5 pb-[max(env(safe-area-inset-bottom),32px)] shadow-float outline-none md:inset-auto md:top-1/2 md:left-[var(--content-center,50%)] md:w-[440px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[32px] md:pt-8 md:pb-7"
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
              <SlideToConfirm label="Slide to delete" icon={Trash2} disabled={remove.isPending} onConfirm={confirm} />
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
