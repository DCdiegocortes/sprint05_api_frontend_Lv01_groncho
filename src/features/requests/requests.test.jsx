import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import Providers from '@/app/Providers.jsx'
import { routes } from '@/app/router.jsx'
import * as exchangesApi from '@/api/exchanges.js'
import * as notificationsApi from '@/api/notifications.js'
import * as profileApi from '@/api/profile.js'
import * as universesApi from '@/api/universes.js'
import { clearToken, setToken } from '@/lib/session.js'

vi.mock('@/api/exchanges.js')
vi.mock('@/api/notifications.js')
vi.mock('@/api/profile.js')
vi.mock('@/api/universes.js')

const me = { id: 1, name: 'Ana', handle: 'ana', avatar_url: null }
const kaeru = { id: 7, name: 'kaeru', handle: 'kaeru', avatar_url: null }
const norke = { id: 8, name: 'norke', handle: 'norke', avatar_url: null }
const piece = (id, name) => ({ id, name, images: [] })

const requests = [
  {
    id: 30,
    requester_id: 7,
    requester: kaeru,
    receiver: me,
    type: 'TRADE',
    status: 'PENDING',
    message: 'Your boots would complete my universe.',
    requested_item: piece(1, 'Silver moto boots'),
    offered_item: piece(2, 'Melted chrome bag'),
    created_at: '2026-11-20',
  },
  {
    id: 31,
    requester_id: 7,
    requester: kaeru,
    receiver: me,
    type: 'TRADE',
    status: 'ACCEPTED',
    requested_item: piece(3, 'Balloon sleeve shirt'),
    offered_item: piece(4, 'Velvet gloves'),
    created_at: '2026-11-19',
  },
  {
    id: 32,
    requester_id: 1,
    requester: me,
    receiver: norke,
    type: 'GIFT',
    status: 'PENDING',
    requested_item: piece(5, 'Wide hakama trousers'),
    offered_item: null,
    created_at: '2026-11-18',
  },
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
  profileApi.getProfile.mockResolvedValue({ ...me, role: 'user' })
  universesApi.getMyUniverse.mockResolvedValue({ id: 1, name: 'Soft Minimal', images: [] })
  notificationsApi.getUnreadCount.mockResolvedValue({ unread: 0 })
  exchangesApi.getExchanges.mockResolvedValue(requests)
  exchangesApi.answerExchange.mockResolvedValue({})
  exchangesApi.cancelExchange.mockResolvedValue({})
})

afterEach(() => clearToken())

describe('requests', () => {
  it('splits received and sent requests', async () => {
    renderAt('/universe/requests')

    expect(await screen.findByText('Wants to trade')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Received · 2' })).toBeInTheDocument()
    expect(screen.queryByText('@norke')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: 'Sent · 1' }))

    expect(screen.getByText('@norke')).toBeInTheDocument()
    expect(screen.getByText('You asked for a gift')).toBeInTheDocument()
  })

  it('accepts a trade after confirming', async () => {
    renderAt('/universe/requests')

    await userEvent.click(await screen.findByRole('button', { name: 'Accept' }))
    await userEvent.click(screen.getByRole('button', { name: 'Accept trade' }))

    expect(exchangesApi.answerExchange).toHaveBeenCalledWith(30, 'ACCEPTED')
  })

  it('rejects a request right away', async () => {
    renderAt('/universe/requests')

    await userEvent.click(await screen.findByRole('button', { name: 'Reject' }))

    expect(exchangesApi.answerExchange).toHaveBeenCalledWith(30, 'REJECTED')
  })

  it('marks an accepted trade as finished by sliding', async () => {
    renderAt('/universe/requests')

    await userEvent.click(await screen.findByRole('button', { name: 'Mark as finished' }))
    fireEvent.keyDown(screen.getByRole('button', { name: 'Slide to finish' }), { key: 'Enter' })

    expect(await screen.findByText('Swap finished')).toBeInTheDocument()
    expect(exchangesApi.answerExchange).toHaveBeenCalledWith(31, 'FINISHED')
  })

  it('cancels a sent request', async () => {
    renderAt('/universe/requests')

    await userEvent.click(await screen.findByRole('radio', { name: 'Sent · 1' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel request' }))
    await userEvent.click(screen.getAllByRole('button', { name: 'Cancel request' }).at(-1))

    expect(exchangesApi.cancelExchange).toHaveBeenCalledWith(32, expect.anything())
  })
})
