import { motion, useTransform } from 'motion/react'
import Photo from './Photo.jsx'
import { clamp, repeatPhotos, stageHeight, useClock, usePan, useReordering, wrap, useStageBox } from './motion.js'

const ZOOM = 1.45

function Card({ item, index, step, span, offset, width, height, plain }) {
  const left = useTransform(offset, (value) => wrap(-step, span - step, index * step + value))
  const style = { x: left, width, height, marginTop: -height / 2 }

  if (plain) {
    return (
      <motion.div className="absolute top-1/2 left-0 overflow-hidden rounded-[18px]" style={style}>
        <img src={item.photo.url} alt="" draggable={false} className="size-full object-cover" />
      </motion.div>
    )
  }

  return (
    <motion.div className="absolute top-1/2 left-0" style={style}>
      <Photo photo={item.photo} copy={item.copy} className="size-full rounded-[18px] shadow-subtle" />
    </motion.div>
  )
}

export default function LiquidGlass({ photos, addTile, fill = false }) {
  const { ref, width, filled } = useStageBox(fill)
  const reordering = useReordering()
  const { x, bind } = usePan({ axis: 'x', disabled: reordering })
  const drift = useClock({ speed: -0.035, paused: reordering })
  const offset = useTransform([x, drift], ([pan, time]) => pan + time)

  const height = Math.max(stageHeight(width, 0.56, 240, 660), filled ?? 0)
  const cardHeight = height * 0.88
  const cardWidth = clamp(100, 560, Math.min(cardHeight / 1.25, width * 0.32))
  const step = cardWidth + 12
  const items = repeatPhotos(photos, Math.ceil((width + step * 2) / step))
  const span = items.length * step
  const lens = Math.min(cardHeight * 0.95, width * 0.5)
  const row = (plain) =>
    items.map((item, index) => (
      <Card
        key={item.key}
        item={item}
        index={index}
        step={step}
        span={span}
        offset={offset}
        width={cardWidth}
        height={cardHeight}
        plain={plain}
      />
    ))

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={ref}
        {...bind}
        className="relative cursor-grab touch-pan-y overflow-hidden rounded-[24px] active:cursor-grabbing"
        style={{ height }}
      >
        {width > 0 && row(false)}
        {width > 0 && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 z-10 overflow-hidden rounded-full"
            style={{
              width: lens,
              height: lens,
              marginLeft: -lens / 2,
              marginTop: -lens / 2,
              boxShadow:
                '0 18px 40px rgb(0 0 0 / 0.22), inset 0 0 0 1.5px rgb(255 255 255 / 0.85), inset 8px 0 14px rgb(255 45 120 / 0.22), inset -8px 0 14px rgb(70 150 255 / 0.22), inset 0 10px 18px rgb(255 255 255 / 0.5)',
            }}
          >
            <div
              className="absolute"
              style={{
                width,
                height,
                left: -(width - lens) / 2,
                top: -(height - lens) / 2,
                transform: `scale(${ZOOM})`,
                transformOrigin: '50% 50%',
                filter: 'saturate(1.25) contrast(1.05)',
              }}
            >
              {row(true)}
            </div>
            <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgb(255_255_255/0.45),transparent_45%)]" />
          </div>
        )}
      </div>
      {addTile}
    </div>
  )
}
