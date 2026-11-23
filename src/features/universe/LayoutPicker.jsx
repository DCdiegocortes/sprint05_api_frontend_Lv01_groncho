import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react'
import { UniverseLayout } from '@/lib/constants.js'
import { cn } from '@/lib/utils'
import { layoutName, layouts } from './layouts.js'
import UniverseBoard from './UniverseBoard.jsx'

function Tile({ photos, index, className, style }) {
  const photo = photos.length ? photos[index % photos.length] : null
  return (
    <span
      className={cn('block overflow-hidden rounded-[5px] bg-plate bg-cover bg-center', className)}
      style={{
        ...style,
        backgroundImage: photo ? `url(${photo.url})` : undefined,
      }}
    />
  )
}

export function Thumb({ value, photos }) {
  const t = (index, className, style) => <Tile key={index} photos={photos} index={index} className={className} style={style} />

  switch (value) {
    case UniverseLayout.ACCORDION:
      return <div className="flex h-full gap-1">{[t(0, 'flex-[4]'), t(1, 'flex-1'), t(2, 'flex-1'), t(3, 'flex-1')]}</div>
    case UniverseLayout.CAROUSEL:
      return <div className="flex h-full items-center gap-1">{[t(1, 'h-[72%] w-3'), t(0, 'h-full flex-1'), t(2, 'h-[72%] w-3')]}</div>
    case UniverseLayout.SLIDER:
      return (
        <div className="flex h-full items-center gap-1">
          {[t(0, 'h-[80%] w-[45%] shrink-0'), t(1, 'h-[80%] w-[45%] shrink-0'), t(2, 'h-[80%] w-[20%] shrink-0')]}
        </div>
      )
    case UniverseLayout.ROTUNDA:
      return (
        <div className="flex h-full items-center justify-center gap-0.5 [perspective:200px]">
          {[-2, -1, 0, 1, 2].map((offset, i) =>
            t(i, 'h-[78%] w-[17%]', {
              transform: `rotateY(${offset * -24}deg) scale(${1 - Math.abs(offset) * 0.08})`,
            }),
          )}
        </div>
      )
    case UniverseLayout.IMAGE_GRID:
      return <div className="grid h-full grid-cols-3 grid-rows-2 gap-1">{[0, 1, 2, 3, 4, 5].map((i) => t(i, ''))}</div>
    case UniverseLayout.FLOATING:
      return (
        <div className="relative h-full">
          {t(0, 'absolute top-0 left-0 h-[55%] w-[45%] -rotate-6 shadow-subtle')}
          {t(1, 'absolute top-[8%] right-0 h-[50%] w-[42%] rotate-6 shadow-subtle')}
          {t(2, 'absolute bottom-0 left-[28%] h-[48%] w-[40%] rotate-2 shadow-subtle')}
        </div>
      )
    case UniverseLayout.SCROLL_BULGE:
      return (
        <div className="flex h-full flex-col items-center justify-center gap-1">
          {[t(0, 'h-[18%] w-[62%]'), t(1, 'h-[44%] w-full'), t(2, 'h-[18%] w-[62%]')]}
        </div>
      )
    case UniverseLayout.LIQUID_GLASS:
      return (
        <div className="relative flex h-full items-center gap-1">
          {[0, 1, 2, 3].map((i) => t(i, 'h-[78%] flex-1'))}
          <span className="absolute top-1/2 left-1/2 size-10 -translate-1/2 rounded-full shadow-float ring-2 ring-white/90" />
        </div>
      )
    case UniverseLayout.INFINITE:
      return (
        <div className="grid h-full grid-cols-4 gap-1">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => t(i, cn('h-[46%]', i % 2 && 'translate-y-1.5'), { height: '100%' }))}
        </div>
      )
    default:
      return (
        <div className="flex h-full gap-1">
          <div className="flex flex-1 flex-col gap-1">{[t(0, 'flex-[3]'), t(2, 'flex-[2]')]}</div>
          <div className="flex flex-1 flex-col gap-1">{[t(1, 'flex-[2]'), t(3, 'flex-[3]')]}</div>
        </div>
      )
  }
}

function Preview({ universe, layout, left }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.98, transition: { duration: 0.12 } }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      style={{ left }}
      className="pointer-events-none absolute bottom-full z-30 mb-2 w-[260px] origin-bottom rounded-[24px] bg-card p-2.5 shadow-float"
    >
      <div className="flex items-center justify-between px-1.5 pb-2">
        <span className="label-mono text-[10px]">Preview</span>
        <span className="flex items-center gap-2 font-mono text-[10px] font-medium tracking-[0.16em] text-ink/70 uppercase">
          <span aria-hidden="true" className="size-[5px] shrink-0 rounded-full bg-accent" />
          {layoutName(layout)}
        </span>
      </div>
      <div className="max-h-[300px] overflow-hidden rounded-2xl">
        <UniverseBoard universe={{ ...universe, layout }} />
      </div>
    </motion.div>
  )
}

