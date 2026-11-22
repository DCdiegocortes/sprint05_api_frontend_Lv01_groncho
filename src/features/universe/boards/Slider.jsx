import { useLayoutEffect, useRef } from 'react'
import { useMotionValueEvent, useSpring } from 'motion/react'
import Photo from './Photo.jsx'
import { clamp, repeatPhotos, stageHeight, useHorizontalWheel, usePan, useReordering, wrap, useStageBox } from './motion.js'

const PEAK = 2.4
const FLOOR = 0.4

function scaleAt(d) {
  if (d >= 0) return 1 + (PEAK - 1) * (1 - Math.min(d, 1)) ** 2
  return FLOOR + (PEAK - FLOOR) * (1 + Math.max(d, -1)) ** 2
}

function warp(d) {
  if (d >= 0) {
    const t = Math.min(d, 1)
    return t + ((PEAK - 1) * (1 - (1 - t) ** 3)) / 3 + Math.max(d - 1, 0)
  }
  const t = Math.max(d, -1)
  return -(-FLOOR * t + ((PEAK - FLOOR) * (1 - (1 + t) ** 3)) / 3) + Math.min(d + 1, 0) * FLOOR
}

export default function Slider({ photos, addTile, fill = false }) {
  const { ref, node: stage, width, filled } = useStageBox(fill)
  const slides = useRef([])
  const reordering = useReordering()
  const { x, bind, nudge } = usePan({ axis: 'x', disabled: reordering, friction: 0.95 })
  const offset = useSpring(x, { stiffness: 140, damping: 26, mass: 0.6 })

  const base = clamp(64, 260, Math.max(width * 0.13, ((filled ?? 0) * 0.86) / PEAK / 1.3))
  const tall = base * 1.3
  const gap = Math.max(8, base * 0.12)
  const step = base + gap
  const height = Math.max(stageHeight(width, 0.5, 220, tall * PEAK + 40), filled ?? 0)
  const span = Math.max(width * 2.4, step * photos.length)
  const items = repeatPhotos(photos, Math.ceil(span / step))
  const period = items.length * step

  const layout = (value) => {
    if (!width) return
    const half = width / 2
    const lo = half - period * 0.62
    items.forEach((_, index) => {
      const node = slides.current[index]
      if (!node) return
      const center = wrap(lo, lo + period, index * step + value)
      const d = (center - half) / half
      const s = scaleAt(d)
      const left = half + warp(d) * half
      node.style.transform = `translate3d(${left - base / 2}px, ${-tall / 2}px, 0) scale(${s})`
      node.style.opacity = String(d < 0 ? clamp(0.25, 1, 1 + d * 0.75) : 1)
      node.style.zIndex = String(Math.round(s * 10))
      node.style.visibility = Math.abs(warp(d) * half) > width ? 'hidden' : 'visible'
    })
  }

  useMotionValueEvent(offset, 'change', layout)
  useLayoutEffect(() => layout(offset.get()))
  useHorizontalWheel(stage, (event) => nudge(-(event.deltaX || event.deltaY)))

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={ref}
        {...bind}
        className="relative cursor-grab touch-pan-y overflow-hidden rounded-[24px] active:cursor-grabbing"
        style={{ height }}
      >
        {items.map((item, index) => (
          <div
            key={item.key}
            ref={(node) => {
              slides.current[index] = node
            }}
            className="absolute top-1/2 left-0 origin-center"
            style={{ width: base, height: tall }}
          >
            <Photo photo={item.photo} copy={item.copy} className="size-full rounded-[12px] shadow-subtle" />
          </div>
        ))}
      </div>
      {addTile}
    </div>
  )
}
