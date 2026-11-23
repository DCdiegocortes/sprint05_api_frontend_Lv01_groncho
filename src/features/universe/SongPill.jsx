import { useEffect, useRef, useState } from 'react'
import { Music, Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { loadSpotifyApi } from './spotify.js'

const BARS = [
  { speed: '0.7s', delay: '0s' },
  { speed: '1.05s', delay: '-0.4s' },
  { speed: '0.85s', delay: '-0.2s' },
  { speed: '1.1s', delay: '-0.7s' },
  { speed: '0.75s', delay: '-0.5s' },
]

function Equalizer({ playing }) {
  return (
    <span aria-hidden="true" className="flex h-4 shrink-0 items-end gap-[2.5px]">
      {BARS.map((bar, index) => (
        <span
          key={index}
          className={cn(
            'h-full w-[2px] origin-bottom rounded-full transition-[transform,background-color] duration-300 ease-ui',
            playing ? 'eq-bar bg-accent' : 'scale-y-[0.25] bg-secondary/50',
          )}
          style={playing ? { '--eq-speed': bar.speed, animationDelay: bar.delay } : undefined}
        />
      ))}
    </span>
  )
}

export default function SongPill({ trackId, title, onEmptyClick, className }) {
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
  const status = !trackId ? 'Paste a Spotify link' : state === 'loading' ? 'Opening Spotify' : state === 'paused' ? 'Paused' : 'Playing from Spotify'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={trackId ? (playing ? 'Pause the soundtrack' : 'Play the soundtrack') : 'Add a soundtrack'}
      className={cn('press flex h-10 min-w-0 items-center gap-2.5 rounded-full bg-paper py-[5px] pr-4 pl-[5px] text-left shadow-subtle', className)}
    >
      <span
        className={cn(
          'grid size-[30px] shrink-0 place-items-center rounded-full',
          trackId ? 'bg-accent text-white shadow-accent' : 'bg-paper text-secondary shadow-raised',
        )}
      >
        {!trackId ? (
          <Music className="size-3.5" strokeWidth={1.8} />
        ) : playing ? (
          <Pause className="size-3.5 fill-current" strokeWidth={0} />
        ) : (
          <Play className="ml-px size-3.5 fill-current" strokeWidth={0} />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13px] leading-4 font-medium text-ink">{title ?? (trackId ? 'Universe soundtrack' : 'Add a soundtrack')}</span>
        <span className="truncate font-mono text-[10px] leading-3 tracking-[0.12em] text-secondary uppercase">{status}</span>
      </span>
      {trackId && <Equalizer playing={playing} />}
      <span ref={host} aria-hidden="true" className="pointer-events-none fixed -left-[9999px] h-px w-[300px] overflow-hidden opacity-0" />
    </button>
  )
}
