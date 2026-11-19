import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Sheet, SheetContent } from '@/components/ui/sheet.jsx'

const TRACK_LINK = /^https:\/\/open\.spotify\.com\/(?:intl-[a-zA-Z-]+\/)?track\/[A-Za-z0-9]{22}(?:\?\S*)?$/

export default function SongSheet({ open, onOpenChange, universe, onSave, saving }) {
  const [link, setLink] = useState('')
  const [error, setError] = useState('')
  const hasSong = Boolean(universe?.spotify_track_id)

  const save = (event) => {
    event.preventDefault()
    const value = link.trim()
    if (!TRACK_LINK.test(value)) {
      setError('Paste a Spotify track link, like open.spotify.com/track/…')
      return
    }
    onSave({ spotify_url: value }, () => {
      setLink('')
      onOpenChange(false)
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Add a song" subtitle="From Spotify">
        <form onSubmit={save} noValidate className="flex flex-col gap-4">
          {hasSong && (
            <div className="flex items-center gap-3 rounded-2xl bg-card p-2.5 shadow-subtle">
              {universe.spotify_track_cover_url && (
                <img src={universe.spotify_track_cover_url} alt="" className="size-11 rounded-lg object-cover" />
              )}
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-semibold text-ink">{universe.spotify_track_title ?? 'Current soundtrack'}</span>
                <span className="label-mono text-[8px]">Now playing in your universe</span>
              </span>
              <button
                type="button"
                onClick={() => onSave({ spotify_url: null })}
                className="press text-sm font-medium text-accent transition-opacity duration-220 ease-ui hover:opacity-70"
              >
                Remove
              </button>
            </div>
          )}
          <Input
            label="Spotify track link"
            value={link}
            placeholder="https://open.spotify.com/track/…"
            error={error}
            onChange={(event) => {
              setLink(event.target.value)
              setError('')
            }}
          />
          <p className="font-serif text-sm text-secondary">In Spotify, open the song, tap Share and Copy link.</p>
          <Button type="submit" disabled={saving}>
            {saving ? 'Tuning in' : 'Set as soundtrack'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
