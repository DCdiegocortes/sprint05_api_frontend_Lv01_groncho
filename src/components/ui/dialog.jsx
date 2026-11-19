import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close
export const DialogTitle = DialogPrimitive.Title
export const DialogDescription = DialogPrimitive.Description

export function DialogContent({ className, children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-40 bg-paper/70 backdrop-blur-[6px]" />
      <DialogPrimitive.Content
        className={cn(
          'dialog-content fixed top-[42%] left-1/2 z-50 w-[calc(100%-48px)] max-w-[348px] -translate-x-1/2 -translate-y-1/2 rounded-[24px] bg-card px-6 pt-[22px] pb-5 shadow-float ring-1 ring-white/90 outline-none',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Close"
          className="press absolute top-4 right-4 grid size-8 place-items-center rounded-full text-secondary transition-colors duration-220 ease-ui hover:text-ink"
        >
          <X className="size-4" strokeWidth={1.6} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
