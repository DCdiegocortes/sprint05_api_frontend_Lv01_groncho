import { useState } from 'react'
import BackLink from '@/components/BackLink.jsx'
import { Segmented } from '@/components/ui/segmented.jsx'
import { offerLabel } from '@/features/closet/pieces.js'
import SongPill from '@/features/universe/SongPill.jsx'
import UniverseBoard from '@/features/universe/UniverseBoard.jsx'
import { cn } from '@/lib/utils'
import ClosePanel from './ClosePanel.jsx'
import RequestPanel from './RequestPanel.jsx'
import { isActive, partnerStyles, usePartnerUniverse, useWardrobe } from './useMatches.js'

function WardrobeCard({ piece, selected, onPick }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onPick}
      className={cn(
        'press group flex w-full flex-col overflow-hidden rounded-[20px] bg-paper text-left shadow-raised ring-2 transition-shadow duration-220 ease-ui',
        selected ? 'ring-accent' : 'ring-transparent',
      )}
    >
      <span className="block aspect-[190/214] w-full overflow-hidden bg-plate">
        {piece.images?.[0] && (
          <img
            src={piece.images[0].url}
            alt=""
            className="size-full object-cover transition-transform duration-300 ease-ui group-hover:scale-[1.03]"
          />
        )}
      </span>
      <span className="flex flex-col items-start gap-2 p-3">
        <span className="line-clamp-1 text-[13px] font-semibold tracking-[-0.01em] text-ink">{piece.name}</span>
        <span className="rounded-[4px] bg-ink/[0.06] px-2 py-[3px] font-mono text-[10px] font-medium tracking-[0.12em] text-secondary uppercase">
          {offerLabel[piece.offer_type]}
        </span>
      </span>
    </button>
  )
}

export default function MatchView({ match, standalone = false, onClosed }) {
  const active = isActive(match)
  const { data: universe } = usePartnerUniverse(match)
  const { data: pieces } = useWardrobe(match)
  const [tab, setTab] = useState('universe')
  const [picked, setPicked] = useState(null)
  const [closing, setClosing] = useState(false)
  const handle = `@${match.partner.handle}`
  const subline = [universe?.name, partnerStyles(match).toLowerCase()].filter(Boolean).join(' · ')
  const count = pieces?.length

  return (
    <div className="flex flex-col gap-[18px]">
      {standalone && (
        <BackLink to="/matches" label="Back to matches">
          Matches
        </BackLink>
      )}

      <header className="flex flex-col gap-1">
        <span className="label-mono">003 — Matched universe</span>
        <h2 className="text-[40px] leading-[1.05] font-bold tracking-[-0.035em] text-ink xl:text-[34px]">{handle}</h2>
        {subline && <p className="font-serif text-subline leading-tight text-secondary">{subline}.</p>}
      </header>

      <Segmented
        label="Show"
        className="md:w-[320px] md:self-start"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'universe', label: 'Universe' },
          { value: 'wardrobe', label: active && count !== undefined ? `Wardrobe · ${count}` : 'Wardrobe' },
        ]}
      />

      {tab === 'universe' ? (
        <div className="flex flex-col gap-[18px]">
          {universe?.spotify_track_id && (
            <div className="md:w-[360px]">
              <SongPill
                key={universe.spotify_track_id}
                trackId={universe.spotify_track_id}
                title={universe.spotify_track_title}
                cover={universe.spotify_track_cover_url}
                empty="Their soundtrack"
              />
            </div>
          )}
          {universe ? (
            <UniverseBoard
              universe={universe}
              emptyState={
                <p className="rounded-[24px] bg-paper px-6 py-10 text-center font-serif text-lg text-secondary shadow-inset">
                  No photos in this universe yet.
                </p>
              }
            />
          ) : (
            <div className="h-64 rounded-[24px] bg-paper shadow-inset" />
          )}
        </div>
      ) : !active ? (
        <p className="rounded-[24px] bg-paper px-6 py-8 font-serif text-lg text-secondary shadow-inset">
          Wardrobe closed. Requests already sent stay in Requests.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {pieces?.length === 0 && (
            <p className="rounded-[24px] bg-paper px-6 py-8 font-serif text-lg text-secondary shadow-inset">
              Nothing available right now. Pieces in a trade come back when it ends.
            </p>
          )}
          {pieces?.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] md:gap-4">
              {pieces.map((piece) => (
                <li key={piece.id}>
                  <WardrobeCard piece={piece} selected={picked?.id === piece.id} onPick={() => setPicked(piece)} />
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => setClosing(true)}
            className="press mx-auto px-3 py-2.5 text-[15px] font-medium text-accent transition-opacity duration-220 ease-ui hover:opacity-70"
          >
            Close match
          </button>
        </div>
      )}

      {picked && <RequestPanel key={picked.id} match={match} piece={picked} onClose={() => setPicked(null)} />}
      {active && <ClosePanel match={match} open={closing} onOpenChange={setClosing} onClosed={onClosed} />}
    </div>
  )
}
