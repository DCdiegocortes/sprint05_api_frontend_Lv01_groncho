import { ItemCondition, ItemStatus, ItemType, OfferType } from '@/lib/constants.js'

export const offerLabel = {
  [OfferType.TRADE]: 'Trade',
  [OfferType.GIFT]: 'Gift',
  [OfferType.BOTH]: 'Trade · Gift',
}

export const conditionOptions = [
  { value: ItemCondition.NEW, label: 'New' },
  { value: ItemCondition.EXCELLENT, label: 'Excellent' },
  { value: ItemCondition.GOOD, label: 'Good' },
  { value: ItemCondition.FAIR, label: 'Fair' },
]

export const typeOptions = [
  { value: ItemType.CLOTHES, label: 'Clothes' },
  { value: ItemType.ACCESSORIES, label: 'Accessories' },
]

export const offerOptions = [
  { value: OfferType.TRADE, label: 'Trade' },
  { value: OfferType.GIFT, label: 'Gift' },
  { value: OfferType.BOTH, label: 'Both' },
]

export const filters = [
  { value: 'ALL', label: 'All' },
  { value: OfferType.GIFT, label: 'Gift' },
  { value: OfferType.TRADE, label: 'Trade' },
]

export const matchesFilter = (piece, filter) => filter === 'ALL' || piece.offer_type === filter || piece.offer_type === OfferType.BOTH

export const labelOf = (options, value) => options.find((option) => option.value === value)?.label ?? value

export const isLocked = (piece) => piece.status === ItemStatus.UNAVAILABLE

const words = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve']

export function closetSubline(pieces) {
  const ready = pieces.filter((piece) => !isLocked(piece)).length
  if (!pieces.length) return 'Nothing here yet.'
  const count = words[ready] ?? String(ready)
  return `${count} ${ready === 1 ? 'piece' : 'pieces'} ready to change hands.`
}
