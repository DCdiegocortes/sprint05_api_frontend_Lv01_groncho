import { client, data } from './client.js'

export const getProfile = () => data(client.get('/profile'))

export const updateProfile = (payload) => data(client.put('/profile', payload))

export function uploadAvatar(file) {
  const form = new FormData()
  form.append('avatar', file)
  return data(client.post('/profile/avatar', form))
}

export const removeAvatar = () => data(client.delete('/profile/avatar'))
