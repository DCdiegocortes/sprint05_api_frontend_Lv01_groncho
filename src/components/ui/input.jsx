import { useId } from 'react'
import { cn } from '@/lib/utils'

export function Input({ label, error, maxLength, value, className, id, ...props }) {
  const autoId = useId()
  const inputId = id ?? autoId
  const errorId = `${inputId}-error`
  const showCounter = maxLength !== undefined && value !== undefined

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {(label || showCounter) && (
        <div className="flex items-baseline justify-between">
          {label && (
            <label htmlFor={inputId} className="label-mono font-medium">
              {label}
            </label>
          )}
          {showCounter && (
            <span className="label-mono ml-auto text-[9px]">
              {String(value).length} / {maxLength}
            </span>
          )}
        </div>
      )}
      <input
        id={inputId}
        value={value}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'h-14 w-full rounded-md bg-paper px-4 text-base text-ink shadow-inset outline-none transition-shadow duration-220 ease-ui placeholder:text-muted',
          'focus-visible:outline-none focus:ring-1 focus:ring-accent',
          error && 'ring-1 ring-accent',
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="flex items-center gap-2 text-[13px] text-secondary">
          <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
          {error}
        </p>
      )}
    </div>
  )
}
