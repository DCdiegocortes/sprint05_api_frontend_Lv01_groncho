import { DecorationType } from '@/lib/constants.js'
import { colorCss, fontFamily } from './decorations.js'

export function decorationStyle(decoration) {
  const base = { position: 'absolute', left: `${decoration.x}cqw`, top: `${decoration.y}cqw` }

  if (decoration.type === DecorationType.STICKER) return { ...base, width: `${decoration.size}cqw` }
  if (decoration.type === DecorationType.EMOJI) {
    return { ...base, fontFamily: 'var(--font-emoji)', fontSize: `${decoration.size}cqw`, lineHeight: 1 }
  }
  return {
    ...base,
    fontFamily: fontFamily(decoration.font),
    color: colorCss(decoration.color),
    fontSize: `${decoration.size / 2}cqw`,
    lineHeight: 1,
    whiteSpace: 'pre',
  }
}
