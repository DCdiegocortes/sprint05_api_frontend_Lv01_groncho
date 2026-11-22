import { render, screen, waitFor, within } from '@testing-library/react'
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

const universe = {
  id: 3,
  name: 'Quiet Armour',
  layout: 'MASONRY',
  decorations: [],
  images: [{ id: 1, url: '/a.jpg' }],
  counts: { pieces: 0, matches: 0, requests: 0 },
}

function renderAt(path) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <Providers client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <RouterProvider router={router} />
    </Providers>,
  )
}

beforeEach(() => {
  vi.resetAllMocks()
  setToken('tok')
  profileApi.getProfile.mockResolvedValue({ id: 9, name: 'Nina', handle: 'nina', role: 'user', avatar_url: null })
  universesApi.getMyUniverse.mockResolvedValue(universe)
  notificationsApi.getUnreadCount.mockResolvedValue({ unread: 0 })
})

afterEach(() => clearToken())

describe('edit universe', () => {
  it('places a text and saves the decorations on its own', async () => {
    universesApi.updateUniverse.mockResolvedValue(universe)
    renderAt('/universe/edit')

    await userEvent.click(await screen.findByRole('button', { name: 'Text' }))
    const sheet = await screen.findByRole('dialog')
    await userEvent.type(within(sheet).getByLabelText('Text'), 'quiet armour.')
    await userEvent.click(within(sheet).getByRole('radio', { name: 'Bodoni' }))
    await userEvent.click(within(sheet).getByRole('radio', { name: 'Pink' }))
    await userEvent.click(within(sheet).getByRole('button', { name: 'Place text' }))

    await waitFor(() => expect(universesApi.updateUniverse).toHaveBeenCalled(), { timeout: 2500 })
    expect(universesApi.updateUniverse.mock.calls[0]).toEqual([
      3,
      { decorations: [{ x: 34, y: 12, type: 'TEXT', text: 'quiet armour.', font: 'BODONI', color: 'PINK', size: 18 }] },
    ])
  })

  it('only accepts spotify track links for the song', async () => {
    renderAt('/universe/edit')

    await userEvent.click(await screen.findByRole('button', { name: 'Audio' }))
    const sheet = await screen.findByRole('dialog')
    await userEvent.type(within(sheet).getByLabelText('Spotify track link'), 'https://youtube.com/watch?v=x')
    await userEvent.click(within(sheet).getByRole('button', { name: 'Set as soundtrack' }))

    expect(within(sheet).getByText(/paste a spotify track link/i)).toBeInTheDocument()
    expect(universesApi.updateUniverse).not.toHaveBeenCalled()
  })

  it('saves a new layout right away', async () => {
    universesApi.updateUniverse.mockResolvedValue({ ...universe, layout: 'ROTUNDA' })
    renderAt('/universe/edit')

    await userEvent.click(await screen.findByRole('radio', { name: /rotunda/i }))
    expect(universesApi.updateUniverse).toHaveBeenCalledWith(3, { layout: 'ROTUNDA' })
  })
})
