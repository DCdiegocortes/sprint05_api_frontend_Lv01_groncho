import { useRef } from 'react'
import { ImagePlus } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet.jsx'

export default function PhotosSheet({ open, onOpenChange, pending, error, onFiles }) {
  const input = useRef(null)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Add photos" subtitle="To your moodboard">
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            onFiles(event.dataTransfer.files)
          }}
          className="press flex w-full flex-col items-center gap-2 rounded-[22px] bg-paper py-8 shadow-inset"
        >
          <ImagePlus className="size-7 text-secondary" strokeWidth={1.4} />
          <span className="text-[15px] font-semibold text-ink">Drop images or browse</span>
          <span className="label-mono text-[8.5px]">JPG, PNG · up to 10 MB each</span>
        </button>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          hidden
          data-testid="sheet-photo-input"
          onChange={(event) => {
            onFiles(event.target.files)
            event.target.value = ''
          }}
        />
        {error && (
          <p role="alert" className="mt-3 flex items-center gap-2 text-[13px] text-ink">
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
            {error}
          </p>
        )}
        {pending.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2.5">
            {pending.map((photo) => (
              <li key={photo.id} className="flex items-center gap-3 rounded-2xl bg-card p-2 pr-4 shadow-subtle">
                <img src={photo.url} alt="" className="size-11 rounded-xl object-cover" />
                <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-plate">
                  <span className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${Math.round(photo.progress * 100)}%` }} />
                </span>
                <span className="label-mono w-9 text-right text-[9px] text-ink">{Math.round(photo.progress * 100)}%</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-center font-serif text-sm text-secondary">Photos stay sharp while they upload.</p>
      </SheetContent>
    </Sheet>
  )
}
