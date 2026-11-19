import { Limits } from '@/lib/constants.js'

export const fixedStyles = [
  'DARK ACADEMIA / VINTAGE',
  'PARISIAN / ECLECTIC',
  'STREETWEAR',
  'ROMANTIC / FLORAL',
  'AVANT-GARDE',
  'BOHO / EARTH',
  'PREPPY / OLD MONEY',
  'GOTHIC / DARK',
]

export function displayStyle(style) {
  const lower = style.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

export function joinStyles(styles) {
  return styles.join(', ')
}

export function remainingForNewStyle(styles) {
  const used = joinStyles(styles).length
  const separator = styles.length ? 2 : 0
  return Math.max(0, Limits.STYLE_MAX - used - separator)
}
