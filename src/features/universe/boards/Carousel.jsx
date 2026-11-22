import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import Photo from './Photo.jsx'
import { clamp, repeatPhotos, stageHeight, useClock, usePan, useReordering, useStageBox } from './motion.js'

function Card({ item, index, count, turn, radius, width, height }) {
  const step = 360 / count
  const angle = useTransform(turn, (value) => value + index * step)
  const transform = useTransform(angle, (value) => {
    const rad = (value * Math.PI) / 180
    const x = Math.sin(rad) * radius
    const z = (Math.cos(rad) - 1) * radius
    return `translate3d(${x}px, 0, ${z}px) rotateY(${Math.sin(rad) * 16}deg)`
  })
  const depth = useTransform(angle, (value) => Math.cos((value * Math.PI) / 180))
  const zIndex = useTransform(depth, (value) => Math.round((value + 1) * 50))
  const brightness = useTransform(depth, [-1, 1], [0.55, 1])
  const filter = useTransform(brightness, (value) => `brightness(${value})`)

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      style={{ width, height, marginLeft: -width / 2, marginTop: -height / 2, transform, zIndex, filter }}
    >
      <Photo photo={item.photo} copy={item.copy} className="size-full rounded-[20px] shadow-float" />
    </motion.div>
  )
}

export default function Carousel({ photos, addTile, fill = false }) {
  const { ref, width, filled } = useStageBox(fill)
  const reordering = useReordering()
  const { x, dragging, bind } = usePan({ axis: 'x', disabled: reordering })
  const drift = useClock({ speed: 0.006, paused: reordering })
  const turn = useTransform([x, drift], ([pan, time]) => pan * 0.35 + time)
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const leanX = useSpring(useTransform(pointerY, [-1, 1], [9, -9]), { stiffness: 120, damping: 18 })
  const leanY = useSpring(useTransform(pointerX, [-1, 1], [-12, 12]), { stiffness: 120, damping: 18 })

  const height = Math.max(stageHeight(width, 0.6, 300, 680), filled ?? 0)
  const cardWidth = clamp(120, 860, Math.min(width * 0.42, (height * 0.94) / 1.08))
  const cardHeight = cardWidth * 1.08
  const items = repeatPhotos(photos, 6)
  const radius = Math.max(cardWidth * 1.15, width * 0.5, (items.length * cardWidth * 0.62) / (2 * Math.PI))

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={ref}
        {...bind}
        onPointerMove={(event) => {
          bind.onPointerMove(event)
          if (dragging.get()) return
          const box = event.currentTarget.getBoundingClientRect()
          pointerX.set(((event.clientX - box.left) / box.width) * 2 - 1)
          pointerY.set(((event.clientY - box.top) / box.height) * 2 - 1)
        }}
        onPointerLeave={() => {
          pointerX.set(0)
          pointerY.set(0)
        }}
        className="relative cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing"
        style={{ height, perspective: 1100 }}
      >
        <motion.div className="absolute inset-0" style={{ rotateX: leanX, rotateY: leanY, transformStyle: 'preserve-3d' }}>
          {items.map((item, index) => (
            <Card
              key={item.key}
              item={item}
              index={index}
              count={items.length}
              turn={turn}
              radius={radius}
              width={cardWidth}
              height={cardHeight}
            />
          ))}
        </motion.div>
      </div>
      {addTile}
    </div>
  )
}