const CARD_WIDTH = 116
const MAX_SCALE = 1.85
const REACH = 300
const dockSpring = { mass: 0.1, stiffness: 170, damping: 14 }

function dockScale(distance) {
  const d = Math.min(Math.abs(distance), REACH) / REACH
  const falloff = (Math.cos(d * Math.PI) + 1) / 2
  return 1 + (MAX_SCALE - 1) * falloff
}

function DockCard({ mouseX, selected, className, children, ...props }) {
  const ref = useRef(null)
  const target = useTransform(mouseX, (x) => {
    const box = ref.current?.getBoundingClientRect()
    if (!box || !Number.isFinite(x)) return 1
    return dockScale(x - box.left - box.width / 2)
  })
  const scale = useSpring(target, dockSpring)
  const slot = useTransform(scale, (s) => CARD_WIDTH * s)
  const zIndex = useTransform(scale, (s) => Math.round(s * 100))
  const lift = useTransform(scale, [1, MAX_SCALE], [0, 0.16])
  const shadowY = useTransform(lift, (l) => l * 50)
  const shadowBlur = useTransform(lift, (l) => 16 + l * 80)
  const shadow = useMotionTemplate`4px 4px 10px rgb(0 0 0 / 0.1), -3px -3px 8px rgb(255 255 255 / 0.88), 0 ${shadowY}px ${shadowBlur}px rgb(0 0 0 / ${lift})`

  return (
    <motion.div ref={ref} style={{ width: slot, zIndex }} className="relative shrink-0 snap-start">
      <motion.button
        style={{
          width: CARD_WIDTH,
          scale,
          originX: 0,
          originY: 1,
          boxShadow: selected ? undefined : shadow,
        }}
        className={className}
        {...props}
      >
        {children}
      </motion.button>
    </motion.div>
  )
}

export default function LayoutPicker({ value, onChange, photos = [], universe }) {
  const [preview, setPreview] = useState(null)
  const mouseX = useMotionValue(Infinity)
  const holdTimer = useRef(null)
  const held = useRef(false)
  const wrapper = useRef(null)

  const show = (layout, target) => {
    if (!universe || !photos.length) return
    const box = wrapper.current.getBoundingClientRect()
    const card = target.getBoundingClientRect()
    const left = Math.min(Math.max(card.left - box.left + card.width / 2 - 130, 0), box.width - 260)
    setPreview({ layout, left })
  }

  const hide = () => {
    clearTimeout(holdTimer.current)
    setPreview(null)
  }

  return (
    <div ref={wrapper} className="relative isolate">
      <AnimatePresence>{preview && <Preview key={preview.layout} universe={universe} layout={preview.layout} left={preview.left} />}</AnimatePresence>
      <div
        role="radiogroup"
        aria-label="Layout"
        onMouseMove={(event) => mouseX.set(event.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="no-scrollbar -mx-6 flex snap-x scroll-px-6 items-end gap-3 overflow-x-auto px-6 pt-2 pb-5 md:pointer-events-none md:-mt-36 md:pt-38 md:*:pointer-events-auto"
      >
        {layouts.map((layout) => {
          const selected = layout.value === value
          return (
            <DockCard
              key={layout.value}
              mouseX={mouseX}
              selected={selected}
              type="button"
              role="radio"
              aria-checked={selected}
              onPointerDown={(event) => {
                if (event.pointerType === 'mouse') return
                held.current = false
                const target = event.currentTarget
                holdTimer.current = setTimeout(() => {
                  held.current = true
                  show(layout.value, target)
                }, 320)
              }}
              onPointerUp={(event) => {
                if (event.pointerType === 'mouse') return
                clearTimeout(holdTimer.current)
                if (held.current) setPreview(null)
              }}
              onPointerCancel={hide}
              onContextMenu={(event) => event.preventDefault()}
              onClick={() => {
                if (held.current) {
                  held.current = false
                  return
                }
                hide()
                onChange(layout.value)
              }}
              className={cn(
                'relative flex flex-col gap-2.5 rounded-[20px] p-2 text-left transition-[background-color] duration-220 ease-ui',
                selected ? 'bg-card shadow-raised' : 'bg-paper',
              )}
            >
              {selected && <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[20px] border-[1.5px] border-accent" />}
              <span className="block h-[79px] overflow-hidden rounded-[14px] bg-paper p-1.5 shadow-inset">
                <Thumb value={layout.value} photos={photos} />
              </span>
              <span className="flex min-w-0 flex-col gap-1 px-1 pb-1">
                <span className="truncate text-[13px] leading-tight font-semibold whitespace-nowrap text-ink">{layout.name}</span>
                <span className={cn('label-mono truncate text-[10px] leading-snug tracking-[0.04em] whitespace-nowrap', selected && 'text-ink/70')}>
                  {layout.hint}
                </span>
              </span>
            </DockCard>
          )
        })}
      </div>
    </div>
  )
}
