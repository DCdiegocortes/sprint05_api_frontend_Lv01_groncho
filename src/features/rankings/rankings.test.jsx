import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import Providers from '@/app/Providers.jsx'
import { routes } from '@/app/router.jsx'
import * as itemsApi from '@/api/items.js'
import * as notificationsApi from '@/api/notifications.js'
import * as profileApi from '@/api/profile.js'
import * as universesApi from '@/api/universes.js'
import * as usersApi from '@/api/users.js'
import { clearToken, setToken } from '@/lib/session.js'

vi.mock('@/api/items.js')
vi.mock('@/api/notifications.js')
vi.mock('@/api/profile.js')
vi.mock('@/api/universes.js')
vi.mock('@/api/users.js')

const user = (id, handle) => ({ id, name: handle, handle, avatar_url: null })

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
  universesApi.getFeed.mockResolvedValue([])
  notificationsApi.getUnreadCount.mockResolvedValue({ unread: 0 })
  itemsApi.getItemRanking.mockResolvedValue([
    { item: { id: 1, name: 'Silver moto boots', images: [] }, request_count: 14 },
    { item: { id: 2, name: 'Melted chrome bag', images: [] }, request_count: 9 },
  ])
  usersApi.getUserRanking.mockResolvedValue([
    { user: user(7, 'kaeru'), success_rate: 0.92 },
    { user: user(8, 'lyren'), success_rate: 0.18 },
  ])
})

afterEach(() => clearToken())

describe('rankings', () => {
  it('opens from the Discover switch with the most requested pieces', async () => {
    const router = renderAt('/discover')

    await userEvent.click(await screen.findByRole('radio', { name: 'Rankings' }))

    expect(router.state.location.pathname).toBe('/discover/rankings')
    expect(await screen.findByText('Silver moto boots')).toBeInTheDocument()
    expect(screen.getByText('14 requests')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
  })

  it('shows people by success rate with the best and the lowest', async () => {
    renderAt('/discover/rankings')

    await userEvent.click(await screen.findByRole('button', { name: 'People' }))

    expect(screen.getByText('Most swaps done')).toBeInTheDocument()
    expect(screen.getByText('Still warming up')).toBeInTheDocument()
    expect(screen.getAllByText('92%').length).toBeGreaterThan(0)
  })

  it('says when there are no rankings yet', async () => {
    itemsApi.getItemRanking.mockResolvedValue([])
    usersApi.getUserRanking.mockResolvedValue([])
    renderAt('/discover/rankings')

    expect(await screen.findByRole('link', { name: 'Explore universes in Discover' })).toHaveTextContent('No crowns yet. Taste is still deciding.')
  })
})
