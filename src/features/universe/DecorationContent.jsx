import { DecorationType } from '@/lib/constants.js'
import { stickerSrc } from './decorations.js'

export default function DecorationContent({ decoration }) {
  if (decoration.type === DecorationType.STICKER) {
    const src = stickerSrc(decoration.sticker)
    return src ? <img src={src} alt="" draggable={false} className="block w-full select-none" /> : null
  }
  if (decoration.type === DecorationType.EMOJI) return decoration.emoji
  return decoration.text
}
