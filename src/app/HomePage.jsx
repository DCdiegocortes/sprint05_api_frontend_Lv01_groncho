import Logo from '@/components/Logo.jsx'
import { Button } from '@/components/ui/button.jsx'
import { useAuth } from '@/features/auth/useAuth.js'

export default function HomePage({ label, title }) {
  const { user, logout } = useAuth()

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pt-16 pb-10">
      <Logo size={20} />
      <header className="mt-10 flex flex-col gap-2">
        <span className="label-mono">{label}</span>
        <h1 className="text-headline font-bold">{title}</h1>
        <p className="font-serif text-subline text-secondary">
          Logged in as {user?.name} · @{user?.handle}
        </p>
      </header>
      <Button variant="secondary" className="mt-auto" onClick={logout}>
        Log out
      </Button>
    </main>
  )
}
