import { UniverseLayout } from '@/lib/constants.js'
import { cn } from '@/lib/utils'

const heights = [150, 104, 96, 84, 120, 110]

function Photo({ photo, className, style }) {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-plate', className)} style={style}>
      <img src={photo.url} alt="" className={cn('size-full object-cover', photo.uploading && 'opacity-45')} />
      {photo.uploading && (
        <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-card px-2 py-1 shadow-subtle">
          <span className="relative h-1 w-11 overflow-hidden rounded-full bg-plate">
            <span className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${Math.round(photo.progress * 100)}%` }} />
          </span>
          <span className="font-mono text-[8.5px] font-medium text-ink">{Math.round(photo.progress * 100)}%</span>
        </span>
      )}
    </div>
  )
}

function Masonry({ photos, addTile }) {
  const columns = [[], []]
  photos.forEach((photo, index) => columns[index % 2].push({ photo, index }))
  return (
    <div className="flex gap-2">
      {columns.map((column, c) => (
        <div key={c} className="flex flex-1 flex-col gap-2">
          {column.map(({ photo, index }) => (
            <Photo key={photo.id} photo={photo} style={{ height: heights[index % heights.length] }} />
          ))}
          {c === (photos.length % 2) && addTile}
        </div>
      ))}
    </div>
  )
}

function ImageGrid({ photos, addTile }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((photo) => (
        <Photo key={photo.id} photo={photo} className="aspect-square" />
      ))}
      {addTile}
    </div>
  )
}

function Strip({ photos, addTile }) {
  return (
    <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
      {photos.map((photo) => (
        <Photo key={photo.id} photo={photo} className="h-[220px] w-[78%] shrink-0 snap-center" />
      ))}
      <div className="w-[40%] shrink-0">{addTile}</div>
    </div>
  )
}

function Accordion({ photos, addTile }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-[220px] gap-1.5">
        {photos.map((photo, index) => (
          <Photo key={photo.id} photo={photo} className={cn('h-full transition-[flex] duration-300 ease-ui', index === 0 ? 'flex-[4]' : 'flex-1')} />
        ))}
      </div>
      {addTile}
    </div>
  )
}

export default function UniversePreview({ layout, photos, addTile }) {
  if (!photos.length) return addTile
  if (layout === UniverseLayout.IMAGE_GRID) return <ImageGrid photos={photos} addTile={addTile} />
  if (layout === UniverseLayout.CAROUSEL || layout === UniverseLayout.SLIDER) return <Strip photos={photos} addTile={addTile} />
  if (layout === UniverseLayout.ACCORDION) return <Accordion photos={photos} addTile={addTile} />
  return <Masonry photos={photos} addTile={addTile} />
}
