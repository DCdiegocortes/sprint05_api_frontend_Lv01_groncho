import { useCallback } from 'react'
import { motion, useTransform } from 'motion/react'
import { useElementWidth } from '@/hooks/useElementWidth.js'
import { useImageRatios } from '@/hooks/useImageRatios.js'
import Photo from './Photo.jsx'
import { clamp, hash, stageHeight, usePan, useReordering, useScreenFill, wrap } from './motion.js'

const FALLBACK_RATIO = 1.25

function buildColumns({ photos, count, columnWidth, gap, ratioOf, stage }) {
  const copies = new Map()
  const copyOf = (photo) => {
    const copy = copies.get(photo.id) ?? 0
    copies.set(photo.id, copy + 1)
    return copy
  }

  return Array.from({ length: count }, (_, c) => {
    const block = []
    let height = 0
    let index = (c * 3) % photos.length
    while (height < stage * 0.7 || block.length < 2) {
      const photo = photos[index % photos.length]
      const tile = columnWidth * clamp(0.62, 1.6, ratioOf(photo.url) ?? FALLBACK_RATIO)
      block.push({ photo, height: tile })
      height += tile + gap
      index += 1
    }
    const reps = Math.ceil(stage / height) + 1
    const items = Array.from({ length: reps }, (_, rep) =>
      block.map((item, k) => ({ ...item, key: `${rep}-${k}`, copy: copyOf(item.photo) })),
    ).flat()
    return { items, height, offset: hash(c + 1) * height }
  })
}

function Column({ column, index, step, span, columnWidth, gap, x, y }) {
  const left = useTransform(x, (value) => wrap(-step, span - step, index * step + value))
  const top = useTransform(y, (value) => wrap(-column.height, 0, value * (index % 2 ? 0.9 : 1) - column.offset))

  return (
    <motion.div className="absolute top-0 left-0 flex flex-col" style={{ x: left, y: top, width: columnWidth, gap }}>
      {column.items.map((item) => (
        <Photo
          key={item.key}
          photo={item.photo}
          copy={item.copy}
          className="shrink-0 rounded-[20px] shadow-subtle"
          style={{ height: item.height }}
        />
      ))}
    </motion.div>
  )
}

export default function Masonry({ photos, addTile, fill = false }) {
  const [measure, width] = useElementWidth()
  const [place, filled] = useScreenFill(fill)
  const ref = useCallback(
    (node) => {
      measure(node)
      place(node)
    },
    [measure, place],
  )
  const ratioOf = useImageRatios(photos.map((photo) => photo.url))
  const reordering = useReordering()
  const { x, y, bind } = usePan({ disabled: reordering })

  const columnWidth = width >= 1500 ? 360 : width >= 1100 ? 320 : width >= 900 ? 270 : width >= 520 ? 220 : width >= 340 ? 165 : 120
  const gap = width >= 520 ? 16 : 10
  const stage = Math.max(stageHeight(width, 0.72, 320, 820), filled ?? 0)
  const step = columnWidth + gap
  const base = Math.max(3, Math.min(photos.length, 5))
  const count = base * Math.ceil((Math.ceil(width / step) + 2) / base)
  const columns = width ? buildColumns({ photos, count, columnWidth, gap, ratioOf, stage }) : []

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={ref}
        {...bind}
        className="relative cursor-grab touch-none overflow-hidden rounded-[24px] active:cursor-grabbing"
        style={{ height: stage }}
      >
        {columns.map((column, index) => (
          <Column
            key={index}
            column={column}
            index={index}
            step={step}
            span={count * step}
            columnWidth={columnWidth}
            gap={gap}
            x={x}
            y={y}
          />
        ))}
      </div>
      {addTile}
    </div>
  )
}
