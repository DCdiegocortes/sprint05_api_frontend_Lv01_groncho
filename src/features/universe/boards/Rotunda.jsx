import { motion, useTransform } from 'motion/react'
import Photo from './Photo.jsx'
import { clamp, repeatPhotos, stageHeight, useClock, usePan, useReordering, wrap, useStageBox } from './motion.js'

const VISIBLE = 74

function Panel({ item, index, step, turn, radius, width, height }) {
  const angle = useTransform(turn, (value) => wrap(-180, 180, index * step - value))
  const transform = useTransform(angle, (value) => `translateZ(${radius}px) rotateY(${value}deg) translateZ(${-radius}px)`)
  const visibility = useTransform(angle, (value) => (Math.abs(value) < VISIBLE ? 'visible' : 'hidden'))
  const filter = useTransform(angle, (value) => `brightness(${1 - Math.min(Math.abs(value) / VISIBLE, 1) * 0.25})`)

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      style={{ width, height, marginLeft: -width / 2, marginTop: -height / 2, transform, visibility, filter }}
    >
      <Photo photo={item.photo} copy={item.copy} className="size-full rounded-[10px]" />
    </motion.div>
  )
}

export default function Rotunda({ photos, addTile, fill = false }) {
  const { ref, width, filled } = useStageBox(fill)
  const reordering = useReordering()
  const { x, bind } = usePan({ axis: 'x', disabled: reordering })
  const drift = useClock({ speed: 0.004, paused: reordering })

  const height = Math.max(stageHeight(width, 0.56, 260, 680), filled ?? 0)
  const panelHeight = height * 0.9
  const panelWidth = clamp(100, 560, Math.min(width * 0.24, panelHeight * 0.66))
  const radius = panelWidth * 2.8
  const gap = panelWidth * 0.08
  const count = Math.max(photos.length, Math.ceil((2 * Math.PI * radius) / (panelWidth + gap)))
  const items = repeatPhotos(photos, count)
  const step = 360 / items.length
  const degreesPerPixel = 180 / (Math.PI * radius)
  const turn = useTransform([x, drift], ([pan, time]) => -pan * degreesPerPixel + time)

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={ref}
        {...bind}
        className="relative cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing"
        style={{ height, perspective: radius }}
      >
        {items.map((item, index) => (
          <Panel
            key={item.key}
            item={item}
            index={index}
            step={step}
            turn={turn}
            radius={radius}
            width={panelWidth}
            height={panelHeight}
          />
        ))}
      </div>
      {addTile}
    </div>
  )
}
