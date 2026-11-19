import { client, data } from './client.js'

export const getMatches = () => data(client.get('/matches'))

export const getMatchWardrobe = (id) => data(client.get(`/matches/${id}/items`))

export const closeMatch = (id) => data(client.delete(`/matches/${id}`))
