import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import Providers from '@/app/Providers.jsx'
import { routes } from '@/app/router.jsx'
import * as notificationsApi from '@/api/notifications.js'
import * as profileApi from '@/api/profile.js'
import * as universesApi from '@/api/universes.js'
import { clearToken, setToken } from '@/lib/session.js'

vi.mock('@/api/notifications.js')
vi.mock('@/api/profile.js')
vi.mock('@/api/universes.js')

const now = new Date().toISOString()
const notifications = [
  {
    id: 'a',
    type: 'EXCHANGE_REQUESTED',
    actor: { id: 7, name: 'kaeru', handle: 'kaeru', avatar_url: null },
    item_name: 'Silver moto boots',
    exchange_type: 'TRADE',
    read_at: null,
    created_at: now,
  },
  {
    id: 'b',
    type: 'MATCH_CREATED',
    actor: { id: 8, name: 'lyren', handle: 'lyren', avatar_url: null },
    match_id: 12,
    read_at: null,
    created_at: now,
  },
  { id: 'c', type: 'UNIVERSE_PHOTO_REMOVED', actor: null, photos_removed: 2, read_at: now, created_at: '2026-01-02T10:00:00Z' },
]

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
  profileApi.getProfile.mockResolvedValue({ id: 1, name: 'Ana', handle: 'ana', role: 'user', avatar_url: null })
  universesApi.getMyUniverse.mockResolvedValue({ id: 1, name: 'Soft Minimal', images: [] })
  notificationsApi.getUnreadCount.mockResolvedValue({ unread: 2 })
  notificationsApi.getNotifications.mockResolvedValue(notifications)
  notificationsApi.markNotificationRead.mockResolvedValue({})
  notificationsApi.markAllNotificationsRead.mockResolvedValue({})
  notificationsApi.deleteNotification.mockResolvedValue({})
})

afterEach(() => {
  vi.useRealTimers()
  clearToken()
})

describe('notifications', () => {
  it('lists today and earlier with a line for every type', async () => {
    renderAt('/notifications')

    expect(await screen.findByText('@kaeru wants your Silver moto boots')).toBeInTheDocument()
    expect(screen.getByText('New match with @lyren')).toBeInTheDocument()
    expect(screen.getByText('A moderator removed 2 photos from your universe')).toBeInTheDocument()
    expect(screen.getByText('2 new')).toBeInTheDocument()
  })

  it('opens a notification, marks it read and goes to its screen', async () => {
    const router = renderAt('/notifications')

    await userEvent.click(await screen.findByText('New match with @lyren'))

    expect(notificationsApi.markNotificationRead).toHaveBeenCalledWith('b', expect.anything())
    expect(router.state.location.pathname).toBe('/matches/12')
  })

  it('marks everything as read', async () => {
    notificationsApi.markAllNotificationsRead.mockImplementation(async () => {
      notificationsApi.getNotifications.mockResolvedValue(notifications.map((item) => ({ ...item, read_at: now })))
      return {}
    })
    renderAt('/notifications')

    await userEvent.click(await screen.findByRole('button', { name: 'Read all' }))

    expect(notificationsApi.markAllNotificationsRead).toHaveBeenCalled()
    expect(await screen.findByText('All read')).toBeInTheDocument()
  })

  it('deletes after the undo window and keeps it when undone', async () => {
    renderAt('/notifications')

    await userEvent.click((await screen.findAllByRole('button', { name: 'Delete notification' }))[0])
    expect(screen.queryByText('@kaeru wants your Silver moto boots')).not.toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: 'Undo' }))

    expect(await screen.findByText('@kaeru wants your Silver moto boots')).toBeInTheDocument()
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)))
    expect(notificationsApi.deleteNotification).not.toHaveBeenCalled()
  })
})
