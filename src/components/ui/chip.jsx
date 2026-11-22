import { cn } from '@/lib/utils'

export function Chip({ selected = false, onSelectedChange, className, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelectedChange?.(!selected)}
      className={cn(
        'press inline-flex h-[34px] items-center rounded-full bg-paper px-[18px] text-[13px] text-ink xl:h-[37px] xl:px-5 xl:text-sm',
        selected ? 'font-semibold shadow-pressed' : 'font-medium shadow-subtle',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
