import { Link } from 'react-router'
import { cn } from '@/lib/utils'

const START = 0.4
const STEP = 0.17
const WORD = 0.7

export default function EmptyWall({ icon: Icon, line, action, to, state, label, className }) {
  const words = line.split(' ')
  const settle = START + (words.length - 1) * STEP + WORD

  return (
    <Link
      to={to}
      state={state}
      aria-label={label}
      className={cn('group grid min-h-[420px] place-items-center rounded-[28px] bg-paper px-6 shadow-inset xl:min-h-[520px]', className)}
    >
      <span className="flex flex-col items-center gap-4 text-center">
        <span
          aria-hidden="true"
          className="sink-in grid size-[72px] place-items-center rounded-full bg-paper text-accent"
          style={{ animationDelay: `${settle}s` }}
        >
          <Icon className="size-7 transition-transform duration-220 ease-ui group-active:scale-90" strokeWidth={1.5} />
        </span>
        <span className="mt-1 max-w-[520px] font-serif text-[26px] leading-tight tracking-[-0.01em] text-ink xl:text-[30px]">
          {words.map((word, index) => (
            <span key={index}>
              <span className="ink-in" style={{ animationDelay: `${START + index * STEP}s` }}>
                {word}
              </span>
              {index < words.length - 1 && ' '}
            </span>
          ))}
        </span>
        <span
          className="appear text-[15px] font-medium text-accent transition-[opacity,transform] duration-220 ease-ui group-hover:opacity-70 group-active:scale-[0.97]"
          style={{ animationDelay: `${settle + 0.25}s` }}
        >
          {action}
        </span>
      </span>
    </Link>
  )
}
