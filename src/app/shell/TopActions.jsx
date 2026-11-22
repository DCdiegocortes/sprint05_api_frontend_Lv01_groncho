import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Link } from 'react-router'
import Avatar from '@/components/Avatar.jsx'
import { useAuth } from '@/features/auth/useAuth.js'
import NotificationsPanel from '@/features/notifications/NotificationsPanel.jsx'
import { useUnreadCount } from '@/features/notifications/useUnreadCount.js'
import { useMediaQuery } from '@/hooks/useMediaQuery.js'

export default function TopActions() {
  const { user } = useAuth()
  const unread = useUnreadCount()
  const wide = useMediaQuery('(min-width: 1280px)')
  const [open, setOpen] = useState(false)
  const Trigger = wide ? 'button' : Link
  const trigger = wide ? { type: 'button', onClick: () => setOpen(true), 'aria-expanded': open } : { to: '/notifications' }

  return (
    <div className="flex items-center gap-3">
      {wide && <NotificationsPanel open={open} onOpenChange={setOpen} />}
      <Trigger
        {...trigger}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        className="press group relative grid size-[42px] place-items-center rounded-full text-ink transition-shadow duration-220 ease-ui hover:shadow-subtle active:bg-paper active:shadow-pressed"
      >
        <Bell
          className="size-5 origin-top transition-transform duration-220 ease-ui group-hover:-rotate-12 group-active:rotate-0"
          strokeWidth={1.6}
        />
        {unread > 0 && (
          <span className="absolute top-1 right-1 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-accent px-1 font-mono text-[10px] font-medium text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Trigger>
      <Link to="/profile" aria-label="Profile" className="press group rounded-full">
        <Avatar
          user={user}
          className="transition-shadow duration-220 ease-ui group-hover:shadow-raised group-active:bg-paper group-active:shadow-pressed"
        />
      </Link>
    </div>
  )
}
