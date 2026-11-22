import PageHeader from '@/components/PageHeader.jsx'
import { useAuth } from '@/features/auth/useAuth.js'

export function RequestsPage() {
  return <PageHeader label="005 — Requests" title="Requests" subline="Gifts and trades in motion." />
}

export function NotificationsPage() {
  return <PageHeader label="006 — Notifications" title="Notifications" subline="What moved while you were away." />
}

export function ProfilePage() {
  const { user, logout } = useAuth()

  return (
    <div className="flex flex-col gap-8">
      <PageHeader label="007 — Profile" title={user?.name} subline={`@${user?.handle} · ${user?.email}`} />
      <button
        type="button"
        onClick={logout}
        className="press self-start text-[15px] font-medium text-accent transition-opacity duration-220 ease-ui hover:opacity-70"
      >
        Log out
      </button>
    </div>
  )
}
