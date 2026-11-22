import { useCallback, useEffect, useRef, useState } from 'react'
import { useDndContext } from '@dnd-kit/core'
import { useElementWidth } from '@/hooks/useElementWidth.js'
import { useMediaQuery } from '@/hooks/useMediaQuery.js'
import { useAnimationFrame, useMotionValue, useReducedMotion } from 'motion/react'

export const wrap = (min, max, value) => {
  const range = max - min
  return ((((value - min) % range) + range) % range) + min
}

export const clamp = (min, max, value) => Math.min(max, Math.max(min, value))

export const hash = (seed) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return value - Math.floor(value)
}

export const stageHeight = (width, ratio, min, max) => clamp(min, max, width * ratio)

export const baseId = (id) => String(id).split('::')[0]

export function repeatPhotos(photos, minimum) {
  const count = photos.length ? Math.max(photos.length, minimum) : 0
  return Array.from({ length: count }, (_, index) => ({
    photo: photos[index % photos.length],
    copy: Math.floor(index / photos.length),
    key: `${photos[index % photos.length].id}-${index}`,
  }))
}

export function useReordering() {
  return Boolean(useDndContext().active)
}

export function usePan({ axis = 'both', friction = 0.94, disabled = false } = {}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const velocity = useMotionValue(0)
  const dragging = useMotionValue(0)
  const state = useRef({ active: false, id: null, lastX: 0, lastY: 0, lastT: 0, vx: 0, vy: 0, moved: 0, raf: 0 })
  const blocked = useRef(disabled)

  useEffect(() => {
    blocked.current = disabled
    if (disabled) {
      state.current.active = false
      cancelAnimationFrame(state.current.raf)
    }
  }, [disabled])

  useEffect(() => () => cancelAnimationFrame(state.current.raf), [])

  const glide = () => {
    const s = state.current
    let last = performance.now()
    const step = (now) => {
      const dt = Math.min(48, now - last)
      last = now
      const decay = Math.pow(friction, dt / 16)
      s.vx *= decay
      s.vy *= decay
      if (axis !== 'y') x.set(x.get() + s.vx * dt)
      if (axis !== 'x') y.set(y.get() + s.vy * dt)
      velocity.set(axis === 'y' ? s.vy : s.vx)
      if (Math.abs(s.vx) + Math.abs(s.vy) > 0.008) s.raf = requestAnimationFrame(step)
      else velocity.set(0)
    }
    s.raf = requestAnimationFrame(step)
  }

  const bind = {
    onPointerDown: (event) => {
      if (blocked.current || event.button !== 0) return
      const s = state.current
      cancelAnimationFrame(s.raf)
      Object.assign(s, { active: true, id: event.pointerId, lastX: event.clientX, lastY: event.clientY, lastT: performance.now(), vx: 0, vy: 0, moved: 0 })
    },
    onPointerMove: (event) => {
      const s = state.current
      if (!s.active || event.pointerId !== s.id) return
      if (blocked.current) {
        s.active = false
        return
      }
      const now = performance.now()
      const dt = Math.max(1, now - s.lastT)
      const dx = axis === 'y' ? 0 : event.clientX - s.lastX
      const dy = axis === 'x' ? 0 : event.clientY - s.lastY
      s.moved += Math.abs(dx) + Math.abs(dy)
      if (s.moved > 5 && !event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId)
        dragging.set(1)
      }
      s.vx = 0.7 * (dx / dt) + 0.3 * s.vx
      s.vy = 0.7 * (dy / dt) + 0.3 * s.vy
      x.set(x.get() + dx)
      y.set(y.get() + dy)
      velocity.set(axis === 'y' ? s.vy : s.vx)
      Object.assign(s, { lastX: event.clientX, lastY: event.clientY, lastT: now })
    },
    onPointerUp: () => {
      const s = state.current
      if (!s.active) return
      s.active = false
      dragging.set(0)
      if (s.moved > 5) glide()
      else velocity.set(0)
    },
    onPointerCancel: () => {
      state.current.active = false
      dragging.set(0)
    },
    onClickCapture: (event) => {
      if (state.current.moved > 5) {
        event.stopPropagation()
        event.preventDefault()
      }
    },
  }

  const nudge = (dx, dy = 0) => {
    cancelAnimationFrame(state.current.raf)
    x.set(x.get() + dx)
    y.set(y.get() + dy)
  }

  return { x, y, velocity, dragging, bind, nudge }
}

export function useHorizontalWheel(ref, onWheel) {
  const handler = useRef(onWheel)

  useEffect(() => {
    handler.current = onWheel
  })

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const listen = (event) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) && !event.ctrlKey) return
      event.preventDefault()
      handler.current(event)
    }
    node.addEventListener('wheel', listen, { passive: false })
    return () => node.removeEventListener('wheel', listen)
  }, [ref])
}

export function useClock({ speed = 1, paused = false }) {
  const clock = useMotionValue(0)
  const reduced = useReducedMotion()
  useAnimationFrame((_, delta) => {
    if (paused || reduced) return
    clock.set(clock.get() + Math.min(delta, 48) * speed)
  })
  return clock
}

export function useScreenFill(enabled) {
  const wide = useMediaQuery('(min-width: 768px)')
  const [top, setTop] = useState(null)
  const [viewport, setViewport] = useState(() => window.innerHeight)

  useEffect(() => {
    const resize = () => setViewport(window.innerHeight)
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const ref = useCallback((node) => {
    if (node) setTop(node.getBoundingClientRect().top + window.scrollY)
  }, [])

  if (!enabled || !wide || top === null) return [ref, null]
  return [ref, top < viewport * 0.5 ? viewport - top - 24 : viewport - 48]
}

export function useStageBox(fill) {
  const [measure, width] = useElementWidth()
  const [place, filled] = useScreenFill(fill)
  const node = useRef(null)
  const ref = useCallback(
    (element) => {
      node.current = element
      measure(element)
      place(element)
    },
    [measure, place],
  )
  return { ref, node, width, filled }
}
