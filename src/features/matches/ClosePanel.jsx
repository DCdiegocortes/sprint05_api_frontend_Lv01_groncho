import { useState } from 'react'
import { X } from 'lucide-react'
import Avatar from '@/components/Avatar.jsx'
import SlideToConfirm from '@/components/SlideToConfirm.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Panel, PanelTitle } from '@/components/ui/panel.jsx'
import { useAuth } from '@/features/auth/useAuth.js'
import { useCloseMatch } from './useMatches.js'

export default function ClosePanel({ match, open, onOpenChange, onClosed }) {
  const { user } = useAuth()
  const close = useCloseMatch()
  const [error, setError] = useState('')
  const handle = `@${match.partner.handle}`

  const confirm = () =>
    close.mutate(match.id, {
      onSuccess: () => {
        onOpenChange(false)
        onClosed(handle)
      },
      onError: () => setError('The match could not be closed. Try again.'),
    })

  return (
    <Panel open={open} onOpenChange={onOpenChange} className="items-center md:w-[520px]">
      <div className="flex items-center">
        <Avatar user={user} size={84} className="ring-[3px] ring-paper" />
        <Avatar user={match.partner} size={84} className="-ml-3.5 ring-[3px] ring-paper" />
      </div>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <PanelTitle className="text-2xl font-bold tracking-[-0.03em] text-ink md:text-[28px]">Close your match with {handle}?</PanelTitle>
        <p className="font-serif text-lg leading-snug text-secondary">
          Their wardrobe closes for you, and yours for them. Requests already sent stay as they are.
        </p>
      </div>
      <SlideToConfirm label="Slide to close" icon={X} disabled={close.isPending} onConfirm={confirm} />
      {error && (
        <p role="alert" className="flex items-center gap-2 text-[13px] text-ink">
          <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
          {error}
        </p>
      )}
      <Button variant="secondary" className="w-full" onClick={() => onOpenChange(false)}>
        Keep the match
      </Button>
    </Panel>
  )
}
