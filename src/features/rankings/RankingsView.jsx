import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Crown } from 'lucide-react'
import { getItemRanking } from '@/api/items.js'
import { getUserRanking } from '@/api/users.js'
import Avatar from '@/components/Avatar.jsx'
import EmptyState from '@/components/EmptyState.jsx'
import { Chip } from '@/components/ui/chip.jsx'
import PhotoViewer from '@/features/closet/PhotoViewer.jsx'
import { queryKeys } from '@/lib/queryKeys.js'
import { cn } from '@/lib/utils'

const rank = (n) => String(n).padStart(2, '0')
const percent = (rate) => `${Math.round(rate * 100)}%`
const requests = (count) => `${count} ${count === 1 ? 'request' : 'requests'}`

function Photo({ piece, className, onOpen }) {
  const cover = piece?.images?.[0]?.url
  return (
    <button
      type="button"
      aria-label={`Open photo of ${piece?.name}`}
      onClick={onOpen}
      disabled={!cover}
      className={cn('block shrink-0 cursor-zoom-in overflow-hidden bg-plate shadow-subtle disabled:cursor-default', className)}
    >
      {cover && <img src={cover} alt="" className="size-full object-cover" />}
    </button>
  )
}

function Pieces({ rows }) {
  const [viewing, setViewing] = useState(null)
  const photos = rows.flatMap(({ item }) => (item?.images?.[0] ? [{ key: item.id, url: item.images[0].url, name: item.name }] : []))
  const open = (item) => setViewing(photos.findIndex((photo) => photo.key === item?.id))
  const [top, ...rest] = rows

  return (
    <div className="grid items-start gap-3.5 xl:grid-cols-[345px_minmax(0,640px)] xl:gap-[79px]">
      <article className="flex flex-col gap-3.5 rounded-[28px] bg-paper px-3.5 pt-3.5 pb-[18px] shadow-raised">
        <div className="relative">
          <Photo piece={top.item} onOpen={() => open(top.item)} className="aspect-[4/5] w-full rounded-[20px]" />
          <span className="pointer-events-none absolute top-3.5 left-3.5 rounded-full bg-paper px-3.5 pt-1.5 pb-2 font-serif text-[30px] leading-none text-accent shadow-subtle">
            01
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 px-1">
          <span className="truncate text-xl leading-6 font-semibold tracking-[-0.02em] text-ink">{top.item?.name}</span>
          <span className="shrink-0 font-mono text-[10px] font-medium tracking-[0.12em] text-ink uppercase">{requests(top.request_count)}</span>
        </div>
      </article>

      {rest.length > 0 && (
        <ol className="flex flex-col gap-3.5" start={2}>
          {rest.map(({ item, request_count: count }, index) => (
            <li key={item?.id ?? index} className="flex items-center gap-3.5 rounded-[20px] bg-paper py-3 pr-[18px] pl-3.5 shadow-raised">
              <span className="w-[34px] shrink-0 font-serif text-[32px] leading-none text-ink">{rank(index + 2)}</span>
              <Photo piece={item} onOpen={() => open(item)} className="h-[90px] w-[72px] rounded-[14px]" />
              <span className="flex min-w-0 flex-col gap-[5px]">
                <span className="truncate text-[15px] leading-[18px] font-semibold tracking-[-0.01em] text-ink">{item?.name}</span>
                <span className="font-mono text-[10px] tracking-[0.12em] text-secondary uppercase">{requests(count)}</span>
              </span>
            </li>
          ))}
        </ol>
      )}

      <PhotoViewer
        open={viewing !== null && viewing >= 0}
        onOpenChange={(value) => !value && setViewing(null)}
        photos={photos}
        index={Math.max(viewing ?? 0, 0)}
        onIndexChange={setViewing}
        title={photos[viewing ?? 0]?.name ?? ''}
      />
    </div>
  )
}

