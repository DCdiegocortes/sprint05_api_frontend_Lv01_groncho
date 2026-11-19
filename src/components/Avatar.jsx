import { cn } from '@/lib/utils'

export default function Avatar({ user, size = 42, className }) {
  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? ''

  return (
    <span
      className={cn('grid shrink-0 place-items-center overflow-hidden rounded-full bg-card shadow-subtle', className)}
      style={{ width: size, height: size }}
    >
      {user?.avatar_url ? (
        <img src={user.avatar_url} alt="" className="size-full object-cover" />
      ) : (
        <span className="font-mono text-[13px] text-secondary">{initial}</span>
      )}
    </span>
  )
}
