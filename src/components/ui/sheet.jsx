import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Sheet = DialogPrimitive.Root

export function SheetContent({ title, subtitle, className, children }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-40 bg-paper/70" />
      <DialogPrimitive.Content
        className={cn(
          'sheet-content fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85dvh] w-full max-w-[440px] flex-col rounded-t-[36px] bg-paper px-6 pt-3.5 pb-[max(env(safe-area-inset-bottom),24px)] shadow-float outline-none',
          'md:inset-auto md:top-1/2 md:left-1/2 md:max-h-[80dvh] md:w-[480px] md:max-w-none md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[32px] md:px-7 md:pt-2 md:pb-7',
          className,
        )}
      >
        <span aria-hidden="true" className="mx-auto h-[5px] w-11 rounded-full bg-plate md:hidden" />
        <div className="mt-5 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <DialogPrimitive.Title className="text-2xl font-bold text-ink">{title}</DialogPrimitive.Title>
            <DialogPrimitive.Description className="label-mono text-[9px]">{subtitle}</DialogPrimitive.Description>
          </div>
          <DialogPrimitive.Close
            aria-label="Close"
            className="press grid size-10 shrink-0 place-items-center rounded-full bg-card text-ink shadow-subtle"
          >
            <X className="size-4" strokeWidth={1.6} />
          </DialogPrimitive.Close>
        </div>
        <div className="mt-5 min-h-0 flex-1 overflow-y-auto pb-1">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
