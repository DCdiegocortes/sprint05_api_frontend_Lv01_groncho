import { useCallback, useState } from 'react'
import { Camera, ChevronRight, LogOut } from 'lucide-react'
import Avatar from '@/components/Avatar.jsx'
import PageHeader from '@/components/PageHeader.jsx'
import Toast from '@/components/Toast.jsx'
import { useAuth } from '@/features/auth/useAuth.js'
import { EditProfilePanel, LogoutPanel, PasswordPanel } from './ProfilePanels.jsx'
import { usePhotoPicker } from './usePhotoPicker.jsx'

function Group({ label, children }) {
  return (
    <section className="flex flex-col gap-[18px]">
      <span className="font-mono text-[10px] leading-[13px] font-medium tracking-[0.16em] text-ink uppercase">{label}</span>
      {children}
    </section>
  )
}

function Row({ label, value, onClick }) {
  return (
    <button type="button" onClick={onClick} className="group flex h-[46px] w-full items-center gap-2.5 text-left">
      <span className="w-[84px] shrink-0 font-mono text-[10px] tracking-[0.12em] text-secondary uppercase">{label}</span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold tracking-[-0.01em] text-ink">{value}</span>
      <ChevronRight
        className="size-4 shrink-0 text-secondary transition-transform duration-220 ease-ui group-hover:translate-x-0.5"
        strokeWidth={1.8}
      />
    </button>
  )
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const photo = usePhotoPicker()
  const [open, setOpen] = useState(null)
  const [leaving, setLeaving] = useState(false)
  const [toast, setToast] = useState(null)
  const clearToast = useCallback(() => setToast(null), [])
  const close = () => setOpen(null)
  const saved = (title) => () => {
    close()
    setToast({ title, hint: 'Saved' })
  }

  if (!user) return <PageHeader label="007 — Profile" title="Profile" />

  return (
    <div className="flex flex-col gap-[18px] xl:gap-10">
      <PageHeader label="007 — Profile" title="Profile" subline="How others find you." />

      <div className="flex w-full flex-col gap-7 xl:mx-auto xl:w-[640px] xl:gap-10">
        <section className="flex flex-col items-center gap-2.5 rounded-[28px] bg-paper px-5 py-6 text-center shadow-raised xl:flex-row xl:gap-5 xl:py-5 xl:pr-6 xl:pl-5 xl:text-left">
          <button type="button" aria-label="Change photo" onClick={photo.open} disabled={photo.busy} className="press relative shrink-0 rounded-full">
            <Avatar user={user} size={96} className="shadow-raised" />
            <span className="absolute right-0 bottom-0 grid size-8 place-items-center rounded-full bg-accent text-white shadow-accent">
              <Camera className="size-3.5" strokeWidth={1.8} />
            </span>
          </button>
          {photo.field}
          <div className="flex min-w-0 flex-col gap-1.5 xl:flex-1">
            <h2 className="truncate text-[26px] leading-tight font-bold tracking-[-0.03em] text-ink xl:text-[28px]">{user.name}</h2>
            <span className="font-mono text-[10px] tracking-[0.16em] text-secondary uppercase">@{user.handle}</span>
          </div>
          <button
            type="button"
            onClick={photo.open}
            disabled={photo.busy}
            className="press hidden shrink-0 text-[15px] font-medium text-accent transition-opacity duration-220 ease-ui hover:opacity-70 xl:block"
          >
            {photo.busy ? 'Uploading' : 'Change photo'}
          </button>
        </section>
        {photo.error && <p className="text-center text-[13px] text-secondary">{photo.error}</p>}

        <Group label="Account">
          <div className="rounded-[20px] bg-paper px-[18px] py-1.5 shadow-raised [&>button+button]:border-t [&>button+button]:border-ink/[0.07]">
            <Row label="Name" value={user.name} onClick={() => setOpen('profile')} />
            <Row label="Email" value={user.email} onClick={() => setOpen('profile')} />
            <Row label="Password" value="••••••••" onClick={() => setOpen('password')} />
          </div>
        </Group>

        <Group label="Session">
          <button
            type="button"
            onClick={() => setOpen('logout')}
            className="press flex w-full items-center justify-center gap-3 h-[58px] rounded-[20px] bg-paper px-[18px] shadow-raised transition-opacity duration-220 ease-ui hover:opacity-80"
          >
            <LogOut className="size-[18px] text-accent" strokeWidth={1.8} />
            <span className="text-[15px] font-medium text-accent">Log out</span>
          </button>
        </Group>
      </div>

      {open === 'profile' && <EditProfilePanel user={user} onClose={close} onSaved={saved('Profile updated')} />}
      {open === 'password' && <PasswordPanel onClose={close} onSaved={saved('Password updated')} />}
      {open === 'logout' && (
        <LogoutPanel
          user={user}
          busy={leaving}
          onClose={close}
          onConfirm={() => {
            setLeaving(true)
            logout()
          }}
        />
      )}
      <Toast toast={toast} onDone={clearToast} />
    </div>
  )
}
