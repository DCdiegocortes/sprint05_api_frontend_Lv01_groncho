import { useState } from 'react'
import { LogOut } from 'lucide-react'
import Avatar from '@/components/Avatar.jsx'
import SlideToConfirm from '@/components/SlideToConfirm.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Panel, PanelClose, PanelTitle } from '@/components/ui/panel.jsx'
import { usePhotoPicker } from './usePhotoPicker.jsx'
import { fieldErrors, useRemoveAvatar, useUpdateProfile } from './useProfile.js'

const PASSWORD_MIN = 8

function Problem({ children }) {
  return (
    <p role="alert" className="flex items-center gap-2 text-[13px] text-ink">
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
      {children}
    </p>
  )
}

function Header({ title, body }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <PanelTitle className="text-[26px] leading-tight font-bold tracking-[-0.03em] text-ink">{title}</PanelTitle>
        <p className="font-serif text-lg leading-snug text-secondary">{body}</p>
      </div>
      <PanelClose />
    </div>
  )
}

function TextButton({ children, ...props }) {
  return (
    <button
      type="button"
      className="press self-start py-1 text-[15px] font-medium text-accent transition-opacity duration-220 ease-ui hover:opacity-70 disabled:opacity-40"
      {...props}
    >
      {children}
    </button>
  )
}

export function EditProfilePanel({ user, onClose, onSaved }) {
  const update = useUpdateProfile()
  const remove = useRemoveAvatar()
  const photo = usePhotoPicker()
  const [name, setName] = useState(user.name ?? '')
  const [email, setEmail] = useState(user.email ?? '')
  const [errors, setErrors] = useState({})

  const save = (event) => {
    event.preventDefault()
    const found = {}
    if (!name.trim()) found.name = 'Tell us your name.'
    if (!email.trim()) found.email = 'Write your email.'
    setErrors(found)
    if (Object.keys(found).length) return
    update.mutate(
      { name: name.trim(), email: email.trim() },
      {
        onSuccess: onSaved,
        onError: (failure) => setErrors(fieldErrors(failure)),
      },
    )
  }

  return (
    <Panel open onOpenChange={(open) => !open && onClose()} className="md:w-[480px]">
      <form onSubmit={save} noValidate className="flex flex-col gap-[18px]">
        <Header title="Edit profile" body="Your name and email." />
        <div className="flex items-center gap-4">
          <Avatar user={user} size={64} className="shadow-raised" />
          <div className="flex flex-col gap-0.5">
            <TextButton disabled={photo.busy} onClick={photo.open}>
              {photo.busy ? 'Uploading' : 'Change photo'}
            </TextButton>
            {user.avatar_url && (
              <TextButton disabled={remove.isPending} onClick={() => remove.mutate()}>
                Remove photo
              </TextButton>
            )}
          </div>
          {photo.field}
        </div>
        {photo.error && <Problem>{photo.error}</Problem>}
        <Input label="Name" value={name} error={errors.name} onChange={(event) => setName(event.target.value)} />
        <Input label="Email" type="email" value={email} error={errors.email} onChange={(event) => setEmail(event.target.value)} />
        {errors.root && <Problem>{errors.root}</Problem>}
        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? 'Saving' : 'Save changes'}
        </Button>
      </form>
    </Panel>
  )
}

export function PasswordPanel({ onClose, onSaved }) {
  const update = useUpdateProfile()
  const [values, setValues] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState({})
  const set = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }))

  const save = (event) => {
    event.preventDefault()
    const found = {}
    if (!values.current_password) found.current_password = 'Write your current password.'
    if (values.password.length < PASSWORD_MIN) found.password = `Use at least ${PASSWORD_MIN} characters.`
    else if (values.password !== values.password_confirmation) found.password_confirmation = 'The passwords do not match.'
    setErrors(found)
    if (Object.keys(found).length) return
    update.mutate(values, {
      onSuccess: onSaved,
      onError: (failure) => setErrors(fieldErrors(failure)),
    })
  }

  return (
    <Panel open onOpenChange={(open) => !open && onClose()} className="md:w-[480px]">
      <form onSubmit={save} noValidate className="flex flex-col gap-[18px]">
        <Header title="Change password" body={`At least ${PASSWORD_MIN} characters.`} />
        <Input
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={values.current_password}
          error={errors.current_password}
          onChange={set('current_password')}
        />
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          error={errors.password}
          onChange={set('password')}
        />
        <Input
          label="Repeat new password"
          type="password"
          autoComplete="new-password"
          value={values.password_confirmation}
          error={errors.password_confirmation}
          onChange={set('password_confirmation')}
        />
        {errors.root && <Problem>{errors.root}</Problem>}
        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? 'Saving' : 'Update password'}
        </Button>
      </form>
    </Panel>
  )
}

export function LogoutPanel({ user, onClose, onConfirm, busy }) {
  return (
    <Panel open onOpenChange={(open) => !open && onClose()} className="items-center md:w-[520px]">
      <Avatar user={user} size={72} className="shadow-raised" />
      <div className="flex flex-col items-center gap-1.5 text-center">
        <PanelTitle className="text-2xl font-bold tracking-[-0.03em] text-ink md:text-[28px]">Log out of Grôncho?</PanelTitle>
        <p className="font-serif text-lg leading-[1.18] text-secondary">Your universe, closet and matches stay here for next time.</p>
      </div>
      <SlideToConfirm label="Slide to log out" icon={LogOut} disabled={busy} onConfirm={onConfirm} />
      <Button variant="secondary" className="w-full" onClick={onClose}>
        Stay
      </Button>
    </Panel>
  )
}
