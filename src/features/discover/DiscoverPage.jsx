import { useState } from 'react'
import Loader from '@/components/Loader.jsx'
import { loadingLines } from '@/lib/loadingLines.js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react'
import { Eye } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import { swipe } from '@/api/swipes.js'
import { getFeed } from '@/api/universes.js'
import EmptyState from '@/components/EmptyState.jsx'
import PageHeader from '@/components/PageHeader.jsx'
import { Segmented } from '@/components/ui/segmented.jsx'
import RankingsView from '@/features/rankings/RankingsView.jsx'
import { queryKeys } from '@/lib/queryKeys.js'
import { useAuth } from '@/features/auth/useAuth.js'
import { displayStyle } from '@/features/universe/styles.js'
import UniverseBoard from '@/features/universe/UniverseBoard.jsx'
import { useMyUniverse } from '@/features/universe/useMyUniverse.js'
import MatchMoment from './MatchMoment.jsx'
import SwipeBar from './SwipeBar.jsx'

function Owner({ universe }) {
  const styles = universe.style ? universe.style.split(', ').map(displayStyle).join(' · ') : universe.name
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-[46px] shrink-0 place-items-center overflow-hidden rounded-full bg-paper shadow-inset">
        {universe.user?.avatar_url ? (
          <img src={universe.user.avatar_url} alt="" className="size-full object-cover" />
        ) : (
          <span className="font-mono text-base text-ink">{universe.user?.name?.[0]?.toUpperCase()}</span>
        )}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-[17px] font-semibold text-ink">@{universe.user?.handle}</span>
        <span className="label-mono truncate text-[10px]">{styles}</span>
      </span>
    </div>
  )
}

export default function DiscoverPage() {
  const navigate = useNavigate()
  const rankings = useLocation().pathname.startsWith('/discover/rankings')
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { data: mine } = useMyUniverse()
  const feed = useQuery({ queryKey: queryKeys.feed(), queryFn: () => getFeed(), enabled: !rankings })
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [match, setMatch] = useState(null)
  const swipeX = useMotionValue(0)
  const rotate = useTransform(swipeX, [-1, 1], [-8, 8])
  const shift = useTransform(swipeX, [-1, 1], [-40, 40])

  const universes = feed.data ?? []
  const current = universes[index]

  const send = useMutation({
    mutationFn: ({ target, liked }) => swipe(target.user_id ?? target.user?.id, liked),
    onSuccess: (result, { target }) => {
      if (result.matched) {
        queryClient.invalidateQueries({ queryKey: queryKeys.matches })
        setMatch({ id: result.match_id, universe: target })
      }
    },
  })

  const decide = (liked) => {
    if (!current) return
    setDirection(liked ? 1 : -1)
    send.mutate({ target: current, liked })
    swipeX.set(0)
    if (index + 1 >= universes.length) {
      setIndex(0)
      feed.refetch()
    } else {
      setIndex(index + 1)
    }
  }

  const switcher = (
    <Segmented
      label="Discover"
      className="md:w-[340px]"
      value={rankings ? 'rankings' : 'universes'}
      onChange={(next) => navigate(next === 'rankings' ? '/discover/rankings' : '/discover')}
      options={[
        { value: 'universes', label: 'Universes' },
        { value: 'rankings', label: 'Rankings' },
      ]}
    />
  )

  if (rankings) {
    return (
      <div className="flex flex-col gap-[18px] xl:gap-10">
        <PageHeader label="001 — Discover" title="Discover" subline="Who and what everyone wants." />
        <div className="flex flex-col gap-[18px] xl:gap-8">
          {switcher}
          <RankingsView />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[18px] pb-[110px] xl:gap-10">
      <PageHeader label="001 — Discover" title="Discover" subline="Universes worth getting lost in." />
      {switcher}

      {feed.isPending || (feed.isFetching && !current) ? (
        <Loader line={loadingLines.discover} />
      ) : !current ? (
        <EmptyState
          icon={Eye}
          title="You have seen every universe."
          body="New ones arrive as people join. Meanwhile, make yours shine."
          action="Edit your universe"
          to="/universe/edit"
        />
      ) : (
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.article
            key={current.id}
            custom={direction}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] } }}
            exit={(dir) => ({ opacity: 0, x: dir * 320, rotate: dir * 14, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } })}
            style={{ rotate, x: shift }}
            aria-label={`${current.name} by @${current.user?.handle}`}
            className="flex flex-col gap-[18px]"
          >
            <Owner universe={current} />
            {current.description && <p className="-mt-1 font-serif text-lg text-secondary">{current.description}</p>}
            <UniverseBoard
              universe={current}
              emptyState={
                <div className="grid h-60 place-items-center rounded-2xl bg-paper font-serif text-lg text-secondary shadow-inset">{current.name}</div>
              }
            />
          </motion.article>
        </AnimatePresence>
      )}

      {current && (
        <div className="fixed inset-x-0 bottom-[calc(max(env(safe-area-inset-bottom),20px)+96px)] z-20 mx-auto w-full max-w-[440px] px-9 xl:bottom-8 xl:left-[280px] xl:max-w-[520px]">
          <SwipeBar x={swipeX} disabled={send.isPending && !current} onDecide={decide} />
        </div>
      )}

      <AnimatePresence>
        {match && (
          <MatchMoment
            mine={{ photo: mine?.images?.[0]?.url, initial: user?.name?.[0] }}
            theirs={{ photo: match.universe.images?.[0]?.url, initial: match.universe.user?.name?.[0] }}
            handle={match.universe.user?.handle}
            onOpenWardrobe={() => navigate(`/matches/${match.id}`)}
            onKeepDiscovering={() => setMatch(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
