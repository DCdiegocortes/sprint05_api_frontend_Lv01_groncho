import { client, setUnauthorizedHandler } from './client.js'
import { swipe } from './swipes.js'
import { deleteUniverseImages, getFeed, uploadUniverseImages } from './universes.js'
import { clearToken, getToken, setToken } from '@/lib/session.js'

let requests = []
let nextResponse = { status: 200, data: {} }

beforeEach(() => {
  requests = []
  nextResponse = { status: 200, data: {} }
  clearToken()
  client.defaults.adapter = async (config) => {
    requests.push(config)
    const response = { ...nextResponse, headers: {}, config, statusText: '' }
    if (response.status >= 400) {
      const error = new Error(`Request failed with status ${response.status}`)
      error.response = response
      error.config = config
      throw error
    }
    return response
  }
})

describe('api client', () => {
  it('sends JSON accept and the bearer token when there is a session', async () => {
    setToken('abc123')
    await getFeed()

    expect(requests[0].headers.Accept).toBe('application/json')
    expect(requests[0].headers.Authorization).toBe('Bearer abc123')
  })

  it('sends no authorization header without a session', async () => {
    await getFeed()

    expect(requests[0].headers.Authorization).toBeUndefined()
  })

  it('clears the session and calls the handler on 401', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    setToken('expired')
    nextResponse = { status: 401, data: { message: 'Unauthenticated.' } }

    await expect(getFeed()).rejects.toThrow()
    expect(getToken()).toBeNull()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('builds the requests the API expects', async () => {
    nextResponse = { status: 201, data: { matched: true, match_id: 7 } }
    await expect(swipe(4, true)).resolves.toEqual({ matched: true, match_id: 7 })
    expect(requests[0].url).toBe('/swipes')
    expect(JSON.parse(requests[0].data)).toEqual({ target_user_id: 4, liked: true })

    await getFeed('vintage')
    expect(requests[1].params).toEqual({ search: 'vintage' })

    await deleteUniverseImages(2, [5, 6])
    expect(requests[2].method).toBe('delete')
    expect(JSON.parse(requests[2].data)).toEqual({ image_ids: [5, 6] })

    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' })
    await uploadUniverseImages(2, [file, file])
    expect(requests[3].data.getAll('images[]')).toHaveLength(2)
  })
})
