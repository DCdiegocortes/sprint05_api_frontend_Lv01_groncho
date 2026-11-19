import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

const universe = { id: 3, name: 'Quiet Armour', layout: 'MASONRY', images: [] }

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
  localStorage.clear()
  setToken('tok')
  URL.createObjectURL = vi.fn(() => 'blob:preview')
  URL.revokeObjectURL = vi.fn()
  profileApi.getProfile.mockResolvedValue({ id: 9, name: 'Nina', handle: 'nina', role: 'user', avatar_url: null })
  universesApi.getMyUniverse.mockResolvedValue(universe)
  notificationsApi.getUnreadCount.mockResolvedValue({ unread: 0 })
})

afterEach(() => clearToken())

describe('add your first photos', () => {
  it('uploads the chosen photos to the universe', async () => {
    universesApi.uploadUniverseImages.mockResolvedValue([])
    renderAt('/universe/new/photos')
    const photo = new File(['x'], 'kendo.jpg', { type: 'image/jpeg' })

    await userEvent.upload(await screen.findByTestId('photo-input'), photo)

    expect(universesApi.uploadUniverseImages).toHaveBeenCalledWith(3, [photo], expect.any(Function))
  })

  it('refuses photos over 10 MB before uploading', async () => {
    renderAt('/universe/new/photos')
    const big = new File(['x'], 'huge.jpg', { type: 'image/jpeg' })
    Object.defineProperty(big, 'size', { value: 11 * 1024 * 1024 })

    await userEvent.upload(await screen.findByTestId('photo-input'), big)

    expect(await screen.findByRole('alert')).toHaveTextContent('huge.jpg is over 10 MB.')
    expect(universesApi.uploadUniverseImages).not.toHaveBeenCalled()
  })

  it('saves the layout and shows it in the preview at once', async () => {
    universesApi.updateUniverse.mockResolvedValue({ ...universe, layout: 'IMAGE_GRID' })
    renderAt('/universe/new/photos')

    expect(await screen.findByText('Tap to preview')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: /image grid/i }))

    expect(universesApi.updateUniverse).toHaveBeenCalledWith(3, { layout: 'IMAGE_GRID' })
    expect(screen.getByRole('radio', { name: /image grid/i })).toHaveAttribute('aria-checked', 'true')
    expect(screen.queryByText('Tap to preview')).not.toBeInTheDocument()
  })
})
