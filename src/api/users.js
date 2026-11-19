import { client, data } from './client.js'

export const getUsers = () => data(client.get('/users'))

export const getUser = (id) => data(client.get(`/users/${id}`))

export const getUserItems = (id) => data(client.get(`/users/${id}/items`))

export const deleteUser = (id) => data(client.delete(`/users/${id}`))

export const getUserRanking = () => data(client.get('/users/ranking'))

export const getBestUser = () => data(client.get('/users/ranking/best'))

export const getWorstUser = () => data(client.get('/users/ranking/worst'))
