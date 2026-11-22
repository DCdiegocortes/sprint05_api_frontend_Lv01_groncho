import { Bell, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import EmptyState from '@/components/EmptyState.jsx'
import PageHeader from '@/components/PageHeader.jsx'
import NotificationList, { ReadAll } from './NotificationList.jsx'
import { useNotifications } from './useNotifications.js'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { data: notifications } = useNotifications()

  return (
    <div className="flex flex-col gap-[18px] xl:max-w-[720px] xl:gap-10">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate(-1)}
          className="press grid size-[42px] place-items-center rounded-full bg-paper text-ink shadow-raised active:shadow-pressed"
        >
          <ChevronLeft className="size-[18px]" strokeWidth={1.8} />
        </button>
        <span className="font-mono text-[10px] font-medium tracking-[0.16em] text-secondary uppercase">Activity</span>
        <span className="justify-self-end">{notifications?.length > 0 && <ReadAll notifications={notifications} />}</span>
      </div>

      <PageHeader label="006 — Notifications" title="Notifications" subline="What moved while you were away." />

      {notifications &&
        (notifications.length ? (
          <NotificationList notifications={notifications} hint="Tap to open · swipe left to mark read · all the way to delete" />
        ) : (
          <EmptyState
            icon={Bell}
            title="All quiet for now."
            body="Matches, requests and swaps show up here as they happen."
            action="Go to Discover"
            to="/discover"
          />
        ))}
    </div>
  )
}
