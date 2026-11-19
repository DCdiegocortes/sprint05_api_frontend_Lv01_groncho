import { client, data } from './client.js'

export const register = (payload) => data(client.post('/register', payload))

export const login = (payload) => data(client.post('/login', payload))

export const logout = () => data(client.post('/logout'))
