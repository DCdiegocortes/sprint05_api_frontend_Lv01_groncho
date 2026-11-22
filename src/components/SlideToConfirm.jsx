import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'

const KNOB = 50
const CONFIRM_AT = 0.85

export default function SlideToConfirm({ label, icon: Icon, disabled, onConfirm }) {
  const track = useRef(null)
  const [range, setRange] = useState(300)
  const x = useMotionValue(0)
  const hint = useTransform(x, [0, range * 0.5], [1, 0])
  const trail = useTransform(x, (value) => value + KNOB)

  useEffect(() => {
    const measure = () => setRange(Math.max(120, (track.current?.offsetWidth ?? 392) - KNOB - 12))
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const release = () => {
    if (x.get() >= range * CONFIRM_AT) {
      animate(x, range, { duration: 0.16, ease: [0.23, 1, 0.32, 1] }).then(onConfirm)
    } else {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 34 })
    }
  }

  return (
    <div ref={track} className="relative flex h-[62px] w-full items-center rounded-full bg-paper px-1.5 shadow-inset">
      <motion.span aria-hidden="true" style={{ width: trail }} className="absolute top-1.5 left-1.5 h-[50px] rounded-full bg-accent/15" />
      <motion.span style={{ opacity: hint }} className="label-mono pointer-events-none absolute inset-0 grid place-items-center pl-10">
        {label}
      </motion.span>
      <motion.button
        type="button"
        aria-label={label}
        disabled={disabled}
        drag="x"
        dragConstraints={{ left: 0, right: range }}
        dragElastic={0.04}
        dragMomentum={false}
        onDragEnd={release}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onConfirm()
          }
        }}
        style={{ x }}
        className="relative grid size-[50px] cursor-grab touch-none place-items-center rounded-full bg-accent text-white shadow-accent active:cursor-grabbing"
      >
        <Icon className="size-[18px]" strokeWidth={1.8} />
      </motion.button>
    </div>
  )
}
