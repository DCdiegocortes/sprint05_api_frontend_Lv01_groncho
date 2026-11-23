import { Bell } from 'lucide-react'
import BackLink from '@/components/BackLink.jsx'
import Loader from '@/components/Loader.jsx'
import { loadingLines } from '@/lib/loadingLines.js'
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
      <div className="flex items-center justify-between">
        <BackLink onClick={() => navigate(-1)}>Back</BackLink>
        {notifications?.length > 0 && <ReadAll notifications={notifications} />}
      </div>

      <PageHeader label="006 — Notifications" title="Notifications" subline="What moved while you were away." />

      {!notifications && <Loader line={loadingLines.notifications} />}
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
