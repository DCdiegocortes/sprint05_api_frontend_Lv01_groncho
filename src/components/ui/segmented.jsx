import { cn } from '@/lib/utils'

export function Segmented({ label, options, value, onChange, fit = false, className }) {
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
              'flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-full text-[13px] whitespace-nowrap transition-[background-color,box-shadow,color] duration-220 ease-ui',
              fit ? 'flex-auto px-3' : 'flex-1 px-3.5',
              selected ? 'bg-paper text-ink shadow-subtle' : 'text-secondary hover:text-ink',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'size-1.5 shrink-0 rounded-full bg-accent transition-[opacity,transform] duration-220 ease-ui',
                selected ? 'scale-100 opacity-100' : fit ? 'scale-50 opacity-0' : 'hidden',
              )}
            />
            <span className="grid">
              <span aria-hidden="true" className="invisible col-start-1 row-start-1 font-semibold">
                {option.label}
              </span>
              <span className={cn('col-start-1 row-start-1', selected ? 'font-semibold' : 'font-medium')}>{option.label}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
