import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { applyApiErrors } from '@/lib/apiErrors.js'
import { registerSchema } from '@/lib/schemas.js'
import { useAuth } from './useAuth.js'
import AuthScreen from './AuthScreen.jsx'
import FormError from './FormError.jsx'

export default function RegisterPage() {
  const { register: createAccount } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createAccount(values)
    } catch (error) {
      applyApiErrors(error, setError, 'We could not create your account. Try again.')
    }
  })

  return (
    <AuthScreen
      onSubmit={onSubmit}
      actions={
        <>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Making room for you' : 'Create account'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/login')}>
            I already have an account
          </Button>
        </>
      }
    >
      <header className="mt-10 flex flex-col gap-2">
        <span className="label-mono">002 — Register</span>
        <h1 className="text-headline font-bold">
          Join
          <br />
          Grôncho.
        </h1>
      </header>
      <div className="mt-8 flex flex-col gap-5">
        <FormError message={errors.root?.message} />
        <Input label="Name" autoComplete="name" placeholder="Your name" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" autoComplete="email" placeholder="you@email.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" autoComplete="new-password" placeholder="··········" error={errors.password?.message} {...register('password')} />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="··········"
          error={errors.password_confirmation?.message}
          {...register('password_confirmation')}
        />
      </div>
    </AuthScreen>
  )
}
