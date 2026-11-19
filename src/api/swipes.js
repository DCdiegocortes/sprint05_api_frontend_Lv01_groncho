import { client, data } from './client.js'

export const swipe = (targetUserId, liked) =>
  data(client.post('/swipes', { target_user_id: targetUserId, liked }))
