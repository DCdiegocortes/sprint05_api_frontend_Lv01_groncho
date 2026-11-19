import { client, data } from './client.js'

export const getExchanges = () => data(client.get('/exchanges'))

export const getExchange = (id) => data(client.get(`/exchanges/${id}`))

export const createExchange = (payload) => data(client.post('/exchanges', payload))

export const answerExchange = (id, status) => data(client.put(`/exchanges/${id}`, { status }))

export const cancelExchange = (id) => data(client.delete(`/exchanges/${id}`))
