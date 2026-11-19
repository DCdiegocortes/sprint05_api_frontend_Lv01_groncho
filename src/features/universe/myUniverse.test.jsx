import { render, screen } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import Providers from '@/app/Providers.jsx'
import { routes } from '@/app/router.jsx'
import * as notificationsApi from '@/api/notifications.js'
import * as profileApi from '@/api/profile.js'
import * as universesApi from '@/api/universes.js'
import { clearToken, setToken } from '@/lib/session.js'

vi.mock('@/api/profile.js')
vi.mock('@/api/universes.js')
vi.mock('@/api/notifications.js')

const universe = {
  id: 3,
  name: 'Quiet Armour',
  style: 'GOTHIC / DARK, JAPANDI',
  description: 'Knots, nobility and tradition',
  layout: 'MASONRY',
  spotify_track_id: null,
  decorations: [{ type: 'TEXT', text: 'quiet armour.', font: 'ITALIANA', color: 'BLACK', x: 5, y: 30, size: 18 }],
  images: [{ id: 1, url: '/a.jpg' }],
  counts: { pieces: 6, matches: 3, requests: 2 },
}

beforeEach(() => {
  vi.resetAllMocks()
  setToken('tok')
  profileApi.getProfile.mockResolvedValue({ id: 9, name: 'Nina', handle: 'nina', role: 'user', avatar_url: null })
  universesApi.getMyUniverse.mockResolvedValue(universe)
  notificationsApi.getUnreadCount.mockResolvedValue({ unread: 0 })
})

afterEach(() => clearToken())

describe('my universe', () => {
  it('shows the universe, its counts, styles, song state and decorations', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/universe'] })
    render(
      <Providers client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <RouterProvider router={router} />
      </Providers>,
    )

    expect(await screen.findByRole('heading', { name: 'My universe' })).toBeInTheDocument()
    expect(screen.getByText('Knots, nobility and tradition')).toBeInTheDocument()
    expect(screen.getByText('Gothic / dark · Japandi', { exact: false })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /006\s*pieces/i })).toHaveAttribute('href', '/closet')
    expect(screen.getByRole('link', { name: /edit universe/i })).toHaveAttribute('href', '/universe/edit')
    expect(screen.getByText('No song yet')).toBeInTheDocument()
    expect(screen.getByText('quiet armour.')).toBeInTheDocument()
  })
})
