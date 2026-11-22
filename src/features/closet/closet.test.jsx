import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import Providers from '@/app/Providers.jsx'
import { routes } from '@/app/router.jsx'
import * as itemsApi from '@/api/items.js'
import * as notificationsApi from '@/api/notifications.js'
import * as profileApi from '@/api/profile.js'
import * as universesApi from '@/api/universes.js'
import { clearToken, setToken } from '@/lib/session.js'

vi.mock('@/api/items.js')
vi.mock('@/api/profile.js')
vi.mock('@/api/universes.js')
vi.mock('@/api/notifications.js')

const piece = (id, name, offer_type, status = 'AVAILABLE') => ({
  id,
  name,
  offer_type,
  status,
  size: '42 EU',
  item_condition: 'EXCELLENT',
  type: 'CLOTHES',
  description: null,
  images: [{ id: id * 10, url: `/p${id}.jpg` }],
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
  itemsApi.getItems.mockResolvedValue([
    piece(1, 'Silver moto boots', 'TRADE'),
    piece(2, 'Liquid metal trousers', 'GIFT'),
    piece(3, 'Balloon sleeve shirt', 'BOTH'),
    piece(4, 'Melted chrome bag', 'TRADE', 'UNAVAILABLE'),
  ])
})

afterEach(() => clearToken())

describe('closet', () => {
  it('lists the pieces and filters gifts, keeping the ones offered both ways', async () => {
    renderAt('/closet')

    expect(await screen.findByText('Silver moto boots')).toBeInTheDocument()
    expect(screen.getByText('Three pieces ready to change hands.')).toBeInTheDocument()
    expect(screen.getByText('In a trade')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Gift' }))

    expect(screen.queryByText('Silver moto boots')).not.toBeInTheDocument()
    expect(screen.getByText('Liquid metal trousers')).toBeInTheDocument()
    expect(screen.getByText('Balloon sleeve shirt')).toBeInTheDocument()
  })

  it('adds a piece with its photo', async () => {
    itemsApi.createItem.mockResolvedValue({ id: 9 })
    itemsApi.uploadItemImages.mockResolvedValue([])
    renderAt('/closet')

    await userEvent.click((await screen.findAllByRole('button', { name: 'Add a piece' }))[0])
    const file = new File(['x'], 'boots.jpg', { type: 'image/jpeg' })
    fireEvent.change(screen.getByTestId('piece-photo-input'), { target: { files: [file] } })
    await userEvent.type(screen.getByLabelText('Name'), 'Velvet gloves')
    await userEvent.click(within(screen.getByRole('radiogroup', { name: 'Offer it as' })).getByRole('radio', { name: 'Gift' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add piece' }))

    expect(itemsApi.createItem).toHaveBeenCalledWith(expect.objectContaining({ name: 'Velvet gloves', offer_type: 'GIFT' }))
    expect(itemsApi.uploadItemImages).toHaveBeenCalledWith(9, [file], expect.any(Function))
  })

  it('explains that a piece from a trade stays when the API refuses to delete it', async () => {
    itemsApi.deleteItem.mockRejectedValue({ response: { status: 409 } })
    renderAt('/closet/4')

    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    fireEvent.keyDown(screen.getByRole('button', { name: 'Slide to delete' }), { key: 'Enter' })

    expect(await screen.findByText('This piece stays')).toBeInTheDocument()
    expect(itemsApi.deleteItem).toHaveBeenCalledWith(4, expect.anything())
  })
})
