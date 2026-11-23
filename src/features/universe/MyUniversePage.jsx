import { useQuery } from '@tanstack/react-query'
import Loader from '@/components/Loader.jsx'
import { loadingLines } from '@/lib/loadingLines.js'
import { Pencil } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { getMyUniverse } from '@/api/universes.js'
import PageHeader from '@/components/PageHeader.jsx'
import { queryKeys } from '@/lib/queryKeys.js'
import EmptyPoster from './EmptyPoster.jsx'
import { displayStyle } from './styles.js'
import SongPill from './SongPill.jsx'
import UniverseBoard from './UniverseBoard.jsx'

const pad = (value) => String(value ?? 0).padStart(3, '0')

function Counter({ value, label, to }) {
  return (
    <Link to={to} className="group flex items-baseline gap-2">
      <span
        aria-hidden="true"
        className="size-[5px] shrink-0 -translate-y-[3px] scale-0 rounded-full bg-accent transition-transform duration-220 ease-ui group-hover:scale-100"
      />
      <span className="text-emboss font-mono text-[26px] leading-none font-medium">{pad(value)}</span>
      <span className="font-mono text-[10px] tracking-[0.14em] text-secondary uppercase transition-colors duration-220 ease-ui group-hover:text-accent">
        {label}
      </span>
    </Link>
  )
}

export default function MyUniversePage() {
  const { data: universe } = useQuery({ queryKey: queryKeys.myUniverse, queryFn: getMyUniverse })
  const navigate = useNavigate()
  if (!universe) return <Loader line={loadingLines.universe} />

  const styles = universe.style ? universe.style.split(', ') : []

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-end justify-between gap-6">
        <PageHeader label="004 — Universe" title="My universe" subline={universe.description || universe.name} />
        <Link
          to="/universe/edit"
          className="press mb-1.5 flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-secondary transition-colors duration-220 ease-ui hover:text-ink xl:mb-2.5"
        >
          <Pencil className="size-3.5" strokeWidth={1.6} />
          Edit universe
        </Link>
      </div>

      <div className="flex flex-col gap-4 border-y border-ink/[0.08] py-4 xl:flex-row xl:items-center xl:justify-between xl:gap-8 xl:py-3.5">
        {styles.length > 0 && <p className="label-mono text-[10px] xl:min-w-0 xl:flex-1 xl:truncate">{styles.map(displayStyle).join('  ·  ')}</p>}
        <nav aria-label="Universe counts" className="flex items-baseline justify-between xl:justify-center xl:gap-7">
          <Counter value={universe.counts?.pieces} label="Pieces" to="/closet" />
          <Counter value={universe.counts?.matches} label="Matches" to="/matches" />
          <Counter value={universe.counts?.requests} label="Requests" to="/universe/requests" />
        </nav>
        <div className="xl:flex xl:flex-1 xl:justify-end">
          <SongPill
            key={universe.spotify_track_id ?? 'none'}
            trackId={universe.spotify_track_id}
            title={universe.spotify_track_title}
            className="w-full xl:w-[280px]"
            onEmptyClick={() => navigate('/universe/edit', { state: { tool: 'audio' } })}
          />
        </div>
      </div>

      <UniverseBoard fill universe={universe} emptyState={<EmptyPoster />} />
    </div>
  )
}
