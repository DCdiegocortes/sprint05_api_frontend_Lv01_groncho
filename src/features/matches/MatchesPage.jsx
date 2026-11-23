import { useCallback, useState } from 'react'
import Loader from '@/components/Loader.jsx'
import { loadingLines } from '@/lib/loadingLines.js'
import { Heart, HeartOff } from 'lucide-react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import PageHeader from '@/components/PageHeader.jsx'
import Avatar from '@/components/Avatar.jsx'
import EmptyWall from '@/components/EmptyWall.jsx'
import Toast from '@/components/Toast.jsx'
import { Segmented } from '@/components/ui/segmented.jsx'
import { useMediaQuery } from '@/hooks/useMediaQuery.js'
import { MatchStatus } from '@/lib/constants.js'
import { cn } from '@/lib/utils'
import { countWord } from '@/lib/words.js'
import MatchView from './MatchView.jsx'
import { isActive, partnerStyles, useMatches, useWardrobe } from './useMatches.js'

function PieceCount({ match }) {
  const { data: pieces } = useWardrobe(match)
  const label = !isActive(match) ? 'Closed' : pieces ? `${pieces.length} ${pieces.length === 1 ? 'piece' : 'pieces'}` : ''
  return <span className="label-mono shrink-0 font-medium">{label}</span>
}

function MatchCard({ match }) {
  const { data: pieces } = useWardrobe(match)
  const active = isActive(match)

  return (
    <Link to={`/matches/${match.id}`} className="press flex flex-col gap-3.5 rounded-[24px] bg-paper p-4 shadow-raised">
      <span className="flex items-center gap-3">
        <Avatar user={match.partner} size={46} className="shadow-inset" />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-[17px] font-semibold text-ink">@{match.partner.handle}</span>
          <span className="label-mono truncate">{partnerStyles(match)}</span>
        </span>
        <PieceCount match={match} />
      </span>
      {active ? (
        pieces?.length > 0 && (
          <span className="grid grid-cols-3 gap-2">
            {pieces.slice(0, 3).map((piece) => (
              <span key={piece.id} className="block aspect-[110/114] overflow-hidden rounded-[14px] bg-plate">
                {piece.images?.[0] && <img src={piece.images[0].url} alt="" className="size-full object-cover" />}
              </span>
            ))}
          </span>
        )
      ) : (
        <span className="font-serif text-[17px] leading-snug text-secondary">Wardrobe closed. Requests already sent stay in Requests.</span>
      )}
    </Link>
  )
}

function MatchRow({ match, selected }) {
  return (
    <Link
      to={`/matches/${match.id}`}
      aria-current={selected ? 'page' : undefined}
      className={cn(
        'press flex items-center gap-3 rounded-[20px] bg-paper py-3 pr-4 pl-3.5 transition-shadow duration-220 ease-ui',
        selected ? 'shadow-inset' : 'shadow-raised hover:shadow-subtle',
      )}
    >
      <Avatar user={match.partner} size={44} className="shadow-inset" />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-base font-semibold text-ink">@{match.partner.handle}</span>
        <span className="label-mono truncate">{partnerStyles(match)}</span>
      </span>
      {selected && <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />}
      <PieceCount match={match} />
    </Link>
  )
}

const emptyLines = {
  none: 'Matches start with a like. Go find your people.',
  [MatchStatus.ACTIVE]: 'No matches yet. Someone out there dresses like you.',
  [MatchStatus.CLOSED]: 'No goodbyes yet. Every match is still on.',
}

function EmptyMatches({ kind, onSeeActive }) {
  if (kind === MatchStatus.CLOSED && onSeeActive) {
    return <EmptyWall icon={HeartOff} line={emptyLines[kind]} action="See your matches?" onClick={onSeeActive} label="See your active matches" />
  }
  return (
    <EmptyWall
      icon={kind === MatchStatus.CLOSED ? HeartOff : Heart}
      line={emptyLines[kind]}
      action="Explore universes?"
      to="/discover"
      label="Explore universes in Discover"
    />
  )
}

export default function MatchesPage() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const wide = useMediaQuery('(min-width: 1280px)')
  const { data: matches } = useMatches()
  const [toast, setToast] = useState(() =>
    location.state?.closed ? { title: `Match with ${location.state.closed} closed`, hint: 'Find it under Closed' } : null,
  )
  const [view, setView] = useState(null)
  const clearToast = useCallback(() => setToast(null), [])

  const onClosed = (handle) => {
    setToast({ title: `Match with ${handle} closed`, hint: 'Find it under Closed' })
    navigate('/matches')
  }

  if (!matches)
    return (
      <div className="flex flex-col">
        <PageHeader label="003 — Matches" title="Matches" />
        <Loader line={loadingLines.matches} />
      </div>
    )

  const active = matches.filter(isActive)
  const closed = matches.filter((match) => match.status === MatchStatus.CLOSED)
  const routed = matchId ? matches.find((match) => String(match.id) === matchId) : null
  const status = view ?? (routed && !isActive(routed) ? MatchStatus.CLOSED : MatchStatus.ACTIVE)
  const shown = status === MatchStatus.ACTIVE ? active : closed
  const selected = routed ?? (wide ? shown[0] : null)
  const subline =
    status === MatchStatus.ACTIVE
      ? `${countWord(active.length)} ${active.length === 1 ? 'universe that feels' : 'universes that feel'} like yours.`
      : 'Wardrobes that closed.'

  if (routed && !wide) {
    return (
      <>
        <MatchView key={routed.id} match={routed} standalone onClosed={onClosed} />
        <Toast toast={toast} onDone={clearToast} />
      </>
    )
  }

  if (!matches.length) {
    return (
      <div className="flex flex-col gap-[18px] xl:gap-10">
        <PageHeader label="003 — Matches" title="Matches" subline="Nobody yet, and that is fine." />
        <EmptyMatches kind="none" />
      </div>
    )
  }

  const switcher = (
    <Segmented
      label="Matches"
      value={status}
      onChange={(next) => {
        setView(next)
        if (routed) navigate('/matches')
      }}
      options={[
        { value: MatchStatus.ACTIVE, label: `Active · ${active.length}` },
        { value: MatchStatus.CLOSED, label: `Closed · ${closed.length}` },
      ]}
    />
  )

  return (
    <div className="flex flex-col gap-[18px] xl:gap-10">
      <PageHeader label="003 — Matches" title="Matches" subline={subline} />

      {!shown.length ? (
        <>
          <div className="xl:w-[340px]">{switcher}</div>
          <EmptyMatches kind={status} onSeeActive={active.length ? () => setView(MatchStatus.ACTIVE) : undefined} />
        </>
      ) : wide ? (
        <div className="grid grid-cols-[340px_minmax(0,1fr)] items-start gap-8">
          <div className="flex flex-col gap-4">
            {switcher}
            <div className="flex flex-col gap-3">
              {shown.map((match) => (
                <MatchRow key={match.id} match={match} selected={selected?.id === match.id} />
              ))}
            </div>
          </div>
          {selected && (
            <section className="rounded-[28px] bg-paper p-7 shadow-raised">
              <MatchView key={selected.id} match={selected} onClosed={onClosed} />
            </section>
          )}
        </div>
      ) : (
        <>
          {switcher}
          <div className="flex flex-col gap-3.5">
            {shown.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </>
      )}

      <Toast toast={toast} onDone={clearToast} />
    </div>
  )
}
