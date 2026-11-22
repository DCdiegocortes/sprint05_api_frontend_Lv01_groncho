import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const PanelTitle = DialogPrimitive.Title

export function PanelClose({ className }) {
  return (
    <DialogPrimitive.Close
      aria-label="Close"
      className={cn('press grid size-10 shrink-0 place-items-center rounded-full bg-paper text-ink shadow-raised active:shadow-pressed', className)}
    >
      <X className="size-4" strokeWidth={1.8} />
    </DialogPrimitive.Close>
  )
}

export function Panel({ open, onOpenChange, className, children }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-40 bg-paper/70" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            'sheet-content fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] w-full max-w-[440px] flex-col gap-[18px] overflow-y-auto rounded-t-[36px] bg-paper px-6 pt-3.5 pb-[max(env(safe-area-inset-bottom),32px)] shadow-float outline-none',
            'md:inset-auto md:top-1/2 md:left-[var(--content-center,50%)] md:max-w-none md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[32px] md:px-9 md:pt-9 md:pb-8',
            className,
          )}
        >
          <span aria-hidden="true" className="mx-auto h-[5px] w-11 shrink-0 rounded-full bg-plate md:hidden" />
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
