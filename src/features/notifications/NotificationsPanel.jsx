import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Bell } from 'lucide-react'
import NotificationList, { ReadAll } from './NotificationList.jsx'
import { useNotifications } from './useNotifications.js'

export default function NotificationsPanel({ open, onOpenChange }) {
  const { data: notifications } = useNotifications(open)
  const unread = notifications?.filter((item) => !item.read_at).length ?? 0

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-40 bg-paper/70" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="sheet-content fixed top-24 right-12 origin-top-right z-50 flex max-h-[calc(100dvh-120px)] w-[420px] flex-col gap-3.5 overflow-y-auto rounded-[30px] bg-paper px-5 pt-[22px] pb-5 shadow-float outline-none"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <DialogPrimitive.Title className="text-[22px] leading-[26px] font-bold tracking-[-0.03em] text-ink">
                Notifications
              </DialogPrimitive.Title>
              <span className="font-mono text-[10px] tracking-[0.16em] text-secondary uppercase">{unread ? `${unread} unread` : 'Nothing new'}</span>
            </div>
            {notifications?.length > 0 && <ReadAll notifications={notifications} />}
          </div>
          {notifications &&
            (notifications.length ? (
              <NotificationList notifications={notifications} hint="Hover a row to mark read · Esc to close" onOpen={() => onOpenChange(false)} />
            ) : (
              <div className="flex flex-col items-center gap-3 px-6 pt-8 pb-10 text-center">
                <Bell className="size-10 text-secondary" strokeWidth={1.2} />
                <p className="text-[17px] font-semibold text-ink">All quiet for now.</p>
                <p className="font-serif text-lg leading-tight text-secondary">Matches, requests and swaps show up here as they happen.</p>
              </div>
            ))}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
