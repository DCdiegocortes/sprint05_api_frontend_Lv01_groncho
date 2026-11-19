import { client, data, toFormData } from './client.js'

export const getItems = () => data(client.get('/items'))

export const getItem = (id) => data(client.get(`/items/${id}`))

export const createItem = (payload) => data(client.post('/items', payload))

export const updateItem = (id, payload) => data(client.put(`/items/${id}`, payload))

export const deleteItem = (id) => data(client.delete(`/items/${id}`))

export const deleteItems = (itemIds) => data(client.delete('/items', { data: { item_ids: itemIds } }))

export const uploadItemImages = (id, files, onProgress) =>
  data(
    client.post(`/items/${id}/images`, toFormData('images', files), {
      onUploadProgress: (event) => onProgress?.(event.total ? event.loaded / event.total : 0),
    }),
  )

export const deleteItemImage = (id, imageId) => data(client.delete(`/items/${id}/images/${imageId}`))

export const deleteItemImages = (imageIds) => data(client.delete('/items/images', { data: { image_ids: imageIds } }))

export const getItemRanking = () => data(client.get('/items/ranking'))
