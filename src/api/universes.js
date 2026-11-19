import { client, data, toFormData } from './client.js'

export const getFeed = (search = '') =>
  data(client.get('/universes/feed', { params: search ? { search } : undefined }))

export const getMyUniverse = () => data(client.get('/universes/mine'))

export const getUniverse = (id) => data(client.get(`/universes/${id}`))

export const createUniverse = (payload) => data(client.post('/universes', payload))

export const updateUniverse = (id, payload) => data(client.put(`/universes/${id}`, payload))

export const deleteUniverse = (id) => data(client.delete(`/universes/${id}`))

export const uploadUniverseImages = (id, files, onProgress) =>
  data(
    client.post(`/universes/${id}/images`, toFormData('images', files), {
      onUploadProgress: (event) => onProgress?.(event.total ? event.loaded / event.total : 0),
    }),
  )

export const reorderUniverseImages = (id, imageIds) =>
  data(client.put(`/universes/${id}/images/order`, { image_ids: imageIds }))

export const deleteUniverseImages = (id, imageIds) =>
  data(client.delete(`/universes/${id}/images`, { data: { image_ids: imageIds } }))

export const deleteUniverseImage = (id, imageId) => data(client.delete(`/universes/${id}/images/${imageId}`))
