import { useCallback, useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useElementWidth } from '@/hooks/useElementWidth.js'
import { useImageRatios } from '@/hooks/useImageRatios.js'
import Photo from './Photo.jsx'
import { clamp, hash, stageHeight, useClock, usePan, useReordering, useScreenFill, wrap } from './motion.js'

const MIN_ZOOM = 0.7
const MAX_ZOOM = 1.8

function Tile({ tile, x, y, zoom, stage }) {
  const position = useTransform([x, y, zoom], ([px, py, z]) => {
    const wx = wrap(-tile.periodX / 2, tile.periodX / 2, tile.x + px * tile.depth)
    const wy = wrap(-tile.periodY / 2, tile.periodY / 2, tile.y + py * tile.depth)
    return `translate3d(${stage.width / 2 + wx * z - tile.width / 2}px, ${stage.height / 2 + wy * z - tile.height / 2}px, 0) scale(${z})`
  })

  return (
    <motion.div className="absolute top-0 left-0" style={{ width: tile.width, height: tile.height, transform: position }}>
      <Photo photo={tile.photo} copy={tile.copy} className="size-full rounded-[14px] shadow-subtle" />
    </motion.div>
  )
}

export default function Infinite({ photos, addTile, fill = false }) {
  const [measure, width] = useElementWidth()
  const [place, filled] = useScreenFill(fill)
  const stage = useRef(null)
  const ref = useCallback(
    (node) => {
      stage.current = node
      measure(node)
      place(node)
    },
    [measure, place],
  )
  const ratioOf = useImageRatios(photos.map((photo) => photo.url))
  const reordering = useReordering()
  const pan = usePan({ disabled: reordering, friction: 0.95 })
  const drift = useClock({ speed: 0.012, paused: reordering })
  const x = useTransform([pan.x, drift], ([px, time]) => px + time)
  const y = useTransform([pan.y, drift], ([py, time]) => py + time * 0.6)
  const zoomTarget = useMotionValue(1)
  const zoom = useSpring(zoomTarget, { stiffness: 200, damping: 28 })

  const height = Math.max(stageHeight(width, 0.62, 340, 760), filled ?? 0)
  const cell = clamp(110, 290, width * 0.2)
  const columns = Math.ceil(width / (cell * MIN_ZOOM)) + 2
  const rows = Math.ceil(height / (cell * MIN_ZOOM)) + 2
  const periodX = columns * cell
  const periodY = rows * cell

  const tiles = []
  if (width) {
    const copies = new Map()
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const seed = row * 31 + column * 7 + 1
        const photo = photos[(row * 3 + column * 2) % photos.length]
        const copy = copies.get(photo.id) ?? 0
        copies.set(photo.id, copy + 1)
        const size = cell * (0.48 + hash(seed) * 0.26)
        const ratio = clamp(0.62, 1.6, ratioOf(photo.url) ?? 1.25)
        tiles.push({
          key: `${row}-${column}`,
          photo,
          copy,
          width: size,
          height: size * ratio,
          x: column * cell - periodX / 2 + (hash(seed + 2) - 0.5) * cell * 0.4,
          y: row * cell - periodY / 2 + (hash(seed + 5) - 0.5) * cell * 0.4,
          depth: 0.85 + hash(seed + 9) * 0.3,
          periodX,
          periodY,
        })
      }
    }
  }

  useEffect(() => {
    const node = stage.current
    if (!node) return
    const listen = (event) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      zoomTarget.set(clamp(MIN_ZOOM, MAX_ZOOM, zoomTarget.get() * Math.exp(-event.deltaY * 0.01)))
    }
    node.addEventListener('wheel', listen, { passive: false })
    return () => node.removeEventListener('wheel', listen)
  }, [zoomTarget])

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={ref}
        {...pan.bind}
        onDoubleClick={() => zoomTarget.set(zoomTarget.get() > 1.2 ? 1 : 1.6)}
        className="relative cursor-grab touch-none overflow-hidden active:cursor-grabbing"
        style={{ height }}
      >
        {tiles.map((tile) => (
          <Tile key={tile.key} tile={tile} x={x} y={y} zoom={zoom} stage={{ width, height }} />
        ))}
      </div>
      {addTile}
    </div>
  )
}
