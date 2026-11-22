import { motion, useSpring, useTransform } from 'motion/react'
import Photo from './Photo.jsx'
import { clamp, repeatPhotos, stageHeight, usePan, useReordering, wrap, useStageBox } from './motion.js'

function Slide({ item, index, step, span, offset, bend, stage, width, height }) {
  const top = useTransform(offset, (value) => wrap(-step, span - step, index * step + value))
  const distance = useTransform(top, (value) => clamp(-1.4, 1.4, (value + height / 2 - stage / 2) / (stage / 2)))
  const transform = useTransform([distance, bend], ([d, b]) => {
    const pull = 1 - Math.min(Math.abs(d), 1)
    return `perspective(900px) rotateX(${-d * (6 + b * 34)}deg) scale(${1 + b * 0.16 * pull}, ${1 + b * 0.06 * pull})`
  })
  const opacity = useTransform(distance, [-1.3, -0.9, 0.9, 1.3], [0.2, 1, 1, 0.2])

  return (
    <motion.div className="absolute top-0 left-1/2" style={{ y: top, width, height, marginLeft: -width / 2, opacity }}>
      <motion.div className="size-full" style={{ transform }}>
        <Photo photo={item.photo} copy={item.copy} className="size-full rounded-[22px] shadow-subtle" />
      </motion.div>
    </motion.div>
  )
}

export default function Bulge({ photos, addTile, fill = false }) {
  const { ref, width, filled } = useStageBox(fill)
  const reordering = useReordering()
  const { y, velocity, bind } = usePan({ axis: 'y', disabled: reordering, friction: 0.95 })
  const bend = useSpring(
    useTransform(velocity, (value) => clamp(0, 1, Math.abs(value) * 0.55)),
    { stiffness: 180, damping: 22 },
  )

  const stage = Math.max(stageHeight(width, 0.72, 360, 800), filled ?? 0)
  const slideWidth = width * 0.94
  const slideHeight = Math.min(slideWidth * 0.58, stage * 0.6)
  const gap = 18
  const step = slideHeight + gap
  const items = repeatPhotos(photos, Math.ceil(stage / step) + 2)

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={ref}
        {...bind}
        className="relative cursor-grab touch-none overflow-hidden rounded-[24px] active:cursor-grabbing"
        style={{ height: stage }}
      >
        {width > 0 &&
          items.map((item, index) => (
            <Slide
              key={item.key}
              item={item}
              index={index}
              step={step}
              span={items.length * step}
              offset={y}
              bend={bend}
              stage={stage}
              width={slideWidth}
              height={slideHeight}
            />
          ))}
      </div>
      {addTile}
    </div>
  )
}
