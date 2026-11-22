import { useContext } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { PhotoFrameContext } from '../photoFrame.js'

function PlainFrame({ className, style, children }) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  )
}

export default function Photo({ photo, copy = 0, className, style, imageClassName, imageStyle }) {
  const Frame = useContext(PhotoFrameContext) ?? PlainFrame
  return (
    <Frame
      photo={photo}
      dragId={copy ? `${photo.id}::${copy}` : photo.id}
      className={cn('relative overflow-hidden rounded-2xl bg-plate', className)}
      style={style}
    >
      <motion.img
        src={photo.url}
        alt=""
        draggable={false}
        className={cn('pointer-events-none size-full object-cover select-none', photo.uploading && 'opacity-45', imageClassName)}
        style={imageStyle}
      />
      {photo.uploading && (
        <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-card px-2 py-1 shadow-subtle">
          <span className="relative h-1 w-11 overflow-hidden rounded-full bg-plate">
            <span className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${Math.round(photo.progress * 100)}%` }} />
          </span>
          <span className="font-mono text-[8.5px] font-medium text-ink">{Math.round(photo.progress * 100)}%</span>
        </span>
      )}
    </Frame>
  )
}
