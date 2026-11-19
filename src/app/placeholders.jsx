import PageHeader from '@/components/PageHeader.jsx'
import { useAuth } from '@/features/auth/useAuth.js'

export function DiscoverPage() {
  return <PageHeader label="001 — Discover" title="Discover" subline="Universes worth getting lost in." />
}

export function ClosetPage() {
  return <PageHeader label="002 — Closet" title="Closet" subline="Pieces ready to change hands." />
}

export function MatchesPage() {
  return <PageHeader label="003 — Matches" title="Matches" subline="Universes that feel like yours." />
}

export function UniversePage() {
  return <PageHeader label="004 — Universe" title="My universe" subline="Everything you are, in one place." />
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
        className="press self-start text-[15px] font-medium text-accent underline-offset-4 hover:underline"
      >
        Log out
      </button>
    </div>
  )
}
