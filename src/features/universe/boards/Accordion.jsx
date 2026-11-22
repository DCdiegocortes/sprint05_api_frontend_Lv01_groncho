import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import Photo from './Photo.jsx'
import { stageHeight, useStageBox } from './motion.js'

const OPEN = 5
const NEIGHBOUR = 1.7
const spring = { stiffness: 260, damping: 20, mass: 0.6 }

function Strip({ photo, index, open }) {
  const grow = useSpring(
    useTransform(open, (active) => {
      if (active < 0) return 1
      const distance = Math.abs(index - active)
      return distance === 0 ? OPEN : distance === 1 ? NEIGHBOUR : 1
    }),
    spring,
  )
  const lift = useTransform(grow, [1, OPEN], [1.12, 1])

  return (
    <motion.div
      className="h-full min-w-0"
      style={{ flexGrow: grow, flexBasis: 0 }}
      onPointerEnter={(event) => event.pointerType === 'mouse' && open.set(index)}
      onClick={() => open.set(open.get() === index ? -1 : index)}
    >
      <Photo photo={photo} className="size-full rounded-[18px] shadow-subtle" imageStyle={{ scale: lift }} />
    </motion.div>
  )
}

export default function Accordion({ photos, addTile, fill = false }) {
  const { ref, width, filled } = useStageBox(fill)
  const open = useMotionValue(-1)

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={ref}
        onPointerLeave={(event) => event.pointerType === 'mouse' && open.set(-1)}
        className="flex gap-2"
        style={{ height: Math.max(stageHeight(width, 0.56, 280, 680), filled ?? 0) }}
      >
        {photos.map((photo, index) => (
          <Strip key={photo.id} photo={photo} index={index} open={open} />
        ))}
      </div>
      {addTile}
    </div>
  )
}
