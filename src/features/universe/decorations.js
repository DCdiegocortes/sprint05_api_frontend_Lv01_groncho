import { DecorationColor, DecorationFont } from '@/lib/constants.js'

export const fonts = [
  { value: DecorationFont.ITALIANA, name: 'Italiana', family: 'var(--font-italiana)' },
  { value: DecorationFont.INSTRUMENT, name: 'Instrument', family: 'var(--font-serif)' },
  { value: DecorationFont.BODONI, name: 'Bodoni', family: 'var(--font-bodoni)' },
  { value: DecorationFont.FRAUNCES, name: 'Fraunces', family: 'var(--font-fraunces)' },
  { value: DecorationFont.DM_MONO, name: 'DM Mono', family: 'var(--font-mono)' },
]

export const colors = [
  { value: DecorationColor.BLACK, name: 'Ink', css: 'var(--color-ink)' },
  { value: DecorationColor.PINK, name: 'Pink', css: 'var(--color-accent)' },
  { value: DecorationColor.WHITE, name: 'White', css: '#ffffff' },
]

const sets = {
  dreamy: ['bubble', 'glass-heart', 'jelly-heart', 'cotton-heart', 'cloud', 'gummy-bear', 'lollipop', 'pearl-spark'],
  pixel: ['ufo', 'jp-lets-swap', 'game-over', 'cd', 'life-hearts', 'card', 'star', 'headphones', 'hourglass', 'error-404', 'i-love-you', 'outline-hearts', 'camera', 'jp-daisuki', 'cursor'],
  ink: ['broken-glass', '404-tea', 'smiley-roll', 'error-glitch', 'pickle', 'dustpan', 'knife', 'bad-news', 'balloon-gun', 'fangs'],
}

const toId = (set, file) => `${set}_${file}`.toUpperCase().replace(/-/g, '_')

export const stickerSets = Object.entries(sets).map(([set, files]) => ({
  set,
  stickers: files.map((file) => ({ id: toId(set, file), src: `/stickers/${set}/${file}.webp` })),
}))

const byId = new Map(stickerSets.flatMap(({ stickers }) => stickers.map((sticker) => [sticker.id, sticker.src])))

export const stickerSrc = (id) => byId.get(id) ?? null

export const fontFamily = (value) => fonts.find((font) => font.value === value)?.family ?? 'var(--font-serif)'

export const colorCss = (value) => colors.find((color) => color.value === value)?.css ?? 'var(--color-ink)'

export const suggestedEmojis = ['🖤', '✨', '🪩', '🥋', '🗡️', '🫀', '🧷', '🌙', '🦋', '🕯️', '🪞', '🎧']
