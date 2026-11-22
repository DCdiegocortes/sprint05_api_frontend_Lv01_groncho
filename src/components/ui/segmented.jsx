import { cn } from '@/lib/utils'

export function Segmented({ label, options, value, onChange, className }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('flex rounded-full bg-paper p-1 shadow-inset', className)}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-[13px] whitespace-nowrap transition-[background-color,box-shadow,color] duration-220 ease-ui',
              selected ? 'bg-paper font-semibold text-ink shadow-subtle' : 'font-medium text-secondary hover:text-ink',
            )}
          >
            <span
              aria-hidden="true"
              className={cn('size-1.5 shrink-0 rounded-full bg-accent transition-transform duration-220 ease-ui', selected ? 'scale-100' : 'hidden')}
            />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
