import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

const swap = { duration: 0.16, ease: [0.23, 1, 0.32, 1] }

function Check() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5">
      <motion.path
        d="M5 12.5l4.5 4.5L19 7.5"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1], delay: 0.05 }}
      />
    </svg>
  )
}

const states = {
  idle: { label: 'Done', mark: null },
  saving: { label: 'Saving', mark: 'dot' },
  saved: { label: 'Saved', mark: 'check' },
  failed: { label: 'Retry', mark: 'alert' },
}

export default function DoneAction({ state, onDone, onRetry }) {
  const reduce = useReducedMotion()
  const { label, mark } = states[state]
  const hidden = reduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(2px)' }
  const shown = reduce ? { opacity: 1 } : { opacity: 1, filter: 'blur(0px)' }

  return (
    <motion.button
      type="button"
      layout
      transition={{ layout: { type: 'spring', duration: 0.4, bounce: 0 } }}
      onClick={state === 'failed' ? onRetry : onDone}
      aria-label={state === 'failed' ? 'Not saved. Retry' : state === 'saving' ? 'Saving, then done' : 'Done'}
      className="press flex h-10 items-center gap-1.5 text-[15px] font-medium text-ink transition-opacity duration-220 ease-ui hover:opacity-70"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {mark && (
          <motion.span key={mark} initial={hidden} animate={shown} exit={hidden} transition={swap} className="grid size-3.5 place-items-center">
            {mark === 'check' ? (
              <Check />
            ) : (
              <span className={mark === 'dot' ? 'breathe size-1.5 rounded-full bg-accent' : 'size-1.5 rounded-full bg-accent'} />
            )}
          </motion.span>
        )}
        <motion.span key={label} initial={hidden} animate={shown} exit={hidden} transition={swap} aria-live="polite">
          {label}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
