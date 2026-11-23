import { Panel, PanelClose, PanelTitle } from '@/components/ui/panel.jsx'
import { cn } from '@/lib/utils'
import { Thumb } from '../LayoutPicker.jsx'
import { layouts } from '../layouts.js'

export default function LayoutsSheet({ open, onOpenChange, value, photos, onPick }) {
  if (!open) return null

  return (
    <Panel open onOpenChange={onOpenChange} className="md:w-[880px]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <PanelTitle className="text-[26px] leading-tight font-bold tracking-[-0.03em] text-ink">Choose a layout</PanelTitle>
          <p className="font-serif text-lg leading-snug text-secondary">How others move through your universe.</p>
        </div>
        <PanelClose />
      </div>
      <div role="radiogroup" aria-label="All layouts" className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-3.5">
        {layouts.map((layout) => {
          const selected = layout.value === value
          return (
            <button
              key={layout.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onPick(layout.value)}
              className={cn(
                'press relative flex flex-col gap-2.5 rounded-[20px] p-2 text-left shadow-raised transition-[background-color] duration-220 ease-ui',
                selected ? 'bg-card' : 'bg-paper hover:bg-card/60',
              )}
            >
              {selected && <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[20px] border-[1.5px] border-accent" />}
              <span className="block h-[92px] overflow-hidden rounded-[14px] bg-paper p-1.5 shadow-inset">
                <Thumb value={layout.value} photos={photos} />
              </span>
              <span className="flex min-w-0 flex-col gap-1 px-1 pb-1">
                <span className="truncate text-[13px] leading-tight font-semibold text-ink">{layout.name}</span>
                <span className={cn('label-mono truncate text-[10px] leading-snug', selected && 'text-ink/70')}>{layout.hint}</span>
              </span>
            </button>
          )
        })}
      </div>
    </Panel>
  )
}
