import { ExchangeType, NotificationType } from '@/lib/constants.js'

const DAY = 24 * 60 * 60 * 1000
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function isToday(date, now = new Date()) {
  return new Date(date).toDateString() === now.toDateString()
}

export function when(date, now = new Date()) {
  const then = new Date(date)
  const minutes = Math.max(0, Math.round((now - then) / 60000))
  if (isToday(then, now)) return minutes < 60 ? `${Math.max(1, minutes)}m` : `${Math.round(minutes / 60)}h`
  if (new Date(now - DAY).toDateString() === then.toDateString()) return 'Yesterday'
  if (now - then < 6 * DAY) return days[then.getDay()]
  return then.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const photos = (count = 1) => (count === 1 ? 'a photo' : `${count} photos`)

export function describe(notification) {
  const who = notification.actor ? `@${notification.actor.handle ?? notification.actor.name}` : 'Someone'
  const item = notification.item_name
  const trade = notification.exchange_type === ExchangeType.TRADE
  const time = when(notification.created_at)

  switch (notification.type) {
    case NotificationType.EXCHANGE_REQUESTED:
      return { title: `${who} wants your ${item}`, meta: `${trade ? 'Trade' : 'Gift'} request · ${time}`, to: '/universe/requests', icon: 'actor' }
    case NotificationType.EXCHANGE_ACCEPTED:
      return { title: `${who} accepted your ${trade ? 'trade' : 'gift request'}`, meta: `${item} · ${time}`, to: '/universe/requests', icon: 'actor' }
    case NotificationType.EXCHANGE_REJECTED:
      return { title: `${who} declined your request`, meta: `${item} · ${time}`, to: '/universe/requests', icon: 'actor' }
    case NotificationType.EXCHANGE_FINISHED:
      return { title: `${who} finished the ${trade ? 'swap' : 'gift'}`, meta: `${item} · ${time}`, to: '/universe/requests', icon: 'actor' }
    case NotificationType.EXCHANGE_CANCELLED:
      return { title: `${who} cancelled their request`, meta: `${item} · ${time}`, to: '/universe/requests', icon: 'actor' }
    case NotificationType.MATCH_CREATED:
      return { title: `New match with ${who}`, meta: `Their wardrobe is open · ${time}`, to: `/matches/${notification.match_id}`, icon: 'match' }
    case NotificationType.UNIVERSE_PHOTO_REMOVED:
      return {
        title: `A moderator removed ${photos(notification.photos_removed)} from your universe`,
        meta: time,
        to: '/universe',
        icon: 'moderator',
      }
    case NotificationType.ITEM_PHOTO_REMOVED:
      return {
        title: `A moderator removed ${photos(notification.photos_removed)} from ${item}`,
        meta: time,
        to: `/closet/${notification.item_id}`,
        icon: 'moderator',
      }
    case NotificationType.ITEM_REMOVED:
      return { title: `A moderator removed your piece ${item}`, meta: time, to: null, icon: 'moderator' }
    default:
      return { title: 'Something moved in Grôncho', meta: time, to: null, icon: 'moderator' }
  }
}
