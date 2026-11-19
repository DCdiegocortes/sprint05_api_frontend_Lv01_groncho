import { render, screen, within } from '@testing-library/react'
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

const notFound = () => Object.assign(new Error('Not found'), { response: { status: 404 } })

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
  profileApi.getProfile.mockResolvedValue({ id: 9, name: 'Nina', handle: 'nina', role: 'user', avatar_url: null })
  universesApi.getMyUniverse.mockRejectedValue(notFound())
  notificationsApi.getUnreadCount.mockResolvedValue({ unread: 0 })
})

afterEach(() => clearToken())

describe('create your universe', () => {
  it('asks for a name before calling the api', async () => {
    renderAt('/universe/new')
    await userEvent.click(await screen.findByRole('button', { name: 'Create universe' }))

    expect(await screen.findByText('Your universe needs a name.')).toBeInTheDocument()
    expect(universesApi.createUniverse).not.toHaveBeenCalled()
  })

  it('creates the universe with the picked styles, an own style and the description', async () => {
    const created = { id: 3, name: 'Dark Academia' }
    universesApi.createUniverse.mockImplementation(async () => {
      universesApi.getMyUniverse.mockResolvedValue({ ...created, images: [] })
      return created
    })
    renderAt('/universe/new')

    await userEvent.type(await screen.findByLabelText('Universe name'), 'Dark Academia')
    await userEvent.click(screen.getByRole('button', { name: 'Dark academia / vintage' }))
    await userEvent.click(screen.getByRole('button', { name: '+ Your own' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.type(within(dialog).getByLabelText('Style name'), 'Japandi')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add style' }))
    await userEvent.type(await screen.findByLabelText('Description'), 'Knots, nobility and tradition')

    expect(screen.getByText('3 of 3 · All set')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Japandi' })).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(screen.getByRole('button', { name: 'Create universe' }))

    expect(universesApi.createUniverse.mock.calls[0][0]).toEqual({
      name: 'Dark Academia',
      style: 'DARK ACADEMIA / VINTAGE, JAPANDI',
      description: 'Knots, nobility and tradition',
    })
    expect(await screen.findByRole('heading', { name: /add your/i })).toBeInTheDocument()
  })

  it('sends people who already have a universe to discover', async () => {
    universesApi.getMyUniverse.mockResolvedValue({ id: 1, name: 'Soft Minimal', images: [] })
    renderAt('/universe/new')

    expect(await screen.findByRole('heading', { name: 'Discover' })).toBeInTheDocument()
  })
})
