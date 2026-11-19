import { UniverseLayout } from '@/lib/constants.js'
import { cn } from '@/lib/utils'
import { layouts } from './layouts.js'

const block = 'rounded-[4px] bg-plate'

function Schematic({ value }) {
  switch (value) {
    case UniverseLayout.ACCORDION:
      return (
        <div className="flex h-full gap-1">
          <div className={cn(block, 'flex-[4]')} />
          <div className={cn(block, 'flex-1')} />
          <div className={cn(block, 'flex-1')} />
        </div>
      )
    case UniverseLayout.CAROUSEL:
    case UniverseLayout.SLIDER:
      return (
        <div className="flex h-full items-center gap-1">
          <div className={cn(block, 'h-[70%] w-2')} />
          <div className={cn(block, 'h-full flex-1')} />
          <div className={cn(block, 'h-[70%] w-2')} />
        </div>
      )
    case UniverseLayout.ROTUNDA:
      return (
        <div className="flex h-full items-end justify-center gap-1">
          {[60, 80, 100, 80, 60].map((h, i) => (
            <div key={i} className={cn(block, 'w-3')} style={{ height: `${h}%` }} />
          ))}
        </div>
      )
    case UniverseLayout.IMAGE_GRID:
      return (
        <div className="grid h-full grid-cols-3 gap-1">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={block} />
          ))}
        </div>
      )
    case UniverseLayout.FLOATING:
      return (
        <div className="relative h-full">
          <div className={cn(block, 'absolute top-1 left-1 size-8 rotate-[-6deg]')} />
          <div className={cn(block, 'absolute top-6 right-2 size-9 rotate-[5deg]')} />
          <div className={cn(block, 'absolute bottom-0 left-6 size-7 rotate-[2deg]')} />
        </div>
      )
    case UniverseLayout.SCROLL_BULGE:
      return (
        <div className="flex h-full flex-col items-center justify-center gap-1">
          <div className={cn(block, 'h-3 w-[60%]')} />
          <div className={cn(block, 'h-8 w-full')} />
          <div className={cn(block, 'h-3 w-[60%]')} />
        </div>
      )
    case UniverseLayout.LIQUID_GLASS:
      return (
        <div className="relative flex h-full items-center gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn(block, 'h-[70%] flex-1')} />
          ))}
          <div className="absolute top-1/2 left-1/2 size-9 -translate-1/2 rounded-full bg-card/70 shadow-subtle" />
        </div>
      )
    case UniverseLayout.INFINITE:
      return (
        <div className="grid h-full grid-cols-4 gap-1 opacity-90">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={cn(block, i % 3 === 0 && 'translate-y-1')} />
          ))}
        </div>
      )
    default:
      return (
        <div className="flex h-full gap-1">
          <div className="flex flex-1 flex-col gap-1">
            <div className={cn(block, 'flex-[3]')} />
            <div className={cn(block, 'flex-[2]')} />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <div className={cn(block, 'flex-[2]')} />
            <div className={cn(block, 'flex-[3]')} />
          </div>
        </div>
      )
  }
}

export default function LayoutPicker({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Layout" className="-mx-6 flex snap-x scroll-px-6 gap-3 overflow-x-auto px-6 pt-1 pb-3">
      {layouts.map((layout) => {
        const selected = layout.value === value
        return (
          <button
            key={layout.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(layout.value)}
            className={cn(
              'press flex w-[112px] shrink-0 snap-start flex-col gap-2 rounded-[18px] bg-card p-2.5 text-left shadow-subtle ring-1 transition-shadow duration-220 ease-ui',
              selected ? 'ring-accent' : 'ring-transparent',
            )}
          >
            <span className="block h-[78px] rounded-xl bg-paper p-2 shadow-inset">
              <Schematic value={layout.value} />
            </span>
            <span className="flex flex-col gap-0.5 px-0.5">
              <span className="text-[13px] font-semibold text-ink">{layout.name}</span>
              <span className={cn('label-mono text-[7.5px]', selected && 'text-accent')}>{layout.hint}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
