import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { NavLink } from 'react-router'
import { tabs } from '@/app/navigation.js'
import { useMediaQuery } from '@/hooks/useMediaQuery.js'
import { cn } from '@/lib/utils'

const spring = { type: 'spring', stiffness: 400, damping: 30 }

function sizeFor(index, pressed, base) {
  const rest = { width: base, height: 42, icon: 23 }
  if (pressed === null) return rest
  const distance = Math.abs(index - pressed)
  if (distance === 0) return { width: base + 24, height: 60, icon: 38 }
  if (distance === 1) return { width: base + 6, height: 46, icon: 27 }
  return rest
}

export default function TabBar() {
  const [pressed, setPressed] = useState(null)
  const reduceMotion = useReducedMotion()
  const compact = useMediaQuery('(max-width: 400px)')
  const base = compact ? 66 : 84
  const release = () => setPressed(null)

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[440px] px-6 pb-[max(env(safe-area-inset-bottom),20px)] xl:hidden"
    >
      <ul className="flex h-[81px] items-center rounded-[38px] bg-paper px-2 shadow-raised">
        {tabs.map(({ to, label, Icon }, index) => {
          const size = sizeFor(index, reduceMotion ? null : pressed, base)
          return (
            <li key={to} className="flex flex-1 justify-center">
              <NavLink
                to={to}
                onPointerDown={() => setPressed(index)}
                onPointerUp={release}
                onPointerLeave={release}
                onPointerCancel={release}
                className="flex flex-col items-center gap-1 outline-offset-4"
              >
                {({ isActive }) => (
                  <>
                    <motion.span
                      initial={false}
                      animate={{ width: size.width, height: size.height, marginTop: size.height > 42 ? -(size.height - 42) : 0 }}
                      transition={spring}
                      className={cn(
                        'grid place-items-center rounded-full',
                        isActive ? 'bg-paper text-ink shadow-inset' : 'text-secondary',
                      )}
                    >
                      <motion.span initial={false} animate={{ width: size.icon, height: size.icon }} transition={spring} className="block">
                        <Icon className="size-full" />
                      </motion.span>
                    </motion.span>
                    <span
                      className={cn(
                        'font-mono text-[8px] tracking-[0.12em] uppercase',
                        isActive ? 'font-medium text-ink' : 'text-secondary',
                      )}
                    >
                      {label}
                    </span>
                    <span className={cn('h-0.5 w-3.5 rounded-full', isActive ? 'bg-accent' : 'bg-transparent')} />
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
