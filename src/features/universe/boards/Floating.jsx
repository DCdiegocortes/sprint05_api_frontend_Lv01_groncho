import { useState } from 'react'
import { AnimatePresence, motion, useTransform } from 'motion/react'
import { useImageRatios } from '@/hooks/useImageRatios.js'
import Photo from './Photo.jsx'
import { clamp, hash, stageHeight, useClock, useReordering, wrap, useStageBox } from './motion.js'

const slots = [
  { left: 0.04, top: 0.02, size: 0.3, tilt: -5 },
  { left: 0.4, top: 0.12, size: 0.24, tilt: 4 },
  { left: 0.7, top: 0.0, size: 0.27, tilt: -3 },
  { left: 0.16, top: 0.52, size: 0.25, tilt: 3 },
  { left: 0.5, top: 0.6, size: 0.3, tilt: -4 },
  { left: 0.78, top: 0.5, size: 0.2, tilt: 6 },
]

function Card({ photo, index, clock, width, height, ratio, dimmed, onPick }) {
  const slot = slots[index % slots.length]
  const lap = Math.floor(index / slots.length)
  const cardWidth = clamp(80, 380, width * slot.size)
  const cardHeight = cardWidth * ratio
  const speed = 0.012 + hash(index + 3) * 0.016
  const startY = (slot.top + lap * 0.33) * height
  const y = useTransform(clock, (time) => wrap(-cardHeight - 20, height + 20, startY + time * speed))

  return (
    <motion.button
      type="button"
      onClick={(event) => onPick(photo, event.currentTarget.getBoundingClientRect())}
      className="absolute top-0 cursor-zoom-in"
      style={{ left: `${slot.left * 100}%`, width: cardWidth, height: cardHeight, y, rotate: slot.tilt }}
      animate={{ opacity: dimmed ? 0.3 : 1 }}
      whileHover={{ scale: 1.04 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
    >
      <Photo photo={photo} className="size-full rounded-[18px] shadow-float" />
    </motion.button>
  )
}

export default function Floating({ photos, addTile, fill = false }) {
  const { ref, node: stage, width, filled } = useStageBox(fill)
  const ratioOf = useImageRatios(photos.map((photo) => photo.url))
  const reordering = useReordering()
  const [picked, setPicked] = useState(null)
  const clock = useClock({ speed: 1, paused: reordering || Boolean(picked) })
  const height = Math.max(stageHeight(width, 0.68, 360, 820), filled ?? 0)

  const pick = (photo, rect) => {
    const box = stage.current?.getBoundingClientRect()
    if (!box) return
    setPicked({ photo, from: { x: rect.left - box.left + rect.width / 2 - box.width / 2, y: rect.top - box.top + rect.height / 2 - box.height / 2, width: rect.width } })
  }

  const bigWidth = Math.min(width * 0.62, (height * 0.82) / clamp(0.62, 1.6, ratioOf(picked?.photo.url) ?? 1.25))

  return (
    <div className="flex flex-col gap-3">
      <div ref={ref} className="relative overflow-hidden rounded-[24px]" style={{ height }}>
        {width > 0 &&
          photos.map((photo, index) => (
            <Card
              key={photo.id}
              photo={photo}
              index={index}
              clock={clock}
              width={width}
              height={height}
              ratio={clamp(0.62, 1.6, ratioOf(photo.url) ?? 1.25)}
              dimmed={Boolean(picked)}
              onPick={pick}
            />
          ))}
        <AnimatePresence>
          {picked && (
            <motion.button
              key={picked.photo.id}
              type="button"
              aria-label="Close photo"
              onClick={() => setPicked(null)}
              className="absolute inset-0 z-10 m-auto h-fit cursor-zoom-out overflow-hidden rounded-[22px] shadow-float"
              style={{ width: bigWidth }}
              initial={{ x: picked.from.x, y: picked.from.y, scale: picked.from.width / bigWidth, opacity: 0.6 }}
              animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              <img src={picked.photo.url} alt="" draggable={false} className="block w-full" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      {addTile}
    </div>
  )
}
