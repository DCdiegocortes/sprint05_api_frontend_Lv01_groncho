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
    <Link
      to={to}
      className="group flex h-12 items-center justify-center gap-1.5 rounded-full px-2 xl:h-14 xl:gap-2.5 xl:px-7 transition-[background-color,box-shadow] duration-220 ease-ui hover:bg-card hover:shadow-subtle active:bg-paper active:shadow-pressed"
    >
      <span aria-hidden="true" className="size-1.5 shrink-0 scale-0 rounded-full bg-accent transition-transform duration-220 ease-ui group-hover:scale-100" />
      <span className="font-mono text-[17px] text-ink xl:text-xl">{pad(value)}</span>
      <span className="label-mono text-[9px] xl:text-[10px]">{label}</span>
    </Link>
  )
}

export default function MyUniversePage() {
  const { data: universe } = useQuery({ queryKey: queryKeys.myUniverse, queryFn: getMyUniverse })
  if (!universe) return null

  const styles = universe.style ? universe.style.split(', ') : []

  return (
    <div className="flex flex-col gap-[18px] xl:gap-5">
      <div className="flex flex-col gap-[18px] xl:flex-row xl:items-center xl:justify-between xl:gap-8 2xl:grid 2xl:grid-cols-[1fr_auto_1fr]">
        <header className="flex flex-col gap-1">
          <span className="label-mono">004 — Universe</span>
          <div className="flex flex-col gap-1 xl:flex-row xl:items-baseline xl:gap-4">
            <h1 className="text-display font-bold">My universe</h1>
            <p className="font-serif text-subline text-secondary">{universe.description || universe.name}</p>
          </div>
          {styles.length > 0 && <p className="label-mono mt-1 text-[9px]">{styles.map(displayStyle).join('  ·  ')}</p>}
          <nav aria-label="Universe counts" className="mt-5 grid grid-cols-3 rounded-full bg-paper p-1.5 shadow-inset xl:inline-flex xl:self-start">
            <Stat value={universe.counts?.pieces} label="Pieces" to="/closet" />
            <Stat value={universe.counts?.matches} label="Matches" to="/matches" />
            <Stat value={universe.counts?.requests} label="Requests" to="/universe/requests" />
          </nav>
        </header>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:self-stretch 2xl:contents">
          <Link
            to="/universe/edit"
            className="press flex h-[50px] items-center justify-center gap-2.5 rounded-full bg-paper text-[15px] font-semibold text-ink shadow-raised xl:px-5 xl:whitespace-nowrap 2xl:col-start-3 2xl:row-start-1 2xl:justify-self-end"
          >
            <Pencil className="size-[18px]" strokeWidth={1.6} />
            Edit universe
          </Link>
          <div className="xl:mb-[3px] xl:w-[280px] xl:self-end 2xl:col-start-2 2xl:row-start-1 2xl:w-[360px]">
            <SongPill
              key={universe.spotify_track_id ?? 'none'}
              trackId={universe.spotify_track_id}
              title={universe.spotify_track_title}
              cover={universe.spotify_track_cover_url}
              empty="Universe soundtrack"
            />
          </div>
        </div>
      </div>

      <UniverseBoard
        fill
        universe={universe}
        emptyState={
          <Link to="/universe/edit" className="press grid h-40 place-items-center rounded-2xl bg-paper text-sm font-semibold text-secondary shadow-inset">
            Your moodboard is empty. Add photos.
          </Link>
        }
      />
    </div>
  )
}
