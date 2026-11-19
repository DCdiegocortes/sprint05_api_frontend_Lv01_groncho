import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog.jsx'
import { Input } from '@/components/ui/input.jsx'
import { remainingForNewStyle } from './styles.js'

export default function OwnStyleDialog({ open, onOpenChange, styles, onAdd }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const max = remainingForNewStyle(styles)

  const close = (next) => {
    if (!next) {
      setValue('')
      setError('')
    }
    onOpenChange(next)
  }

  const submit = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const style = value.trim().replace(/,/g, ' ').replace(/\s+/g, ' ').toUpperCase()
    if (!style) return setError('Give your style a name.')
    if (styles.includes(style)) return setError('You already picked that one.')
    onAdd(style)
    close(false)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <form onSubmit={submit} noValidate className="flex flex-col gap-[22px]">
          <div className="flex items-center gap-2 pr-8">
            <span aria-hidden="true" className="size-[5px] rounded-full bg-accent" />
            <DialogTitle className="label-mono text-[9px] font-normal">Your own style</DialogTitle>
          </div>
          <DialogDescription className="sr-only">Name a style that is not in the list.</DialogDescription>
          <Input
            aria-label="Style name"
            autoFocus
            value={value}
            maxLength={max}
            onChange={(event) => {
              setValue(event.target.value)
              setError('')
            }}
            placeholder="Japandi"
            error={error}
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => close(false)}
              className="press text-sm font-medium text-secondary transition-opacity duration-220 ease-ui hover:opacity-70"
            >
              Cancel
            </button>
            <Button type="submit" size="sm">
              Add style
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
