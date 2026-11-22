import { useCallback, useState } from 'react'
import { CheckCheck } from 'lucide-react'
import Toast from '@/components/Toast.jsx'
import { cn } from '@/lib/utils'
import { isToday } from './describe.js'
import NotificationRow from './NotificationRow.jsx'
import { useDeleteWithUndo, useMarkAllRead, useMarkRead } from './useNotifications.js'

export function ReadAll({ notifications }) {
  const readAll = useMarkAllRead()
  const unread = notifications.some((item) => !item.read_at)
  return (
    <button
      type="button"
      disabled={!unread}
      onClick={() => readAll.mutate()}
      className="press inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-paper pr-3.5 pl-3 shadow-raised transition-opacity duration-220 ease-ui active:shadow-pressed disabled:opacity-40"
    >
      <CheckCheck className="size-4 text-accent" strokeWidth={1.8} />
      <span className="font-mono text-[10px] font-medium tracking-[0.16em] text-ink uppercase">Read all</span>
    </button>
  )
}

function Group({ label, note, items, onRead, onDelete, onOpen }) {
  if (!items.length) return null
  return (
    <section className="flex flex-col gap-[18px]">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-medium tracking-[0.16em] text-ink uppercase">{label}</span>
        {note && <span className="font-mono text-[10px] tracking-[0.16em] text-secondary uppercase">{note}</span>}
      </div>
      <ul className="overflow-hidden rounded-[24px] bg-paper shadow-raised">
        {items.map((notification) => (
          <NotificationRow key={notification.id} notification={notification} onRead={onRead} onDelete={onDelete} onOpen={onOpen} />
        ))}
      </ul>
    </section>
  )
}

export default function NotificationList({ notifications, hint, onOpen, className }) {
  const markRead = useMarkRead()
  const { hidden, remove, undo } = useDeleteWithUndo()
  const [toast, setToast] = useState(null)
  const clearToast = useCallback(() => setToast(null), [])

  const shown = notifications.filter((item) => !hidden.has(item.id))
  const today = shown.filter((item) => isToday(item.created_at))
  const earlier = shown.filter((item) => !isToday(item.created_at))
  const fresh = today.filter((item) => !item.read_at).length
  const read = (id) => markRead.mutate(id)
  const destroy = (id) => {
    remove(id)
    setToast({ key: id, title: 'Notification deleted', hint: 'Gone in 5 seconds', action: { label: 'Undo', onClick: () => undo(id) } })
  }

  return (
    <div className={cn('flex flex-col gap-[18px]', className)}>
      <Group
        label="Today"
        note={today.length ? (fresh ? `${fresh} new` : 'All read') : null}
        items={today}
        onRead={read}
        onDelete={destroy}
        onOpen={onOpen}
      />
      <Group label="Earlier" items={earlier} onRead={read} onDelete={destroy} onOpen={onOpen} />
      {hint && <p className="font-mono text-[10px] tracking-[0.16em] text-secondary uppercase">{hint}</p>}
      <Toast toast={toast} onDone={clearToast} duration={5000} />
    </div>
  )
}
