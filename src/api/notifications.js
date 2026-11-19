import { client, data } from './client.js'

export const getNotifications = () => data(client.get('/notifications'))

export const getUnreadCount = () => data(client.get('/notifications/unread-count'))

export const markNotificationRead = (id) => data(client.patch(`/notifications/${id}/read`))

export const markAllNotificationsRead = () => data(client.post('/notifications/read-all'))

export const deleteNotification = (id) => data(client.delete(`/notifications/${id}`))
