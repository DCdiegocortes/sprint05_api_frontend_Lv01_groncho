import { useEffect, useRef, useState } from 'react'
import { Music, Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { loadSpotifyApi } from './spotify.js'

export default function SongPill({ trackId, title, cover, empty, onEmptyClick }) {
  const host = useRef(null)
  const controller = useRef(null)
  const [state, setState] = useState('idle')

  useEffect(() => () => controller.current?.destroy?.(), [])

  const toggle = async () => {
    if (!trackId) return onEmptyClick?.()
    if (controller.current) {
      controller.current.togglePlay()
      return
    }
    setState('loading')
    const api = await loadSpotifyApi()
    const element = document.createElement('div')
    host.current.replaceChildren(element)
    api.createController(element, { uri: `spotify:track:${trackId}`, width: '100%', height: 80 }, (created) => {
      controller.current = created
      created.addListener('ready', () => created.play())
      created.addListener('playback_update', (event) => setState(event.data.isPaused ? 'paused' : 'playing'))
    })
  }

  const playing = state === 'playing'

  return (
    <div className="flex items-center gap-3 rounded-full bg-paper p-[9px] pr-5 shadow-raised">
      <button
        type="button"
        onClick={toggle}
        aria-label={trackId ? (playing ? 'Pause the soundtrack' : 'Play the soundtrack') : 'Add a song'}
        className={cn(
          'press grid size-11 shrink-0 place-items-center overflow-hidden rounded-full text-white',
          trackId ? 'bg-accent shadow-accent' : 'bg-card text-secondary shadow-subtle',
        )}
      >
        {!trackId ? (
          <Music className="size-[18px]" strokeWidth={1.6} />
        ) : playing ? (
          <Pause className="size-[18px] fill-current" strokeWidth={0} />
        ) : (
          <Play className="ml-0.5 size-[18px] fill-current" strokeWidth={0} />
        )}
      </button>
      {cover && <img src={cover} alt="" className="size-9 shrink-0 rounded-md object-cover" />}
      <span className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-[13px] font-semibold text-ink">{title ?? (trackId ? 'Universe soundtrack' : empty)}</span>
        <span className="label-mono text-[8px]">
          {trackId ? (state === 'loading' ? 'Opening Spotify' : 'Playing from Spotify') : 'No song yet'}
        </span>
      </span>
      {playing && (
        <span aria-hidden="true" className="ml-auto flex h-6 items-end gap-[3px]">
          {[10, 18, 26, 14, 22].map((h, i) => (
            <span key={i} className="w-[3px] animate-pulse rounded-full bg-ink" style={{ height: h, animationDelay: `${i * 120}ms` }} />
          ))}
        </span>
      )}
      <div ref={host} aria-hidden="true" className="pointer-events-none fixed -left-[9999px] h-px w-[300px] overflow-hidden opacity-0" />
    </div>
  )
}
