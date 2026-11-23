import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

const swap = { duration: 0.16, ease: [0.23, 1, 0.32, 1] }

function Check() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[11px]">
      <motion.path
        d="M5 12.5l4.5 4.5L19 7.5"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1], delay: 0.05 }}
      />
    </svg>
  )
}

export default function SaveStatus({ state, onRetry }) {
  const reduce = useReducedMotion()
  const hidden = reduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(2px)' }
  const shown = reduce ? { opacity: 1 } : { opacity: 1, filter: 'blur(0px)' }

  return (
    <span className="label-mono flex items-center gap-1.5" aria-live="polite">
      004 — Editing
      <AnimatePresence mode="popLayout" initial={false}>
        {state !== 'idle' && (
          <motion.span key={state} initial={hidden} animate={shown} exit={hidden} transition={swap} className="flex items-center gap-1.5">
            <span aria-hidden="true">·</span>
            {state === 'saving' && <span aria-hidden="true" className="breathe size-[5px] rounded-full bg-accent" />}
            {state === 'saved' && <Check />}
            {state === 'failed' ? (
              <button
                type="button"
                onClick={onRetry}
                className="press flex items-center gap-1.5 text-accent transition-opacity duration-220 ease-ui hover:opacity-70"
              >
                <span aria-hidden="true" className="size-[5px] rounded-full bg-accent" />
                Not saved · retry
              </button>
            ) : (
              <span>{state === 'saving' ? 'Saving' : 'Saved'}</span>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
