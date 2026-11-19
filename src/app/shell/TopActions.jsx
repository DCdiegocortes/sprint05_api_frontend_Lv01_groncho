import { Bell } from 'lucide-react'
import { Link } from 'react-router'
import Avatar from '@/components/Avatar.jsx'
import { useAuth } from '@/features/auth/useAuth.js'
import { useUnreadCount } from '@/features/notifications/useUnreadCount.js'

export default function TopActions() {
  const { user } = useAuth()
  const unread = useUnreadCount()

  return (
    <div className="flex items-center gap-3">
      <Link
        to="/notifications"
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        className="press relative grid size-[42px] place-items-center rounded-full text-ink"
      >
        <Bell className="size-5" strokeWidth={1.6} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-accent px-1 font-mono text-[8px] font-medium text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Link>
      <Link to="/profile" aria-label="Profile" className="press rounded-full">
        <Avatar user={user} />
      </Link>
    </div>
  )
}
