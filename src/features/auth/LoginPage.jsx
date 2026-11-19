import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { loginSchema } from '@/lib/schemas.js'
import { useAuth } from './useAuth.js'
import AuthScreen from './AuthScreen.jsx'
import FormError from './FormError.jsx'

export default function LoginPage() {
  const { login, sessionEnded } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values, location.state?.from ?? '/discover')
    } catch (error) {
      const status = error?.response?.status
      setError('root', {
        message: status === 401 ? 'That email and password do not match.' : 'We could not reach Grôncho. Try again.',
      })
    }
  })

  return (
    <AuthScreen
      onSubmit={onSubmit}
      actions={
        <>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Opening your universe' : 'Log in'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/register')}>
            Create account
          </Button>
        </>
      }
    >
      <header className="mt-10 flex flex-col gap-2">
        <span className="label-mono">001 — Access</span>
        <h1 className="text-headline font-bold">
          Let&apos;s loop through
          <br />
          the universes.
        </h1>
      </header>
      <div className="mt-8 flex flex-col gap-5">
        {sessionEnded && !errors.root && <FormError message="Your session ended. Log in again." />}
        <FormError message={errors.root?.message} />
        <Input label="Email" type="email" autoComplete="email" placeholder="you@email.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" autoComplete="current-password" placeholder="··········" error={errors.password?.message} {...register('password')} />
      </div>
    </AuthScreen>
  )
}
