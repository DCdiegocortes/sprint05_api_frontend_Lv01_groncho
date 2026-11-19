import { cn } from '@/lib/utils'

export default function StepCard({ number, title, status, statusTone = 'muted', active, onActivate, children }) {
  return (
    <section
      onFocusCapture={onActivate}
      onPointerDown={onActivate}
      className={cn(
        'flex flex-col gap-3 rounded-[22px] bg-card px-4 pt-3.5 pb-4 shadow-raised ring-1 transition-shadow duration-220 ease-ui',
        active ? 'ring-accent' : 'ring-transparent',
      )}
    >
      <header className="flex items-center gap-2.5">
        <span
          className={cn(
            'grid size-[26px] shrink-0 place-items-center rounded-full font-mono text-[9px] font-medium transition-[box-shadow,color,background-color] duration-220 ease-ui',
            active ? 'bg-paper text-accent shadow-pressed' : 'bg-card text-secondary shadow-subtle',
          )}
        >
          {number}
        </span>
        <h2 className="flex-1 text-[15px] font-semibold text-ink">{title}</h2>
        <span className={cn('label-mono text-[9px]', statusTone === 'accent' && 'text-accent')}>{status}</span>
      </header>
      {children}
    </section>
  )
}
