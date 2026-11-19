import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'press inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-white shadow-accent active:shadow-none',
        secondary: 'bg-card text-ink shadow-raised active:shadow-pressed',
        ghost: 'text-secondary hover:text-ink',
      },
      size: {
        md: 'h-14 px-6 text-[15px]',
        sm: 'h-10 px-5 text-sm',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export function Button({ className, variant, size, type = 'button', ...props }) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