function Highlight({ label, row, best }) {
  return (
    <article className={cn('flex flex-col items-start gap-2.5 rounded-[24px] bg-paper px-4 pt-4 pb-[18px]', best ? 'shadow-raised' : 'shadow-inset')}>
      <span className="flex items-center gap-1.5">
        {best && <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />}
        <span className="font-mono text-[10px] font-medium tracking-[0.12em] text-secondary uppercase">{label}</span>
      </span>
      <Avatar user={row.user} size={56} className="shadow-inset" />
      <span className="max-w-full truncate text-base font-semibold tracking-[-0.01em] text-ink">@{row.user?.handle}</span>
      <span className={cn('font-serif text-[44px] leading-none', best ? 'text-accent' : 'text-ink')}>{percent(row.success_rate)}</span>
      <span className="font-mono text-[10px] tracking-[0.12em] text-secondary uppercase">of requests ended in a swap</span>
    </article>
  )
}

function People({ rows }) {
  const best = rows[0]
  const worst = rows.length > 1 ? rows[rows.length - 1] : null

  return (
    <div className="grid items-start gap-3.5 xl:grid-cols-[520px_minmax(0,520px)] xl:gap-6">
      <div className="flex flex-col gap-[18px]">
        <div className={cn('grid gap-3', worst && 'grid-cols-2')}>
          <Highlight label="Most swaps done" row={best} best />
          {worst && <Highlight label="Still warming up" row={worst} />}
        </div>
        <p className="font-serif text-[17px] leading-[1.2] text-secondary">Share of each person’s requests that ended in a swap.</p>
      </div>
      <ol className="flex flex-col gap-3.5">
        {rows.map((row, index) => (
          <li key={row.user?.id ?? index} className="flex items-center gap-3 rounded-[20px] bg-paper py-3 pr-[18px] pl-3.5 shadow-raised">
            <span className="w-[30px] shrink-0 font-serif text-[26px] leading-none text-ink">{rank(index + 1)}</span>
            <Avatar user={row.user} size={44} className="shadow-inset" />
            <span className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="truncate text-[15px] leading-[18px] font-semibold tracking-[-0.01em] text-ink">@{row.user?.handle}</span>
              <span className="block h-1.5 overflow-hidden rounded-full bg-paper shadow-inset">
                <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.max(4, row.success_rate * 100)}%` }} />
              </span>
            </span>
            <span className="shrink-0 font-mono text-[13px] font-medium text-ink">{percent(row.success_rate)}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function RankingsView() {
  const [list, setList] = useState('pieces')
  const items = useQuery({ queryKey: [...queryKeys.rankings, 'items'], queryFn: getItemRanking })
  const people = useQuery({ queryKey: [...queryKeys.rankings, 'users'], queryFn: getUserRanking })
  const rows = list === 'pieces' ? items.data : people.data

  if (items.data && people.data && !items.data.length && !people.data.length) {
    return (
      <EmptyState
        icon={Crown}
        title="No rankings yet."
        body="They appear once people start asking for pieces."
        action="Back to universes"
        to="/discover"
      />
    )
  }

  return (
    <div className="flex flex-col gap-[18px] xl:gap-8">
      <div className="flex gap-2.5 xl:gap-3">
        {[
          { value: 'pieces', label: 'Pieces' },
          { value: 'people', label: 'People' },
        ].map((option) => (
          <Chip
            key={option.value}
            selected={list === option.value}
            onSelectedChange={() => setList(option.value)}
            className={list === option.value ? 'bg-accent text-white shadow-accent' : ''}
          >
            {option.label}
          </Chip>
        ))}
      </div>
      {rows &&
        (rows.length ? (
          list === 'pieces' ? (
            <Pieces rows={rows} />
          ) : (
            <People rows={rows} />
          )
        ) : (
          <p className="font-serif text-lg text-secondary">Nothing here yet.</p>
        ))}
    </div>
  )
}
