import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import Providers from '@/app/Providers.jsx'
import { routes } from '@/app/router.jsx'
import * as authApi from '@/api/auth.js'
import * as notificationsApi from '@/api/notifications.js'
import * as profileApi from '@/api/profile.js'
import * as universesApi from '@/api/universes.js'
import { clearToken, getToken } from '@/lib/session.js'

vi.mock('@/api/auth.js')
vi.mock('@/api/profile.js')
vi.mock('@/api/universes.js')
vi.mock('@/api/notifications.js')

const ana = { id: 1, name: 'Ana', handle: 'ana', role: 'user', avatar_url: null }

function renderAt(path) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <Providers client={client}>
      <RouterProvider router={router} />
    </Providers>,
  )
  return router
}

function httpError(status, data = {}) {
  return Object.assign(new Error(`HTTP ${status}`), { response: { status, data } })
}

beforeEach(() => {
  clearToken()
  vi.resetAllMocks()
  profileApi.getProfile.mockResolvedValue(ana)
  universesApi.getMyUniverse.mockResolvedValue({ id: 1, name: 'Soft Minimal', images: [] })
  notificationsApi.getUnreadCount.mockResolvedValue({ unread: 0 })
})

describe('auth', () => {
  it('sends guests from a private page to log in', async () => {
    renderAt('/discover')
    expect(await screen.findByRole('heading', { name: /let's loop through/i })).toBeInTheDocument()
  })

  it('validates the log in form before calling the api', async () => {
    renderAt('/login')
    await userEvent.click(await screen.findByRole('button', { name: 'Log in' }))

    expect(await screen.findByText('Write your email.')).toBeInTheDocument()
    expect(screen.getByText('Write your password.')).toBeInTheDocument()
    expect(authApi.login).not.toHaveBeenCalled()
  })

  it('logs in, keeps the token and opens discover', async () => {
    authApi.login.mockResolvedValue({ token: 'tok' })
    renderAt('/login')

    await userEvent.type(await screen.findByLabelText('Email'), 'ana@groncho.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('heading', { name: 'Discover' })).toBeInTheDocument()
    expect(getToken()).toBe('tok')
    expect(authApi.login).toHaveBeenCalledWith({ email: 'ana@groncho.com', password: 'password' })
  })

  it('explains wrong credentials', async () => {
    authApi.login.mockRejectedValue(httpError(401, { message: 'Invalid credentials' }))
    renderAt('/login')

    await userEvent.type(await screen.findByLabelText('Email'), 'ana@groncho.com')
    await userEvent.type(screen.getByLabelText('Password'), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('That email and password do not match.')
  })

  it('shows the api validation errors on sign up', async () => {
    authApi.register.mockRejectedValue(httpError(422, { errors: { email: ['The email has already been taken.'] } }))
    renderAt('/register')

    await userEvent.type(await screen.findByLabelText('Name'), 'Ana')
    await userEvent.type(screen.getByLabelText('Email'), 'ana@groncho.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'password')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByText('The email has already been taken.')).toBeInTheDocument()
  })

  it('signs up, logs in right after and goes to create the universe', async () => {
    authApi.register.mockResolvedValue({ id: 9, name: 'Nina' })
    authApi.login.mockResolvedValue({ token: 'new' })
    profileApi.getProfile.mockResolvedValue({ ...ana, name: 'Nina', handle: 'nina' })
    universesApi.getMyUniverse.mockRejectedValue(httpError(404))
    renderAt('/register')

    await userEvent.type(await screen.findByLabelText('Name'), 'Nina')
    await userEvent.type(screen.getByLabelText('Email'), 'nina@groncho.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'password')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByRole('heading', { name: /create your/i })).toBeInTheDocument()
    expect(authApi.login).toHaveBeenCalledWith({ email: 'nina@groncho.com', password: 'password' })
  })
})
