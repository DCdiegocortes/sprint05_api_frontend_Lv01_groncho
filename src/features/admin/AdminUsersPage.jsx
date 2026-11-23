import { useCallback, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { ChevronRight, Search } from 'lucide-react'
import PageHeader from '@/components/PageHeader.jsx'
import Toast from '@/components/Toast.jsx'
import { Segmented } from '@/components/ui/segmented.jsx'
import { useMediaQuery } from '@/hooks/useMediaQuery.js'
import { RoleChip, UserAvatar } from './AdminBits.jsx'
import { UserDetailPanel } from './UserDetail.jsx'
import { isAdmin, joined, matchesSearch, useUsers } from './useAdmin.js'

const Filter = Object.freeze({ ALL: 'all', ADMINS: 'admins' })

function UserRow({ user, desktop, onOpen }) {
  const open = (event) => {
    if (!desktop) return
    event.preventDefault()
    onOpen(user.id)
  }

  return (
    <li className="border-ink/[0.07] [&+&]:border-t">
      <Link
        to={`/admin/users/${user.id}`}
        onClick={open}
        className="group flex items-center gap-3.5 py-3 transition-colors duration-220 ease-ui xl:-mx-6 xl:h-[68px] xl:px-6 xl:py-0 xl:hover:bg-ink/[0.035]"
      >
        <span className="flex min-w-0 flex-1 items-center gap-3.5 xl:w-[520px] xl:flex-none">
          <UserAvatar user={user} />
          <span className="flex min-w-0 flex-col gap-[3px]">
            <span className="truncate text-[15px] leading-[18px] font-semibold tracking-[-0.01em] text-ink">{user.name}</span>
            <span className="truncate text-[13px] leading-4 text-secondary">{user.email}</span>
          </span>
        </span>
        <span className="hidden w-[180px] xl:block">
          <RoleChip user={user} />
        </span>
        {isAdmin(user) && (
          <span className="xl:hidden">
            <RoleChip user={user} />
          </span>
        )}
        <span className="hidden w-[220px] text-sm text-secondary xl:block">{joined(user.created_at, true)}</span>
        <ChevronRight
          className="ml-auto size-4 shrink-0 text-secondary transition-transform duration-220 ease-ui group-hover:translate-x-0.5"
          strokeWidth={1.8}
        />
      </Link>
    </li>
  )
}

export default function AdminUsersPage() {
  const location = useLocation()
  const desktop = useMediaQuery('(min-width: 1280px)')
  const { data: users = [], isPending, isError } = useUsers()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState(Filter.ALL)
  const [openId, setOpenId] = useState(null)
  const [toast, setToast] = useState(() =>
    location.state?.deleted ? { title: `${location.state.deleted} deleted`, hint: 'Removed for good' } : null,
  )
  const clearToast = useCallback(() => setToast(null), [])

  const admins = users.filter(isAdmin)
  const shown = (filter === Filter.ADMINS ? admins : users).filter((user) => matchesSearch(user, search))

  return (
    <div className="flex flex-col gap-7 xl:gap-10">
      <PageHeader label="008 — Admin" title="Users" subline="Everyone inside Grôncho." />

      <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:gap-5">
        <label className="flex h-14 items-center gap-3 rounded-md bg-paper px-[18px] shadow-inset focus-within:ring-1 xl:flex-1 focus-within:ring-accent">
          <Search className="size-[18px] shrink-0 text-secondary" strokeWidth={1.8} />
          <input
            type="search"
            aria-label="Search by name or email"
            placeholder="Search by name or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-full min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
          />
        </label>
        <Segmented
          label="Who"
          fit
          className="xl:w-[306px]"
          value={filter}
          onChange={setFilter}
          options={[
            { value: Filter.ALL, label: `All · ${users.length}` },
            { value: Filter.ADMINS, label: `Admins · ${admins.length}` },
          ]}
        />
      </div>

      <section className="rounded-[20px] bg-paper px-[18px] py-1.5 shadow-raised xl:-mt-2 xl:rounded-[24px] xl:px-6 xl:py-2">
        <div className="hidden h-10 items-center font-mono text-[10px] font-medium tracking-[0.16em] text-secondary uppercase xl:flex">
          <span className="w-[520px]">User</span>
          <span className="w-[180px]">Role</span>
          <span className="w-[220px]">Joined</span>
        </div>
        {isPending && <p className="label-mono py-4">Loading users</p>}
        {isError && <p className="py-4 text-sm text-secondary">The users could not be loaded. Try again in a moment.</p>}
        {!isPending && !isError && !shown.length && (
          <p className="py-4 text-sm text-secondary">{search ? `No one matches “${search.trim()}”.` : 'No one here yet.'}</p>
        )}
        <ul className="xl:border-t xl:border-ink/[0.07]">
          {shown.map((user) => (
            <UserRow key={user.id} user={user} desktop={desktop} onOpen={setOpenId} />
          ))}
        </ul>
      </section>

      {openId && (
        <UserDetailPanel
          userId={openId}
          onClose={() => setOpenId(null)}
          onDeleted={(gone) => {
            setOpenId(null)
            setToast({ title: `${gone.name} deleted`, hint: 'Removed for good' })
          }}
        />
      )}
      <Toast toast={toast} onDone={clearToast} />
    </div>
  )
}
