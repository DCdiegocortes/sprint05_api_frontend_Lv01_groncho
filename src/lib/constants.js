export const Role = Object.freeze({ USER: 'user', ADMIN: 'admin' })

export const ItemStatus = Object.freeze({ AVAILABLE: 'AVAILABLE', UNAVAILABLE: 'UNAVAILABLE' })

export const ItemCondition = Object.freeze({ NEW: 'NEW', EXCELLENT: 'EXCELLENT', GOOD: 'GOOD', FAIR: 'FAIR' })

export const ItemType = Object.freeze({ CLOTHES: 'CLOTHES', ACCESSORIES: 'ACCESSORIES' })

export const OfferType = Object.freeze({ TRADE: 'TRADE', GIFT: 'GIFT', BOTH: 'BOTH' })

export const MatchStatus = Object.freeze({ ACTIVE: 'ACTIVE', CLOSED: 'CLOSED' })

export const ExchangeType = Object.freeze({ TRADE: 'TRADE', GIFT: 'GIFT' })

export const ExchangeStatus = Object.freeze({
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  FINISHED: 'FINISHED',
})

export const UniverseLayout = Object.freeze({
  MASONRY: 'MASONRY',
  ACCORDION: 'ACCORDION',
  CAROUSEL: 'CAROUSEL',
  ROTUNDA: 'ROTUNDA',
  FLOATING: 'FLOATING',
  IMAGE_GRID: 'IMAGE_GRID',
  INFINITE: 'INFINITE',
  LIQUID_GLASS: 'LIQUID_GLASS',
  SCROLL_BULGE: 'SCROLL_BULGE',
  SLIDER: 'SLIDER',
})

export const DecorationType = Object.freeze({ STICKER: 'STICKER', EMOJI: 'EMOJI', TEXT: 'TEXT' })

export const DecorationFont = Object.freeze({
  ITALIANA: 'ITALIANA',
  INSTRUMENT: 'INSTRUMENT',
  FRAUNCES: 'FRAUNCES',
  DM_MONO: 'DM_MONO',
  BODONI: 'BODONI',
})

export const DecorationColor = Object.freeze({ BLACK: 'BLACK', PINK: 'PINK', WHITE: 'WHITE' })

export const NotificationType = Object.freeze({
  EXCHANGE_REQUESTED: 'EXCHANGE_REQUESTED',
  EXCHANGE_ACCEPTED: 'EXCHANGE_ACCEPTED',
  EXCHANGE_REJECTED: 'EXCHANGE_REJECTED',
  EXCHANGE_FINISHED: 'EXCHANGE_FINISHED',
  EXCHANGE_CANCELLED: 'EXCHANGE_CANCELLED',
  MATCH_CREATED: 'MATCH_CREATED',
  UNIVERSE_PHOTO_REMOVED: 'UNIVERSE_PHOTO_REMOVED',
  ITEM_PHOTO_REMOVED: 'ITEM_PHOTO_REMOVED',
  ITEM_REMOVED: 'ITEM_REMOVED',
})

export const Limits = Object.freeze({
  IMAGE_MAX_BYTES: 10 * 1024 * 1024,
  FEED_BATCH: 10,
  STYLE_MAX: 255,
  DESCRIPTION_MAX: 255,
  NAME_MAX: 255,
  SIZE_MAX: 20,
  MESSAGE_MAX: 255,
  DECORATIONS_MAX: 50,
  DECORATION_TEXT_MAX: 100,
  STICKER_NAME_MAX: 30,
  PASSWORD_MIN: 8,
})
