import Avatar from '@/components/Avatar.jsx'
import { cn } from '@/lib/utils'
import { isAdmin, joined } from './useAdmin.js'

export { default as BackLink } from '@/components/BackLink.jsx'

export function RoleChip({ user }) {
  if (!isAdmin(user)) return <span className="font-mono text-[10px] tracking-[0.12em] text-secondary uppercase">User</span>
  return (
    <span className="rounded-full bg-paper px-2.5 py-1.5 font-mono text-[10px] font-medium tracking-[0.12em] text-ink uppercase shadow-inset">
      Admin
    </span>
  )
}

export function Group({ label, action, children }) {
  return (
    <section className="flex flex-col gap-[18px]">
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-[10px] leading-[13px] font-medium tracking-[0.16em] text-ink uppercase">{label}</span>
        {action}
      </div>
      {children}
    </section>
  )
}

export function UserAvatar({ user, size = 42 }) {
  return <Avatar user={user} size={size} className="shadow-raised" />
}

export function Details({ user }) {
  const rows = [
    ['Email', user.email],
    ['Joined', joined(user.created_at)],
  ]
  return (
    <dl className="rounded-[20px] bg-paper px-[18px] py-1.5 shadow-raised">
      {rows.map(([label, value], index) => (
        <div key={label} className={cn('flex h-[46px] items-center gap-2.5', index > 0 && 'border-t border-ink/[0.07]')}>
          <dt className="w-[84px] shrink-0 font-mono text-[10px] tracking-[0.12em] text-secondary uppercase">{label}</dt>
          <dd className="min-w-0 flex-1 truncate text-sm font-semibold tracking-[-0.01em] text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
