import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import Providers from '@/app/Providers.jsx'
import { routes } from '@/app/router.jsx'
import * as notificationsApi from '@/api/notifications.js'
import * as profileApi from '@/api/profile.js'
import * as swipesApi from '@/api/swipes.js'
import * as universesApi from '@/api/universes.js'
import { clearToken, setToken } from '@/lib/session.js'

vi.mock('@/api/profile.js')
vi.mock('@/api/universes.js')
vi.mock('@/api/notifications.js')
vi.mock('@/api/swipes.js')

const universe = (id, name, handle) => ({
  id,
  user_id: id + 10,
  name,
  style: 'STREETWEAR',
  layout: 'MASONRY',
  decorations: null,
  images: [],
  user: { id: id + 10, name: handle, handle, avatar_url: null },
})

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
  notificationsApi.getUnreadCount.mockResolvedValue({ unread: 0 })
  universesApi.getFeed.mockResolvedValue([universe(4, 'Dark Academia', 'dani'), universe(5, 'Sport Chic', 'eli')])
})

afterEach(() => clearToken())

describe('discover', () => {
  it('shows one universe at a time and moves on after a nope', async () => {
    swipesApi.swipe.mockResolvedValue({ matched: false, match_id: null })
    renderAt('/discover')

    expect(await screen.findByText('@dani')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'ArrowLeft' })

    expect(await screen.findByText('@eli')).toBeInTheDocument()
    expect(swipesApi.swipe).toHaveBeenCalledWith(14, false)
  })

  it('opens the match moment after a mutual like and goes to the wardrobe', async () => {
    swipesApi.swipe.mockResolvedValue({ matched: true, match_id: 7 })
    const router = renderAt('/discover')

    await screen.findByText('@dani')
    fireEvent.keyDown(window, { key: 'ArrowRight' })

    expect(await screen.findByRole('heading', { name: "It's a match." })).toBeInTheDocument()
    expect(swipesApi.swipe).toHaveBeenCalledWith(14, true)
    await userEvent.click(screen.getByRole('button', { name: 'Open their wardrobe' }))
    expect(router.state.location.pathname).toBe('/matches/7')
  })

  it('says when every universe has been seen', async () => {
    universesApi.getFeed.mockResolvedValue([])
    renderAt('/discover')

    expect(await screen.findByText('You have seen every universe.')).toBeInTheDocument()
  })
})
