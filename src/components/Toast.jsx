import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check } from 'lucide-react'

export default function Toast({ toast, onDone, duration = 3200 }) {
  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(onDone, duration)
    return () => clearTimeout(timer)
  }, [toast, onDone, duration])

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.key ?? toast.title}
          role="status"
          initial={{ opacity: 0, y: -24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          className="fixed inset-x-0 top-[max(env(safe-area-inset-top),14px)] z-50 mx-auto flex w-fit items-center gap-3 rounded-full bg-paper py-2.5 pr-5 pl-2.5 shadow-float xl:top-6 xl:left-[280px]"
        >
          <span className="grid size-8 place-items-center rounded-full bg-accent text-white">
            <Check className="size-4" strokeWidth={2.2} />
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-ink">{toast.title}</span>
            {toast.hint && <span className="label-mono">{toast.hint}</span>}
          </span>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action.onClick()
                onDone()
              }}
              className="press ml-1 text-[15px] font-medium text-accent transition-opacity duration-220 ease-ui hover:opacity-70"
            >
              {toast.action.label}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
