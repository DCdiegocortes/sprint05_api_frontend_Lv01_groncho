import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Panel, PanelTitle } from '@/components/ui/panel.jsx'
import { useMediaQuery } from '@/hooks/useMediaQuery.js'
import { cropToFile, RING } from './cropToFile.js'

const ZOOM_MAX = 3

const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value))

export default function AvatarCropPanel({ file, url, busy, onUse, onChooseAnother, onClose }) {
  const wide = useMediaQuery('(min-width: 768px)')
  const box = wide ? 336 : 300
  const circle = box * RING
  const image = useRef(null)
  const pointers = useRef(new Map())
  const pinch = useRef(null)
  const [size, setSize] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const base = size ? Math.max(box / size.w, box / size.h) : 1
  const width = size ? size.w * base * zoom : 0
  const height = size ? size.h * base * zoom : 0
  const limit = { x: Math.max(0, (width - circle) / 2), y: Math.max(0, (height - circle) / 2) }
  const shown = { x: clamp(offset.x, limit.x), y: clamp(offset.y, limit.y) }

  const setZoomClamped = (next) => setZoom(Math.min(ZOOM_MAX, Math.max(1, next)))

  const onPointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinch.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom }
    }
  }

  const onPointerMove = (event) => {
    const last = pointers.current.get(event.pointerId)
    if (!last) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()]
      setZoomClamped((pinch.current.zoom * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.current.distance)
      return
    }
    setOffset({ x: shown.x + event.clientX - last.x, y: shown.y + event.clientY - last.y })
  }

  const onPointerEnd = (event) => {
    pointers.current.delete(event.pointerId)
    if (pointers.current.size < 2) pinch.current = null
  }

  const use = async () => onUse(await cropToFile(image.current, { box, zoom, offset: shown }, file.name))

  return (
    <Panel open onOpenChange={(open) => !open && onClose()} className="items-center md:w-[520px]">
      <div className="flex flex-col items-center gap-1 text-center">
        <PanelTitle className="text-2xl font-bold tracking-[-0.03em] text-ink">Frame your photo</PanelTitle>
        <p className="font-serif text-lg leading-snug text-secondary">{wide ? 'Drag to move, scroll to zoom.' : 'Drag to move, pinch to zoom.'}</p>
      </div>

      <div
        role="img"
        aria-label="Photo to frame"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onWheel={(event) => setZoomClamped(zoom * Math.exp(-event.deltaY * 0.0015))}
        className="relative cursor-grab touch-none overflow-hidden rounded-[28px] bg-paper shadow-inset select-none active:cursor-grabbing"
        style={{ width: box, height: box }}
      >
        <img
          ref={image}
          src={url}
          alt=""
          draggable={false}
          onLoad={(event) => setSize({ w: event.currentTarget.naturalWidth, h: event.currentTarget.naturalHeight })}
          className="pointer-events-none absolute top-1/2 left-1/2 max-w-none"
          style={{ width, height, transform: `translate(calc(-50% + ${shown.x}px), calc(-50% + ${shown.y}px))` }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-1/2 rounded-full ring-[1.5px] ring-white/90 outline outline-1 outline-offset-[1.5px] outline-ink/15"
          style={{ width: circle, height: circle, boxShadow: '0 0 0 999px rgb(230 230 228 / 0.72)' }}
        />
      </div>

      <label className="flex w-full items-center gap-4">
        <span className="label-mono text-[10px] font-medium">Zoom</span>
        <input
          type="range"
          min={1}
          max={ZOOM_MAX}
          step={0.01}
          value={zoom}
          onChange={(event) => setZoomClamped(Number(event.target.value))}
          aria-label="Zoom"
          className="flex-1 accent-[var(--color-accent)]"
        />
      </label>

      <Button className="w-full" disabled={!size || busy} onClick={use}>
        {busy ? 'Uploading' : 'Use photo'}
      </Button>
      <Button variant="secondary" className="w-full" onClick={onChooseAnother}>
        Choose another
      </Button>
    </Panel>
  )
}
