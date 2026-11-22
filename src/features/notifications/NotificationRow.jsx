import { useRef } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { CheckCheck, Heart, Shield, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router'
import Avatar from '@/components/Avatar.jsx'
import { useMediaQuery } from '@/hooks/useMediaQuery.js'
import { cn } from '@/lib/utils'
import { describe } from './describe.js'

const spring = { type: 'spring', stiffness: 520, damping: 40 }

function Icon({ kind, actor }) {
  if (kind === 'actor') return <Avatar user={actor} size={44} />
  if (kind === 'match')
    return (
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-white shadow-accent">
        <Heart className="size-[18px]" strokeWidth={1.8} />
      </span>
    )
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-paper text-accent shadow-inset">
      <Shield className="size-[18px]" strokeWidth={1.6} />
    </span>
  )
}

function Action({ label, onClick, danger, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'press grid size-11 shrink-0 place-items-center rounded-full',
        danger ? 'bg-accent text-white shadow-accent' : 'bg-paper text-ink shadow-raised active:shadow-pressed',
      )}
    >
      {children}
    </button>
  )
}

export default function NotificationRow({ notification, onRead, onDelete, onOpen }) {
  const navigate = useNavigate()
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)')
  const row = useRef(null)
  const unread = !notification.read_at
  const info = describe(notification)
  const reveal = unread ? 114 : 62
  const x = useMotionValue(0)
  const radius = useTransform(x, [-24, 0], [24, 0])
  const trail = useTransform(x, (value) => (value < -reveal ? 1 : 0))

  const open = () => {
    if (unread) onRead(notification.id)
    if (info.to) {
      onOpen?.()
      navigate(info.to)
    }
  }

  const release = (_event, drag) => {
    const width = row.current?.offsetWidth ?? 360
    const offset = x.get()
    if (offset < -width * 0.5 || (drag.velocity.x < -900 && offset < -reveal)) {
      animate(x, -width, { duration: 0.18, ease: [0.23, 1, 0.32, 1] }).then(() => onDelete(notification.id))
    } else if (offset < -reveal / 2) {
      animate(x, -reveal, spring)
    } else {
      animate(x, 0, spring)
    }
  }

  const actions = (
    <>
      {unread && (
        <Action label="Mark as read" onClick={() => onRead(notification.id)}>
          <CheckCheck className="size-[18px]" strokeWidth={1.8} />
        </Action>
      )}
      <Action label="Delete notification" danger onClick={() => onDelete(notification.id)}>
        <Trash2 className="size-[18px]" strokeWidth={1.8} />
      </Action>
    </>
  )

  const content = (
    <button type="button" onClick={open} className="flex w-full items-center gap-3 py-3 pr-3.5 pl-3 text-left">
      <Icon kind={info.icon} actor={notification.actor} />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className={cn('text-sm leading-[17px] font-semibold tracking-[-0.01em]', unread ? 'text-ink' : 'font-medium text-secondary')}>
          {info.title}
        </span>
        <span className="font-mono text-[10px] leading-[13px] tracking-[0.16em] text-secondary uppercase">{info.meta}</span>
      </span>
      {unread && <span aria-label="Unread" className="size-2 shrink-0 rounded-full bg-accent" />}
    </button>
  )

  if (fine) {
    return (
      <li ref={row} className="group relative border-ink/[0.07] [&+li]:border-t">
        {content}
        <span className="absolute inset-y-0 right-0 flex items-center gap-2 bg-paper pr-3.5 pl-3 opacity-0 transition-opacity duration-220 ease-ui group-focus-within:opacity-100 group-hover:opacity-100">
          {actions}
        </span>
      </li>
    )
  }

  return (
    <li ref={row} className="relative overflow-hidden border-ink/[0.07] [&+li]:border-t">
      <motion.span aria-hidden="true" style={{ opacity: trail }} className="absolute inset-0 flex items-center bg-accent/15 pl-[38%] text-accent">
        <Trash2 className="size-[22px]" strokeWidth={1.8} />
      </motion.span>
      <span className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2.5">{actions}</span>
      <motion.div
        drag="x"
        dragConstraints={{ left: -1000, right: 0 }}
        dragElastic={{ left: 0.04, right: 0.2 }}
        dragMomentum={false}
        dragDirectionLock
        onDragEnd={release}
        style={{ x, borderTopRightRadius: radius, borderBottomRightRadius: radius }}
        className="relative touch-pan-y bg-paper"
      >
        {content}
      </motion.div>
    </li>
  )
}
