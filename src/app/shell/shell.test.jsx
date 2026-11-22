import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import Providers from '@/app/Providers.jsx'
import { routes } from '@/app/router.jsx'
import * as itemsApi from '@/api/items.js'
import * as matchesApi from '@/api/matches.js'
import * as notificationsApi from '@/api/notifications.js'
import * as profileApi from '@/api/profile.js'
import * as universesApi from '@/api/universes.js'
import { clearToken, setToken } from '@/lib/session.js'

vi.mock('@/api/items.js')
vi.mock('@/api/matches.js')
vi.mock('@/api/profile.js')
vi.mock('@/api/universes.js')
vi.mock('@/api/notifications.js')

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

beforeEach(() => {
  vi.resetAllMocks()
  setToken('tok')
  profileApi.getProfile.mockResolvedValue({ id: 1, name: 'Ana', handle: 'ana', role: 'user', avatar_url: null })
  universesApi.getMyUniverse.mockResolvedValue({ id: 1, name: 'Soft Minimal', images: [] })
  notificationsApi.getUnreadCount.mockResolvedValue({ unread: 3 })
  itemsApi.getItems.mockResolvedValue([])
  matchesApi.getMatches.mockResolvedValue([])
})

afterEach(() => clearToken())

describe('app shell', () => {
  it('shows the four tabs in the Sprint 04 order and marks the active one', async () => {
    renderAt('/closet')
    const nav = (await screen.findAllByRole('navigation', { name: 'Main' }))[0]
    const links = within(nav).getAllByRole('link')

    expect(links.map((link) => link.textContent)).toEqual(['Discover', 'Closet', 'Matches', 'Universe'])
    expect(within(nav).getByRole('link', { name: 'Closet' })).toHaveAttribute('aria-current', 'page')
  })

  it('moves between tabs', async () => {
    renderAt('/discover')
    const nav = (await screen.findAllByRole('navigation', { name: 'Main' }))[0]

    await userEvent.click(within(nav).getByRole('link', { name: 'Matches' }))
    expect(await screen.findByRole('heading', { name: 'Matches' })).toBeInTheDocument()
  })

  it('shows the unread count on the bell', async () => {
    renderAt('/discover')
    expect(await screen.findByRole('link', { name: 'Notifications, 3 unread' })).toBeInTheDocument()
  })

  it('sends people without a universe to create one', async () => {
    universesApi.getMyUniverse.mockRejectedValue(Object.assign(new Error('Not found'), { response: { status: 404 } }))
    renderAt('/discover')

    expect(await screen.findByRole('heading', { name: /create your/i })).toBeInTheDocument()
  })
})
