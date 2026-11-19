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

function Rotunda({ photos, addTile }) {
  const middle = (photos.length - 1) / 2
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-[200px] items-center justify-center gap-1.5 overflow-hidden [perspective:600px]">
        {photos.map((photo, index) => {
          const offset = index - middle
          return (
            <Photo
              key={photo.id}
              photo={photo}
              className="h-[150px] w-[64px] shrink-0"
              style={{ transform: `rotateY(${offset * -18}deg) translateZ(${-Math.abs(offset) * 14}px)` }}
            />
          )
        })}
      </div>
      {addTile}
    </div>
  )
}

const floatSpots = [
  { left: '2%', top: 10, rotate: -6, width: '46%' },
  { left: '50%', top: 0, rotate: 5, width: '44%' },
  { left: '18%', top: 150, rotate: 3, width: '40%' },
  { left: '56%', top: 140, rotate: -4, width: '40%' },
  { left: '8%', top: 270, rotate: 6, width: '38%' },
  { left: '50%', top: 270, rotate: -3, width: '42%' },
]

function Floating({ photos, addTile }) {
  const rows = Math.ceil(photos.length / 2)
  return (
    <div className="flex flex-col gap-2">
      <div className="relative" style={{ height: rows * 135 + 40 }}>
        {photos.map((photo, index) => {
          const spot = floatSpots[index % floatSpots.length]
          const lap = Math.floor(index / floatSpots.length)
          return (
            <Photo
              key={photo.id}
              photo={photo}
              className="absolute aspect-[4/5] shadow-subtle"
              style={{ left: spot.left, top: spot.top + lap * 400, width: spot.width, transform: `rotate(${spot.rotate}deg)` }}
            />
          )
        })}
      </div>
      {addTile}
    </div>
  )
}

function Bulge({ photos, addTile }) {
  const middle = Math.floor(photos.length / 2)
  return (
    <div className="flex flex-col items-center gap-2">
      {photos.map((photo, index) => {
        const distance = Math.abs(index - middle)
        return (
          <Photo
            key={photo.id}
            photo={photo}
            className="aspect-[16/9]"
            style={{ width: `${Math.max(56, 100 - distance * 16)}%` }}
          />
        )
      })}
      {addTile}
    </div>
  )
}

function LiquidGlass({ photos, addTile }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex h-[180px] gap-1.5">
        {photos.map((photo) => (
          <Photo key={photo.id} photo={photo} className="h-full flex-1" />
        ))}
        <span className="pointer-events-none absolute top-1/2 left-1/2 size-28 -translate-1/2 rounded-full shadow-float ring-2 ring-white/80" />
      </div>
      {addTile}
    </div>
  )
}

function Infinite({ photos, addTile }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-1.5">
        {photos.map((photo, index) => (
          <Photo key={photo.id} photo={photo} className={cn('aspect-[3/4]', index % 3 === 1 && 'translate-y-5')} />
        ))}
      </div>
      <div className="mt-5">{addTile}</div>
    </div>
  )
}

const variants = {
  [UniverseLayout.IMAGE_GRID]: ImageGrid,
  [UniverseLayout.CAROUSEL]: Strip,
  [UniverseLayout.SLIDER]: Strip,
  [UniverseLayout.ACCORDION]: Accordion,
  [UniverseLayout.ROTUNDA]: Rotunda,
  [UniverseLayout.FLOATING]: Floating,
  [UniverseLayout.SCROLL_BULGE]: Bulge,
  [UniverseLayout.LIQUID_GLASS]: LiquidGlass,
  [UniverseLayout.INFINITE]: Infinite,
}

export default function UniversePreview({ layout, photos, addTile = null }) {
  if (!photos.length) return addTile
  const Variant = variants[layout] ?? Masonry
  return <Variant photos={photos} addTile={addTile} />
}
