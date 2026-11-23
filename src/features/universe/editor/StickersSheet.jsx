import { useState } from 'react'
import { Input } from '@/components/ui/input.jsx'
import { Segmented } from '@/components/ui/segmented.jsx'
import { Sheet, SheetContent } from '@/components/ui/sheet.jsx'
import { stickerSets, suggestedEmojis } from '../decorations.js'

const isSingleEmoji = (value) =>
  [...new Intl.Segmenter().segment(value)].length === 1 && /\p{Extended_Pictographic}|\p{Regional_Indicator}/u.test(value)

export default function StickersSheet({ open, onOpenChange, onPick }) {
  const [tab, setTab] = useState('stickers')
  const [emoji, setEmoji] = useState('')
  const [error, setError] = useState('')

  const pick = (decoration) => {
    onPick(decoration)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Stickers" subtitle="Drag one onto your universe">
        <Segmented
          label="Stickers or emojis"
          fit
          className="w-full"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'stickers', label: 'Stickers' },
            { value: 'emojis', label: 'Emojis' },
          ]}
        />

        {tab === 'stickers' ? (
          <div className="mt-5 flex flex-col gap-5">
            {stickerSets.map(({ set, stickers }) => (
              <section key={set} className="flex flex-col gap-2.5">
                <span className="label-mono text-[10px]">{set}</span>
                <div className="grid grid-cols-4 gap-3">
                  {stickers.map((sticker) => (
                    <button
                      key={sticker.id}
                      type="button"
                      aria-label={sticker.id.toLowerCase().replace(/_/g, ' ')}
                      onClick={() => pick({ type: 'STICKER', sticker: sticker.id, size: 24 })}
                      className="press grid aspect-square place-items-center rounded-[18px] bg-card p-2.5 shadow-subtle"
                    >
                      <img src={sticker.src} alt="" className="size-full object-contain" />
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-4">
            <div className="grid grid-cols-6 gap-2">
              {suggestedEmojis.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`Add ${value}`}
                  onClick={() => pick({ type: 'EMOJI', emoji: value, size: 14 })}
                  className="press grid aspect-square place-items-center rounded-full bg-card font-[family-name:var(--font-emoji)] text-xl shadow-subtle"
                >
                  {value}
                </button>
              ))}
            </div>
            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()
                if (!isSingleEmoji(emoji.trim())) return setError('Pick one emoji from your keyboard.')
                pick({ type: 'EMOJI', emoji: emoji.trim(), size: 14 })
                setEmoji('')
              }}
            >
              <Input
                label="Any emoji"
                value={emoji}
                placeholder="Tap the emoji key"
                error={error}
                onChange={(event) => {
                  setEmoji(event.target.value)
                  setError('')
                }}
              />
            </form>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
