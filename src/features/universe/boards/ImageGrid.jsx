import { useRef } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useElementWidth } from '@/hooks/useElementWidth.js'
import Photo from './Photo.jsx'

const spring = { stiffness: 220, damping: 22, mass: 0.6 }

function influence(distance, reach) {
  const d = distance / reach
  if (d <= 0.55) return 1
  if (d >= 1) return 0
  const t = (d - 0.55) / 0.45
  return 1 - t * t * (3 - 2 * t)
}

function Tile({ photo, pointer, reach }) {
  const ref = useRef(null)
  const near = useSpring(
    useTransform(pointer, ([px, py]) => {
      const node = ref.current
      if (!node || !Number.isFinite(px)) return 0
      const cx = node.offsetLeft + node.offsetWidth / 2
      const cy = node.offsetTop + node.offsetHeight / 2
      return influence(Math.hypot(px - cx, py - cy), reach)
    }),
    spring,
  )
  const scale = useTransform(near, [0, 1], [0.88, 1.32])
  const zIndex = useTransform(near, (value) => Math.round(value * 100))
  const grey = useTransform(near, [0, 1], [0.85, 0])
  const filter = useMotionTemplate`grayscale(${grey})`
  const shadow = useTransform(near, (value) => `0 ${value * 18}px ${16 + value * 30}px rgb(0 0 0 / ${0.06 + value * 0.16})`)

  return (
    <motion.div ref={ref} className="relative aspect-[4/5] rounded-[14px]" style={{ scale, zIndex, boxShadow: shadow }}>
      <Photo photo={photo} className="size-full rounded-[14px]" imageStyle={{ filter }} />
    </motion.div>
  )
}

export default function ImageGrid({ photos, addTile }) {
  const [ref, width] = useElementWidth()
  const pointer = useMotionValue([Infinity, Infinity])
  const columns = width >= 1100 ? 6 : width >= 760 ? 5 : width >= 420 ? 4 : 3
  const reach = Math.max(140, width * 0.26)

  const track = (event) => {
    const box = event.currentTarget.getBoundingClientRect()
    pointer.set([event.clientX - box.left, event.clientY - box.top])
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={ref}
        onPointerMove={track}
        onPointerDown={track}
        onPointerLeave={() => pointer.set([Infinity, Infinity])}
        className="relative grid gap-2.5 py-4"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {photos.map((photo) => (
          <Tile key={photo.id} photo={photo} pointer={pointer} reach={reach} />
        ))}
      </div>
      {addTile}
    </div>
  )
}
