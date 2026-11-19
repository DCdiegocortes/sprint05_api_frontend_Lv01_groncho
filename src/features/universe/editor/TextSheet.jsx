import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Sheet, SheetContent } from '@/components/ui/sheet.jsx'
import { DecorationColor, DecorationFont, Limits } from '@/lib/constants.js'
import { cn } from '@/lib/utils'
import { colors, fonts } from '../decorations.js'

export default function TextSheet({ open, onOpenChange, onPlace }) {
  const [text, setText] = useState('')
  const [font, setFont] = useState(DecorationFont.ITALIANA)
  const [color, setColor] = useState(DecorationColor.BLACK)
  const [size, setSize] = useState(18)
  const family = fonts.find((item) => item.value === font).family
  const css = colors.find((item) => item.value === color).css

  const place = () => {
    if (!text.trim()) return
    onPlace({ type: 'TEXT', text: text.trim(), font, color, size })
    setText('')
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Add text" subtitle="Curated typefaces">
        <div className="flex flex-col gap-5">
          <div className="rounded-[22px] bg-plate px-4 py-5 shadow-inset">
            <textarea
              aria-label="Text"
              value={text}
              maxLength={Limits.DECORATION_TEXT_MAX}
              rows={2}
              onChange={(event) => setText(event.target.value)}
              placeholder="quiet armour."
              className="w-full resize-none bg-transparent leading-none outline-none placeholder:opacity-40"
              style={{ fontFamily: family, color: css, fontSize: Math.max(18, size * 1.4) }}
            />
            <span className="label-mono block text-right text-[8.5px]">
              {text.length} / {Limits.DECORATION_TEXT_MAX}
            </span>
          </div>

          <div role="radiogroup" aria-label="Typeface" className="grid grid-cols-5 gap-2">
            {fonts.map((item) => (
              <button
                key={item.value}
                type="button"
                role="radio"
                aria-checked={font === item.value}
                aria-label={item.name}
                onClick={() => setFont(item.value)}
                className={cn(
                  'press flex flex-col items-center gap-1 rounded-[16px] py-2.5 transition-shadow duration-220 ease-ui',
                  font === item.value ? 'bg-paper shadow-pressed' : 'bg-card shadow-subtle',
                )}
              >
                <span className="text-xl text-ink" style={{ fontFamily: item.family }}>
                  Aa
                </span>
                <span className="label-mono text-[7px]">{item.name}</span>
              </button>
            ))}
          </div>

          <label className="flex items-center gap-4">
            <span className="label-mono w-12 text-[9px]">Size</span>
            <input
              type="range"
              min={6}
              max={60}
              value={size}
              onChange={(event) => setSize(Number(event.target.value))}
              className="flex-1 accent-[var(--color-accent)]"
            />
          </label>

          <div className="flex items-center gap-4">
            <span className="label-mono w-12 text-[9px]">Colour</span>
            <div role="radiogroup" aria-label="Colour" className="flex gap-3">
              {colors.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  role="radio"
                  aria-checked={color === item.value}
                  aria-label={item.name}
                  onClick={() => setColor(item.value)}
                  className={cn(
                    'press size-9 rounded-full ring-offset-2 ring-offset-paper transition-shadow duration-220 ease-ui',
                    color === item.value ? 'ring-2 ring-ink' : 'shadow-subtle',
                  )}
                  style={{ background: item.css }}
                />
              ))}
            </div>
          </div>

          <Button onClick={place} disabled={!text.trim()}>
            Place text
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
