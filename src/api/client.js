import axios from 'axios'
import { clearToken, getToken } from '@/lib/session.js'

let onUnauthorized = () => {}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  headers: { Accept: 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      clearToken()
      onUnauthorized()
    }
    return Promise.reject(error)
  },
)

export const data = (request) => request.then((response) => response.data)

export function toFormData(field, files) {
  const form = new FormData()
  for (const file of files) {
    form.append(`${field}[]`, file)
  }
  return form
}
