import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Trash2 } from 'lucide-react'
import SlideToConfirm from '@/components/SlideToConfirm.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Panel, PanelTitle } from '@/components/ui/panel.jsx'
import { UserAvatar } from './AdminBits.jsx'
import { useDeleteUser } from './useAdmin.js'

export default function DeleteUserPanel({ user, onClose, onDeleted }) {
  const navigate = useNavigate()
  const remove = useDeleteUser()
  const [blocked, setBlocked] = useState(false)
  const [problem, setProblem] = useState('')
  const [attempt, setAttempt] = useState(0)

  const confirm = () =>
    remove.mutate(user.id, {
      onSuccess: () => onDeleted(user),
      onError: (error) => {
        if (error?.response?.status === 409) setBlocked(true)
        else {
          setProblem(error?.response?.data?.message ?? 'That did not go through. Try again.')
          setAttempt((count) => count + 1)
        }
      },
    })

  return (
    <Panel open onOpenChange={(open) => !open && onClose()} className="items-center md:w-[520px]">
      <UserAvatar user={user} size={72} />
      <div className="flex flex-col items-center gap-1.5 text-center">
        <PanelTitle className="text-2xl font-bold tracking-[-0.03em] text-ink md:text-[28px]">
          {blocked ? `${user.name} can't be deleted` : `Delete ${user.name}?`}
        </PanelTitle>
        <p className="font-serif text-lg leading-[1.18] text-secondary">
          {blocked
            ? 'Some of their pieces were part of a swap. You can still moderate their photos and pieces.'
            : "Their universe, pieces and matches go for good. This can't be undone."}
        </p>
      </div>
      {blocked ? (
        <>
          <Button className="w-full" onClick={() => navigate(`/admin/users/${user.id}/moderate`)}>
            Moderate instead
          </Button>
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Close
          </Button>
        </>
      ) : (
        <>
          <SlideToConfirm key={attempt} label="Slide to delete" icon={Trash2} disabled={remove.isPending} onConfirm={confirm} />
          {problem && (
            <p role="alert" className="flex items-center gap-2 text-[13px] text-ink">
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
              {problem}
            </p>
          )}
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Keep this user
          </Button>
        </>
      )}
    </Panel>
  )
}
