import { useState } from 'react'
import Loader from '@/components/Loader.jsx'
import { loadingLines } from '@/lib/loadingLines.js'
import { Link, useNavigate, useParams } from 'react-router'
import { Trash2 } from 'lucide-react'
import { Panel, PanelClose, PanelTitle } from '@/components/ui/panel.jsx'
import { BackLink, Details, Group, RoleChip, UserAvatar } from './AdminBits.jsx'
import { useAuth } from '@/features/auth/useAuth.js'
import DeleteUserPanel from './DeleteUserPanel.jsx'
import { isAdmin, useUser } from './useAdmin.js'

const styleLabel = (style) =>
  style
    ?.split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' · ')

function Universe({ user }) {
  const photos = user.universe?.images ?? []
  const style = styleLabel(user.universe?.style)

  return (
    <Group
      label={style ? `Universe · ${style}` : 'Universe'}
      action={
        <Link
          to={`/admin/users/${user.id}/moderate`}
          className="press shrink-0 text-[15px] font-medium text-accent transition-opacity duration-220 ease-ui hover:opacity-70"
        >
          Moderate
        </Link>
      }
    >
      {photos.length ? (
        <ul className="grid grid-cols-3 gap-2.5">
          {photos.slice(0, 3).map((photo) => (
            <li key={photo.id} className="aspect-[4/5] overflow-hidden rounded-[18px] shadow-raised">
              <img src={photo.url} alt="" className="size-full object-cover" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-secondary">{user.universe ? 'No photos in this universe yet.' : 'No universe yet.'}</p>
      )}
    </Group>
  )
}

function DeleteRow({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press flex h-[58px] w-full items-center justify-center gap-3 rounded-[20px] bg-paper px-[18px] shadow-raised transition-opacity duration-220 ease-ui hover:opacity-80"
    >
      <Trash2 className="size-[18px] text-accent" strokeWidth={1.8} />
      <span className="text-[15px] font-medium text-accent">Delete user</span>
    </button>
  )
}

export function UserDetailPanel({ userId, onClose, onDeleted }) {
  const { data: user } = useUser(userId)
  const { user: me } = useAuth()
  const [deleting, setDeleting] = useState(false)

  if (!user) return null
  if (deleting) return <DeleteUserPanel user={user} onClose={() => setDeleting(false)} onDeleted={onDeleted} />

  return (
    <Panel open onOpenChange={(open) => !open && onClose()} className="md:w-[560px]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <PanelTitle className="text-[26px] leading-tight font-bold tracking-[-0.03em] text-ink">{user.name}</PanelTitle>
          <p className="font-serif text-lg leading-snug text-secondary">
            @{user.handle} · {isAdmin(user) ? 'Admin' : 'User'}
          </p>
        </div>
        <PanelClose />
      </div>
      <Group label="Details">
        <Details user={user} />
      </Group>
      <Universe user={user} />
      {user.id !== me?.id && <DeleteRow onClick={() => setDeleting(true)} />}
    </Panel>
  )
}

export default function UserDetailPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { data: user, isPending, isError } = useUser(userId)
  const { user: me } = useAuth()
  const [deleting, setDeleting] = useState(false)

  return (
    <div className="flex w-full flex-col gap-7 xl:mx-auto xl:w-[640px] xl:gap-10">
      <BackLink to="/admin/users">Users</BackLink>
      {isPending && <Loader line={loadingLines.admin} />}
      {isError && <p className="text-sm text-secondary">This user could not be loaded.</p>}
      {user && (
        <>
          <section className="flex items-center gap-4 rounded-[28px] bg-paper p-5 shadow-raised">
            <UserAvatar user={user} size={64} />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <h1 className="truncate text-2xl leading-tight font-bold tracking-[-0.03em] text-ink">{user.name}</h1>
              <span className="font-mono text-[10px] tracking-[0.16em] text-secondary uppercase">@{user.handle}</span>
            </div>
            <RoleChip user={user} />
          </section>
          <Group label="Details">
            <Details user={user} />
          </Group>
          <Universe user={user} />
          {user.id !== me?.id && (
            <Group label="Danger zone">
              <DeleteRow onClick={() => setDeleting(true)} />
            </Group>
          )}
          {deleting && (
            <DeleteUserPanel
              user={user}
              onClose={() => setDeleting(false)}
              onDeleted={(gone) => navigate('/admin/users', { replace: true, state: { deleted: gone.name } })}
            />
          )}
        </>
      )}
    </div>
  )
}
