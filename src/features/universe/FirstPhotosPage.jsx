import { useNavigate } from 'react-router'
import Logo from '@/components/Logo.jsx'
import { Button } from '@/components/ui/button.jsx'

export default function FirstPhotosPage() {
  const navigate = useNavigate()

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pt-[max(env(safe-area-inset-top),24px)] pb-[max(env(safe-area-inset-bottom),28px)]">
      <div className="pt-10">
        <Logo size={20} />
      </div>
      <header className="mt-10 flex flex-col gap-1.5">
        <span className="label-mono">003 — Your universe</span>
        <h1 className="text-headline font-bold">
          Add your
          <br />
          photos.
        </h1>
        <p className="font-serif text-subline text-secondary">Pick a layout and watch it come alive.</p>
      </header>
      <div className="mt-auto flex flex-col items-center gap-3 pt-8">
        <Button className="w-full" onClick={() => navigate('/discover')}>
          Enter Discover
        </Button>
      </div>
    </main>
  )
}
