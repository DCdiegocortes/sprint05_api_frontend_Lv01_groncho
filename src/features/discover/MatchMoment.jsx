import { motion } from 'motion/react'
import Logo from '@/components/Logo.jsx'
import { Button } from '@/components/ui/button.jsx'

const pop = { type: 'spring', stiffness: 220, damping: 24 }

function Circle({ photo, initial, delay, offset }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9, x: offset }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ ...pop, delay }}
      className="grid size-[152px] place-items-center overflow-hidden rounded-full bg-paper shadow-raised"
    >
      {photo ? (
        <img src={photo} alt="" className="size-full object-cover" />
      ) : (
        <span className="font-mono text-3xl text-secondary">{initial}</span>
      )}
    </motion.span>
  )
}

export default function MatchMoment({ mine, theirs, handle, onOpenWardrobe, onKeepDiscovering }) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.18 } }}
      className="fixed inset-0 z-50 overflow-y-auto bg-paper"
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pt-[max(env(safe-area-inset-top),24px)] pb-[max(env(safe-area-inset-bottom),32px)]">
        <div className="flex justify-center pt-10">
          <Logo size={20} />
        </div>
        <div className="my-auto flex flex-col items-center text-center">
          <div className="flex">
            <Circle photo={mine?.photo} initial={mine?.initial} delay={0.05} offset={-40} />
            <span className="-ml-9">
              <Circle photo={theirs?.photo} initial={theirs?.initial} delay={0.12} offset={40} />
            </span>
          </div>
          <span className="mt-7 font-mono text-[10px] font-medium tracking-[0.16em] text-accent uppercase">Universes collided</span>
          <h2 id="match-title" className="mt-6 font-serif text-[68px] leading-[0.95] text-ink">
            It&apos;s a match.
          </h2>
          <p className="mt-6 max-w-[320px] text-base leading-normal text-secondary">
            Your universe and @{handle}&apos;s share a taste. Their wardrobe is open to you now.
          </p>
        </div>
        <div className="flex flex-col gap-3.5">
          <Button onClick={onOpenWardrobe}>Open their wardrobe</Button>
          <Button variant="secondary" onClick={onKeepDiscovering}>
            Keep discovering
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
