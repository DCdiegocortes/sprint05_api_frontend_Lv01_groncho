import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import Providers from '@/app/Providers.jsx'
import { routes } from '@/app/router.jsx'
import * as authApi from '@/api/auth.js'
import * as itemsApi from '@/api/items.js'
import * as notificationsApi from '@/api/notifications.js'
import * as profileApi from '@/api/profile.js'
import * as universesApi from '@/api/universes.js'
import * as usersApi from '@/api/users.js'
import { clearToken, setToken } from '@/lib/session.js'

vi.mock('@/api/auth.js')
vi.mock('@/api/items.js')
vi.mock('@/api/notifications.js')
vi.mock('@/api/profile.js')
vi.mock('@/api/universes.js')
vi.mock('@/api/users.js')

const admin = {
  id: 1,
  name: 'Admin',
  handle: 'admin',
  email: 'admin@groncho.com',
  role: 'admin',
  avatar_url: null,
  created_at: '2026-09-01T10:00:00Z',
}
const kaeru = { id: 7, name: 'Kaeru', handle: 'kaeru', email: 'kaeru@mail.com', role: 'user', avatar_url: null, created_at: '2026-10-12T10:00:00Z' }
const norke = { id: 8, name: 'Norke', handle: 'norke', email: 'norke@mail.com', role: 'user', avatar_url: null, created_at: '2026-09-03T10:00:00Z' }
const kaeruDetail = {
  ...kaeru,
  universe: {
    id: 30,
    style: 'CHROME, TECH',
    images: [
      { id: 301, url: '/a.jpg' },
      { id: 302, url: '/b.jpg' },
    ],
  },
}
const httpError = (status, data = {}) => Object.assign(new Error('http'), { response: { status, data } })

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
  profileApi.getProfile.mockResolvedValue(admin)
  universesApi.getMyUniverse.mockRejectedValue(httpError(404))
  notificationsApi.getUnreadCount.mockResolvedValue({ unread: 0 })
  notificationsApi.getNotifications.mockResolvedValue([])
  usersApi.getUsers.mockResolvedValue([admin, kaeru, norke])
  usersApi.getUser.mockResolvedValue(kaeruDetail)
  usersApi.getUserItems.mockResolvedValue([{ id: 50, name: 'Silver moto boots', offer_type: 'TRADE', images: [{ id: 501, url: '/c.jpg' }] }])
})

afterEach(() => clearToken())

describe('admin', () => {
  it('lists everyone, filters admins and searches by name or email', async () => {
    renderAt('/admin/users')

    expect(await screen.findByText('Kaeru')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'All · 3' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: 'Admins · 1' }))
    expect(screen.queryByText('Kaeru')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: 'All · 3' }))
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search by name or email' }), 'norke@')
    expect(screen.getByText('Norke')).toBeInTheDocument()
    expect(screen.queryByText('Kaeru')).not.toBeInTheDocument()
  })

  it('sends people who are not admins back to discover', async () => {
    profileApi.getProfile.mockResolvedValue({ ...kaeru })
    const router = renderAt('/admin/users')

    await waitFor(() => expect(router.state.location.pathname).not.toBe('/admin/users'))
  })

  it('lands an admin with no universe on the users list after logging in', async () => {
    clearToken()
    authApi.login.mockResolvedValue({ token: 'tok' })
    const router = renderAt('/login')

    await userEvent.type(await screen.findByLabelText('Email'), 'admin@groncho.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('heading', { name: 'Users' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/admin/users')
  })

  it('shows the Admin group in Profile for admins', async () => {
    renderAt('/profile')

    expect(await screen.findByRole('link', { name: /users and moderation/i })).toHaveAttribute('href', '/admin/users')
  })

  it('deletes a user with the slide and goes back to the list', async () => {
    usersApi.deleteUser.mockResolvedValue({})
    const router = renderAt('/admin/users/7')

    await userEvent.click(await screen.findByRole('button', { name: /delete user/i }))
    const dialog = await screen.findByRole('dialog', { name: 'Delete Kaeru?' })
    within(dialog).getByRole('button', { name: 'Slide to delete' }).focus()
    await userEvent.keyboard('{Enter}')

    expect(await screen.findByText('Kaeru deleted')).toBeInTheDocument()
    expect(usersApi.deleteUser).toHaveBeenCalledWith(7, expect.anything())
    expect(router.state.location.pathname).toBe('/admin/users')
  })

  it('explains when a user cannot be deleted because of swaps', async () => {
    usersApi.deleteUser.mockRejectedValue(httpError(409, { message: 'Cannot delete a user whose items are part of an exchange.' }))
    renderAt('/admin/users/7')

    await userEvent.click(await screen.findByRole('button', { name: /delete user/i }))
    const dialog = await screen.findByRole('dialog')
    within(dialog).getByRole('button', { name: 'Slide to delete' }).focus()
    await userEvent.keyboard('{Enter}')

    expect(await within(dialog).findByRole('heading', { name: "Kaeru can't be deleted" })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Moderate instead' })).toBeInTheDocument()
  })

  it('removes a photo after the undo window and keeps it when undone', async () => {
    universesApi.deleteUniverseImages.mockResolvedValue({})
    renderAt('/admin/users/7/moderate')

    await userEvent.click(await screen.findByRole('button', { name: 'Remove photo 1' }))
    expect(screen.getAllByRole('checkbox')).toHaveLength(1)
    await userEvent.click(await screen.findByRole('button', { name: 'Undo' }))
    expect(screen.getAllByRole('checkbox')).toHaveLength(2)
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)))
    expect(universesApi.deleteUniverseImages).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Remove photo 2' }))
    await waitFor(() => expect(universesApi.deleteUniverseImages).toHaveBeenCalledWith(30, [302]), { timeout: 12000 })
  }, 16000)

  it('selects several photos with shift click and removes them together', async () => {
    renderAt('/admin/users/7/moderate')

    const user = userEvent.setup()
    const [first, second] = await screen.findAllByRole('checkbox')
    await user.keyboard('{Shift>}')
    await user.click(first)
    await user.click(second)
    await user.keyboard('{/Shift}')

    const bar = screen.getByRole('toolbar', { name: 'Selection' })
    expect(within(bar).getByText('2 selected')).toBeInTheDocument()
    await userEvent.click(within(bar).getByRole('button', { name: 'Remove 2' }))
    expect(await screen.findByText('2 photos removed')).toBeInTheDocument()
  })

  it('keeps a piece that was part of a swap', async () => {
    itemsApi.deleteItems.mockRejectedValue(httpError(409))
    renderAt('/admin/users/7/moderate')

    await userEvent.click(await screen.findByRole('radio', { name: 'Pieces · 1' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Remove piece' }))
    expect(screen.queryByText('Silver moto boots')).not.toBeInTheDocument()

    expect(await screen.findByText('Silver moto boots stays', {}, { timeout: 12000 })).toBeInTheDocument()
    expect(screen.getByText('It was part of a swap')).toBeInTheDocument()
    expect(itemsApi.deleteItems).toHaveBeenCalledWith([50])
  }, 16000)
})
