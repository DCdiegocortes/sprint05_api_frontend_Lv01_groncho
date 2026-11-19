import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Link, NavLink } from 'react-router'
import { MoreHorizontal } from 'lucide-react'
import { tabs } from '@/app/navigation.js'
import Avatar from '@/components/Avatar.jsx'
import Logo from '@/components/Logo.jsx'
import { useAuth } from '@/features/auth/useAuth.js'
import { cn } from '@/lib/utils'

const spring = { type: 'spring', stiffness: 400, damping: 30 }

const rest = { icon: 26, text: 17, pad: 14 }

function sizeFor(index, hovered) {
  if (hovered === null) return rest
  const distance = Math.abs(index - hovered)
  if (distance === 0) return { icon: 50, text: 25, pad: 20 }
  if (distance === 1) return { icon: 36, text: 20, pad: 16 }
  return rest
}

export default function Sidebar() {
  const { user } = useAuth()
  const [hovered, setHovered] = useState(null)
  const reduceMotion = useReducedMotion()

  return (
    <aside className="sticky top-0 hidden h-dvh w-[280px] shrink-0 flex-col border-r border-hairline px-6 pt-10 pb-9 xl:flex">
      <Logo size={26} className="ml-4" />
      <nav aria-label="Main" className="mt-14" onMouseLeave={() => setHovered(null)}>
        <ul className="flex flex-col gap-1.5">
          {tabs.map(({ to, label, Icon }, index) => {
            const size = reduceMotion ? rest : sizeFor(index, hovered)
            return (
              <li key={to} onMouseEnter={() => setHovered(index)}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'press block rounded-lg px-5 transition-colors duration-220 ease-ui',
                      isActive ? 'bg-card shadow-raised' : 'hover:bg-card/60',
                    )
                  }
                >
                  {({ isActive }) => (
                    <motion.span
                      animate={{ paddingTop: size.pad, paddingBottom: size.pad }}
                      transition={spring}
                      className="flex items-center gap-4"
                    >
                      <motion.span animate={{ width: size.icon, height: size.icon }} transition={spring} className="block shrink-0">
                        <Icon className="size-full" />
                      </motion.span>
                      <motion.span
                        animate={{ fontSize: size.text }}
                        transition={spring}
                        className={cn('leading-none text-ink', isActive ? 'font-semibold' : 'font-medium')}
                      >
                        {label}
                      </motion.span>
                      {isActive && <span className="ml-auto size-2 shrink-0 rounded-full bg-accent" />}
                    </motion.span>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
      <Link to="/profile" className="press mt-auto flex items-center gap-3 rounded-lg px-2 py-2">
        <Avatar user={user} size={46} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold text-ink">@{user?.handle}</span>
          <span className="text-xs text-secondary">My universe</span>
        </span>
        <MoreHorizontal className="ml-auto size-5 text-secondary" />
      </Link>
    </aside>
  )
}
