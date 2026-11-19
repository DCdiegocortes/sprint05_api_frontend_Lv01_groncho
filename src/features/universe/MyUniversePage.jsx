import { useQuery } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { Link } from 'react-router'
import { getMyUniverse } from '@/api/universes.js'
import { queryKeys } from '@/lib/queryKeys.js'
import { displayStyle } from './styles.js'
import SongPill from './SongPill.jsx'
import UniverseBoard from './UniverseBoard.jsx'

const pad = (value) => String(value ?? 0).padStart(3, '0')

function Stat({ value, label, to }) {
  return (
    <Link to={to} className="press flex flex-1 flex-col items-center gap-1 rounded-[18px] bg-paper py-3 shadow-raised">
      <span className="font-mono text-xl text-ink">{pad(value)}</span>
      <span className="label-mono text-[8px]">{label}</span>
    </Link>
  )
}

export default function MyUniversePage() {
  const { data: universe } = useQuery({ queryKey: queryKeys.myUniverse, queryFn: getMyUniverse })
  if (!universe) return null

  const styles = universe.style ? universe.style.split(', ') : []

  return (
    <div className="flex flex-col gap-[18px]">
      <header className="flex flex-col gap-1">
        <span className="label-mono">004 — Universe</span>
        <h1 className="text-display font-bold">My universe</h1>
        <p className="font-serif text-subline text-secondary">{universe.description || universe.name}</p>
        {styles.length > 0 && (
          <p className="label-mono mt-1 text-[9px]">{styles.map(displayStyle).join('  ·  ')}</p>
        )}
      </header>

      <div className="flex gap-3">
        <Stat value={universe.counts?.pieces} label="Pieces" to="/closet" />
        <Stat value={universe.counts?.matches} label="Matches" to="/matches" />
        <Stat value={universe.counts?.requests} label="Requests" to="/universe/requests" />
      </div>

      <Link to="/universe/edit" className="press flex h-[50px] items-center justify-center gap-2.5 rounded-full bg-paper text-[15px] font-semibold text-ink shadow-raised">
        <Pencil className="size-[18px]" strokeWidth={1.6} />
        Edit universe
      </Link>

      <SongPill
        key={universe.spotify_track_id ?? 'none'}
        trackId={universe.spotify_track_id}
        title={universe.spotify_track_title}
        cover={universe.spotify_track_cover_url}
        empty="Universe soundtrack"
      />

      <div className="rounded-[26px] bg-card p-3 shadow-raised">
      <UniverseBoard
        universe={universe}
        emptyState={
          <Link to="/universe/edit" className="press grid h-40 place-items-center rounded-2xl bg-paper text-sm font-semibold text-secondary shadow-inset">
            Your moodboard is empty. Add photos.
          </Link>
        }
      />
      </div>
    </div>
  )
}
