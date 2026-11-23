import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react'
import { ChevronsLeftRight, Heart, X } from 'lucide-react'

const THRESHOLD = 0.4
const spring = { type: 'spring', stiffness: 400, damping: 30 }

export default function SwipeBar({ x, disabled, onDecide }) {
  const track = useRef(null)
  const [range, setRange] = useState(150)
  const [side, setSide] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [nudged, setNudged] = useState(false)
  const engaged = hovered || pressed || nudged || side !== 0
  const local = useMotionValue(0)

  useEffect(() => {
    if (!pressed) return undefined
    const release = () => setPressed(false)
    window.addEventListener('pointerup', release)
    window.addEventListener('pointercancel', release)
    return () => {
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', release)
    }
  }, [pressed])

  useEffect(() => {
    if (!nudged) return undefined
    const timer = setTimeout(() => setNudged(false), 900)
    return () => clearTimeout(timer)
  }, [nudged])
  const progress = useTransform(local, (value) => value / range)
  const likeOpacity = useTransform(progress, [0, 0.4], [0.4, 1])
  const nopeOpacity = useTransform(progress, [-0.4, 0], [1, 0.4])

  useEffect(() => {
    const measure = () => setRange(Math.max(60, (track.current?.offsetWidth ?? 300) / 2 - 33))
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useMotionValueEvent(local, 'change', (value) => {
    x.set(value / range)
    setSide(value > 12 ? 1 : value < -12 ? -1 : 0)
  })

  const commit = (liked) => {
    animate(local, liked ? range : -range, { duration: 0.18, ease: [0.23, 1, 0.32, 1] }).then(() => {
      onDecide(liked)
      local.set(0)
    })
  }

  useEffect(() => {
    const onKey = (event) => {
      if (disabled || event.target.closest?.('input, textarea')) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') setNudged(true)
      if (event.key === 'ArrowRight') commit(true)
      if (event.key === 'ArrowLeft') commit(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <motion.div
      className="flex flex-col gap-1"
      initial={false}
      animate={{ opacity: engaged ? 1 : 0.28 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onPointerDown={() => setPressed(true)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div className="flex justify-between px-1">
        <motion.span style={{ opacity: nopeOpacity }} className="font-mono text-[11px] font-medium tracking-[0.16em] text-secondary uppercase">
          Nope
        </motion.span>
        <motion.span style={{ opacity: likeOpacity }} className="font-mono text-[11px] font-medium tracking-[0.16em] text-secondary uppercase">
          Like
        </motion.span>
      </div>
      <div ref={track} className="relative flex h-[66px] items-center justify-center">
        <span className="absolute inset-x-0 h-2 rounded-full bg-paper shadow-inset" />
        <motion.button
          type="button"
          aria-label="Drag right to like, left to nope"
          disabled={disabled}
          drag={disabled ? false : 'x'}
          dragConstraints={{ left: -range, right: range }}
          dragElastic={0.08}
          dragMomentum={false}
          style={{ x: local }}
          onDragEnd={() => {
            const value = local.get() / range
            if (value > THRESHOLD) return commit(true)
            if (value < -THRESHOLD) return commit(false)
            animate(local, 0, spring)
          }}
          whileTap={{ scale: 0.97 }}
          className="relative z-10 grid size-[66px] cursor-grab touch-none place-items-center rounded-full bg-paper shadow-raised active:cursor-grabbing disabled:opacity-60"
        >
          {side === 1 ? (
            <Heart className="size-6 fill-accent text-accent" strokeWidth={1.5} />
          ) : side === -1 ? (
            <X className="size-6 text-ink" strokeWidth={1.6} />
          ) : (
            <ChevronsLeftRight className="size-6 text-ink" strokeWidth={1.5} />
          )}
        </motion.button>
      </div>
      <div className="sr-only">
        <button type="button" onClick={() => commit(false)} disabled={disabled}>
          Nope
        </button>
        <button type="button" onClick={() => commit(true)} disabled={disabled}>
          Like
        </button>
      </div>
    </motion.div>
  )
}
