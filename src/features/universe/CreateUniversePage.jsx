import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { createUniverse } from '@/api/universes.js'
import Logo from '@/components/Logo.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Chip } from '@/components/ui/chip.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Limits } from '@/lib/constants.js'
import { queryKeys } from '@/lib/queryKeys.js'
import { cn } from '@/lib/utils'
import OwnStyleDialog from './OwnStyleDialog.jsx'
import StepCard from './StepCard.jsx'
import { displayStyle, fixedStyles, joinStyles } from './styles.js'

const progressCopy = ["Let's begin", 'Good start', 'Almost there', 'All set']

export default function CreateUniversePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [styles, setStyles] = useState([])
  const [ownStyles, setOwnStyles] = useState([])
  const [description, setDescription] = useState('')
  const [active, setActive] = useState(1)
  const [ownOpen, setOwnOpen] = useState(false)
  const [nameError, setNameError] = useState('')

  const create = useMutation({
    mutationFn: createUniverse,
    onSuccess: (universe) => {
      queryClient.setQueryData(queryKeys.myUniverse, { ...universe, images: [] })
      navigate('/universe/new/photos', { replace: true })
    },
    onError: (error) => {
      const errors = error?.response?.data?.errors
      if (errors?.user_id) navigate('/discover', { replace: true })
      setNameError(errors?.name?.[0] ?? 'We could not create your universe. Try again.')
    },
  })

  const done = [name.trim().length > 0, styles.length > 0, description.trim().length > 0].filter(Boolean).length

  const toggle = (style) =>
    setStyles((current) => (current.includes(style) ? current.filter((s) => s !== style) : [...current, style]))

  const addOwn = (style) => {
    setOwnStyles((current) => (current.includes(style) ? current : [...current, style]))
    setStyles((current) => (current.includes(style) ? current : [...current, style]))
  }

  const submit = (event) => {
    event.preventDefault()
    if (!name.trim()) {
      setActive(1)
      setNameError('Your universe needs a name.')
      return
    }
    create.mutate({
      name: name.trim(),
      style: styles.length ? joinStyles(styles) : null,
      description: description.trim() || null,
    })
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pt-[max(env(safe-area-inset-top),24px)] pb-[max(env(safe-area-inset-bottom),28px)]"
    >
      <div className="flex items-center justify-between pt-10">
        <Logo size={20} />
        <div className="flex flex-col items-end gap-1.5" aria-label={`${done} of 3 done`}>
          <div className="flex gap-1">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className={cn('h-1 w-[22px] rounded-full transition-colors duration-300 ease-ui', index < done ? 'bg-accent' : 'bg-plate')}
              />
            ))}
          </div>
          <span className="label-mono text-[8.5px]">
            {done} of 3 · {progressCopy[done]}
          </span>
        </div>
      </div>

      <header className="mt-10 flex flex-col gap-1.5">
        <span className="label-mono">003 — Your universe</span>
        <h1 className="text-headline font-bold">
          Create your
          <br />
          universe.
        </h1>
        <p className="font-serif text-subline text-secondary">Three quick things. You can change them later.</p>
      </header>

      <div className="mt-7 flex flex-col gap-4">
        <StepCard number="01" title="Name it" status={name.trim() ? 'Done' : 'Required'} statusTone={name.trim() ? 'accent' : 'muted'} active={active === 1} onActivate={() => setActive(1)}>
          <Input
            aria-label="Universe name"
            value={name}
            maxLength={Limits.NAME_MAX}
            placeholder="Dark Academia"
            error={nameError}
            onChange={(event) => {
              setName(event.target.value)
              setNameError('')
            }}
          />
        </StepCard>

        <StepCard
          number="02"
          title="Pick your styles"
          status={styles.length ? `${styles.length} picked` : 'Pick any'}
          statusTone={styles.length ? 'accent' : 'muted'}
          active={active === 2}
          onActivate={() => setActive(2)}
        >
          <div className="flex flex-wrap gap-2">
            {[...fixedStyles, ...ownStyles].map((style) => (
              <Chip key={style} selected={styles.includes(style)} onSelectedChange={() => toggle(style)} className="h-[30px] px-3 text-xs">
                {displayStyle(style)}
              </Chip>
            ))}
            <button
              type="button"
              onClick={() => setOwnOpen(true)}
              className="press inline-flex h-[30px] items-center rounded-full border border-dashed border-secondary px-3 text-xs font-medium text-secondary transition-colors duration-220 ease-ui hover:border-accent hover:text-accent"
            >
              + Your own
            </button>
          </div>
        </StepCard>

        <StepCard number="03" title="Say it in a line" status="Optional" active={active === 3} onActivate={() => setActive(3)}>
          <label className="sr-only" htmlFor="universe-description">
            Description
          </label>
          <input
            id="universe-description"
            value={description}
            maxLength={Limits.DESCRIPTION_MAX}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Knots, nobility and tradition"
            className="h-[50px] w-full rounded-md bg-paper px-4 font-serif text-lg text-ink shadow-inset outline-none placeholder:text-muted focus:ring-1 focus:ring-accent"
          />
          <p className="font-serif text-sm text-secondary">Shows under your name in Discover.</p>
        </StepCard>
      </div>

      <div className="mt-auto flex flex-col items-center gap-3 pt-8">
        <Button type="submit" className="w-full" disabled={create.isPending}>
          {create.isPending ? 'Building your universe' : 'Create universe'}
        </Button>
        <span className="label-mono text-[9px]">Next · Dress it in photos</span>
      </div>

      <OwnStyleDialog open={ownOpen} onOpenChange={setOwnOpen} styles={styles} onAdd={addOwn} />
    </form>
  )
}
