import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import Providers from '@/app/Providers.jsx'
import { routes } from '@/app/router.jsx'
import * as authApi from '@/api/auth.js'
import * as notificationsApi from '@/api/notifications.js'
import * as profileApi from '@/api/profile.js'
import * as universesApi from '@/api/universes.js'
import { clearToken, getToken, setToken } from '@/lib/session.js'

vi.mock('@/api/auth.js')
vi.mock('@/api/notifications.js')
vi.mock('@/api/profile.js')
vi.mock('@/api/universes.js')

const ana = {
  id: 1,
  name: 'Ana Ruiz',
  handle: 'ana',
  email: 'ana@groncho.test',
  role: 'user',
  avatar_url: null,
}

function renderAt(path) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <Providers client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <RouterProvider router={router} />
    </Providers>,
  )
  return router
}

beforeEach(() => {
  vi.resetAllMocks()
  setToken('tok')
  profileApi.getProfile.mockResolvedValue(ana)
  universesApi.getMyUniverse.mockResolvedValue({
    id: 1,
    name: 'Soft Minimal',
    images: [],
  })
  notificationsApi.getUnreadCount.mockResolvedValue({ unread: 0 })
  notificationsApi.getNotifications.mockResolvedValue([])
  authApi.logout.mockResolvedValue({})
})

afterEach(() => clearToken())

describe('profile', () => {
  it('shows the identity and the account rows', async () => {
    renderAt('/profile')

    expect(await screen.findByRole('heading', { name: 'Ana Ruiz' })).toBeInTheDocument()
    expect(screen.getAllByText('@ana').length).toBeGreaterThan(0)
    expect(screen.getByText('ana@groncho.test')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
  })

  it('saves a new name and email', async () => {
    profileApi.updateProfile.mockResolvedValue({ ...ana, name: 'Ana R' })
    renderAt('/profile')

    await userEvent.click(await screen.findByRole('button', { name: /^name/i }))
    const dialog = await screen.findByRole('dialog', { name: 'Edit profile' })
    const name = within(dialog).getByLabelText('Name')
    await userEvent.clear(name)
    await userEvent.type(name, 'Ana R')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }))

    expect(profileApi.updateProfile).toHaveBeenCalledWith({ name: 'Ana R', email: 'ana@groncho.test' }, expect.anything())
    expect(await screen.findByText('Profile updated')).toBeInTheDocument()
  })

  it('shows the error the API returns for the email', async () => {
    profileApi.updateProfile.mockRejectedValue({
      response: {
        status: 422,
        data: { errors: { email: ['That email is already in use.'] } },
      },
    })
    renderAt('/profile')

    await userEvent.click(await screen.findByRole('button', { name: /^email/i }))
    const dialog = await screen.findByRole('dialog', { name: 'Edit profile' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }))

    expect(await within(dialog).findByText('That email is already in use.')).toBeInTheDocument()
  })

  it('checks the new password before sending it', async () => {
    profileApi.updateProfile.mockResolvedValue(ana)
    renderAt('/profile')

    await userEvent.click(await screen.findByRole('button', { name: /^password/i }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Change password',
    })
    await userEvent.type(within(dialog).getByLabelText('Current password'), 'oldpass12')
    await userEvent.type(within(dialog).getByLabelText('New password'), 'short')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Update password' }))

    expect(within(dialog).getByText('Use at least 8 characters.')).toBeInTheDocument()
    expect(profileApi.updateProfile).not.toHaveBeenCalled()

    await userEvent.clear(within(dialog).getByLabelText('New password'))
    await userEvent.type(within(dialog).getByLabelText('New password'), 'newpass123')
    await userEvent.type(within(dialog).getByLabelText('Repeat new password'), 'newpass123')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Update password' }))

    expect(profileApi.updateProfile).toHaveBeenCalledWith(
      {
        current_password: 'oldpass12',
        password: 'newpass123',
        password_confirmation: 'newpass123',
      },
      expect.anything(),
    )
  })

  it('frames the chosen photo, then uploads the crop', async () => {
    profileApi.uploadAvatar.mockResolvedValue({ ...ana, avatar_url: '/a.jpg' })
    URL.createObjectURL = vi.fn(() => 'blob:me')
    URL.revokeObjectURL = vi.fn()
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ drawImage: vi.fn() }))
    HTMLCanvasElement.prototype.toBlob = vi.fn(function (done) {
      done(new Blob(['x'], { type: 'image/jpeg' }))
    })
    renderAt('/profile')
    await screen.findByRole('heading', { name: 'Ana Ruiz' })

    await userEvent.upload(screen.getAllByTestId('avatar-input')[0], new File(['x'], 'me.png', { type: 'image/png' }))
    const dialog = await screen.findByRole('dialog', { name: 'Frame your photo' })
    expect(profileApi.uploadAvatar).not.toHaveBeenCalled()

    const photo = dialog.querySelector('img')
    Object.defineProperty(photo, 'naturalWidth', { value: 800 })
    Object.defineProperty(photo, 'naturalHeight', { value: 1000 })
    fireEvent.load(photo)
    await userEvent.click(within(dialog).getByRole('button', { name: 'Use photo' }))

    await waitFor(() => expect(profileApi.uploadAvatar).toHaveBeenCalled())
    const sent = profileApi.uploadAvatar.mock.calls[0][0]
    expect(sent.name).toBe('me.jpg')
    expect(sent.type).toBe('image/jpeg')
  })

  it('logs out from the slide and lands on the welcome screen with a toast', async () => {
    const router = renderAt('/profile')

    await userEvent.click(await screen.findByRole('button', { name: /log out/i }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Log out of Grôncho?',
    })
    within(dialog).getByRole('button', { name: 'Slide to log out' }).focus()
    await userEvent.keyboard('{Enter}')

    expect(await screen.findByText('You are logged out')).toBeInTheDocument()
    expect(authApi.logout).toHaveBeenCalled()
    expect(getToken()).toBeNull()
    expect(router.state.location.pathname).toBe('/')
  })
})
