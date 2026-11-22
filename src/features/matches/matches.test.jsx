import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import Providers from '@/app/Providers.jsx'
import { routes } from '@/app/router.jsx'
import * as exchangesApi from '@/api/exchanges.js'
import * as itemsApi from '@/api/items.js'
import * as matchesApi from '@/api/matches.js'
import * as notificationsApi from '@/api/notifications.js'
import * as profileApi from '@/api/profile.js'
import * as universesApi from '@/api/universes.js'
import { clearToken, setToken } from '@/lib/session.js'

vi.mock('@/api/exchanges.js')
vi.mock('@/api/items.js')
vi.mock('@/api/matches.js')
vi.mock('@/api/notifications.js')
vi.mock('@/api/profile.js')
vi.mock('@/api/universes.js')

const match = (id, handle, status = 'ACTIVE') => ({
  id,
  status,
  partner: { id: id + 10, name: handle, handle, avatar_url: null, universe: { id: id + 20, style: 'DARK, UTILITY' } },
})

const piece = (id, name, offer_type) => ({
  id,
  name,
  offer_type,
  status: 'AVAILABLE',
  size: 'M',
  item_condition: 'GOOD',
  type: 'CLOTHES',
  images: [],
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
  universesApi.getUniverse.mockResolvedValue({ id: 32, name: 'Night Dojo', layout: 'MASONRY', images: [], decorations: [] })
  notificationsApi.getUnreadCount.mockResolvedValue({ unread: 0 })
  matchesApi.getMatches.mockResolvedValue([match(12, 'norke'), match(13, 'kaeru'), match(14, 'lyren', 'CLOSED')])
  matchesApi.getMatchWardrobe.mockResolvedValue([piece(5, 'Wide hakama trousers', 'BOTH'), piece(6, 'Pleated wrap skirt', 'TRADE')])
  itemsApi.getItems.mockResolvedValue([piece(9, 'Silver moto boots', 'TRADE')])
})

afterEach(() => clearToken())

describe('matches', () => {
  it('lists active matches and switches to the closed ones', async () => {
    renderAt('/matches')

    expect(await screen.findByText('@norke')).toBeInTheDocument()
    expect(screen.getByText('Two universes that feel like yours.')).toBeInTheDocument()
    expect(screen.queryByText('@lyren')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: 'Closed · 1' }))

    expect(screen.getByText('@lyren')).toBeInTheDocument()
    expect(screen.queryByText('@norke')).not.toBeInTheDocument()
  })

  it('opens a match on their universe and asks for a piece as a gift', async () => {
    exchangesApi.createExchange.mockResolvedValue({ id: 40 })
    renderAt('/matches/12')

    expect(await screen.findByText('Night Dojo · dark · utility.')).toBeInTheDocument()
    expect(universesApi.getUniverse).toHaveBeenCalledWith(32)

    await userEvent.click(screen.getByRole('radio', { name: 'Wardrobe · 2' }))
    await userEvent.click(await screen.findByRole('button', { name: /Wide hakama trousers/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Ask as a gift' }))

    expect(await screen.findByText('Request sent')).toBeInTheDocument()
    expect(exchangesApi.createExchange).toHaveBeenCalledWith(
      expect.objectContaining({ match_id: 12, requested_item_id: 5, type: 'GIFT', offered_item_id: null }),
      expect.anything(),
    )
  })

  it('proposes a trade with one of my pieces', async () => {
    exchangesApi.createExchange.mockResolvedValue({ id: 41 })
    renderAt('/matches/12')

    await userEvent.click(await screen.findByRole('radio', { name: /Wardrobe/ }))
    await userEvent.click(await screen.findByRole('button', { name: /Pleated wrap skirt/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Propose a trade' }))
    await userEvent.click(within(await screen.findByRole('radiogroup', { name: 'Your pieces' })).getByRole('radio', { name: /Silver moto boots/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Send trade request' }))

    expect(exchangesApi.createExchange).toHaveBeenCalledWith(
      expect.objectContaining({ requested_item_id: 6, type: 'TRADE', offered_item_id: 9 }),
      expect.anything(),
    )
  })

  it('asks to give one back first when the API refuses a gift', async () => {
    exchangesApi.createExchange.mockRejectedValue({ response: { status: 403 } })
    renderAt('/matches/12')

    await userEvent.click(await screen.findByRole('radio', { name: /Wardrobe/ }))
    await userEvent.click(await screen.findByRole('button', { name: /Wide hakama trousers/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Ask as a gift' }))

    expect(await screen.findByText('Give one back first')).toBeInTheDocument()
  })

  it('closes a match by sliding', async () => {
    matchesApi.closeMatch.mockResolvedValue({ message: 'Match closed' })
    renderAt('/matches/12')

    await userEvent.click(await screen.findByRole('radio', { name: /Wardrobe/ }))
    await userEvent.click(await screen.findByRole('button', { name: 'Close match' }))
    fireEvent.keyDown(screen.getByRole('button', { name: 'Slide to close' }), { key: 'Enter' })

    expect(await screen.findByText('Match with @norke closed')).toBeInTheDocument()
    expect(matchesApi.closeMatch).toHaveBeenCalledWith(12, expect.anything())
  })
})
