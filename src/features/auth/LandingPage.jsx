import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button.jsx'
import AuthScreen from './AuthScreen.jsx'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <AuthScreen
      actions={
        <>
          <Button onClick={() => navigate('/login')}>Log in</Button>
          <Button variant="secondary" onClick={() => navigate('/register')}>
            Create account
          </Button>
        </>
      }
    >
      <section className="mt-auto flex flex-col">
        <span className="label-mono">000 — Welcome</span>
        <h1 className="mt-4 font-serif text-[78px] leading-[0.92] font-normal tracking-[-0.01em] text-ink">
          <span className="text-accent">Taste</span> is
          <br />
          the only
          <br />
          currency.
        </h1>
        <p className="mt-6 text-[11px] font-bold tracking-[0.04em] text-ink uppercase">Universes collide. Clothes change hands.</p>
        <p className="mt-3 text-base leading-[1.5] text-secondary">
          A clothing exchange where aesthetic affinity comes before ownership. No money, just universes finding each other.
        </p>
      </section>
    </AuthScreen>
  )
}
