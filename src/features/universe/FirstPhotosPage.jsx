import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { getMyUniverse, updateUniverse } from '@/api/universes.js'
import Logo from '@/components/Logo.jsx'
import { Button } from '@/components/ui/button.jsx'
import { UniverseLayout } from '@/lib/constants.js'
import { queryKeys } from '@/lib/queryKeys.js'
import { layoutName } from './layouts.js'
import LayoutPicker from './LayoutPicker.jsx'
import UniversePreview from './UniversePreview.jsx'
import { usePhotoUpload } from './usePhotoUpload.js'

const COACH_KEY = 'groncho.coach.layout'

function readCoachSeen() {
  try {
    return localStorage.getItem(COACH_KEY) === '1'
  } catch {
    return true
  }
}

export default function FirstPhotosPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInput = useRef(null)
  const [coachSeen, setCoachSeen] = useState(readCoachSeen)
  const { data: universe } = useQuery({ queryKey: queryKeys.myUniverse, queryFn: getMyUniverse })
  const { pending, error, upload } = usePhotoUpload(universe?.id)

  const layout = universe?.layout ?? UniverseLayout.MASONRY
  const photos = [...(universe?.images ?? []), ...pending]

  const changeLayout = useMutation({
    mutationFn: (next) => updateUniverse(universe.id, { layout: next }),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.myUniverse })
      const previous = queryClient.getQueryData(queryKeys.myUniverse)
      queryClient.setQueryData(queryKeys.myUniverse, { ...previous, layout: next })
      return { previous }
    },
    onError: (_error, _next, context) => queryClient.setQueryData(queryKeys.myUniverse, context.previous),
  })

  const pickLayout = (next) => {
    if (!coachSeen) {
      setCoachSeen(true)
      try {
        localStorage.setItem(COACH_KEY, '1')
      } catch {
        return changeLayout.mutate(next)
      }
    }
    changeLayout.mutate(next)
  }

  const addTile = (
    <button
      type="button"
      onClick={() => fileInput.current?.click()}
      className="press grid h-[50px] w-full place-items-center rounded-2xl bg-paper text-[13px] font-semibold text-ink shadow-inset"
    >
      + Add photos
    </button>
  )

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pt-[max(env(safe-area-inset-top),24px)] pb-[max(env(safe-area-inset-bottom),28px)]">
      <div className="flex items-center justify-between pt-10">
        <Logo size={20} />
        <span className="flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 shadow-inset">
          <span className="size-1.5 rounded-full bg-accent" />
          <span className="label-mono text-[10px]">Last step</span>
        </span>
      </div>

      <header className="mt-8 flex flex-col gap-1.5">
        <span className="label-mono">003 — Your universe</span>
        <h1 className="text-headline font-bold">
          Add your
          <br />
          photos.
        </h1>
        <p className="font-serif text-subline text-secondary">Pick a layout and watch it come alive.</p>
      </header>

      <section aria-label="Preview" className="mt-6 flex flex-col gap-2.5 rounded-[26px] bg-card p-3 shadow-raised">
        <div className="flex items-center justify-between px-1 pt-0.5">
          <span className="label-mono text-[10px]">How others see it</span>
          <span className="rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] font-medium tracking-[0.16em] text-white uppercase">
            {layoutName(layout)}
          </span>
        </div>
        <UniversePreview layout={layout} photos={photos} addTile={addTile} />
        {error && (
          <p role="alert" className="flex items-center gap-2 px-1 text-[13px] text-ink">
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
            {error}
          </p>
        )}
      </section>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        data-testid="photo-input"
        onChange={(event) => {
          upload(event.target.files)
          event.target.value = ''
        }}
      />

      <section className="relative mt-6 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="label-mono font-medium">Layout</span>
          <span className="label-mono flex items-center gap-2 text-[10px] text-ink/70">
            <span aria-hidden="true" className="size-[5px] shrink-0 rounded-full bg-accent" />
            Swipe for all 10
          </span>
        </div>
        {!coachSeen && (
          <span className="pointer-events-none absolute -top-5 left-[132px] z-10 flex items-center gap-2 rounded-[14px] bg-ink px-3.5 py-2 text-[12.5px] font-medium text-white shadow-float">
            <span className="size-1.5 rounded-full bg-accent" />
            Tap to preview
            <span className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 rounded-[2px] bg-ink" />
          </span>
        )}
        <LayoutPicker value={layout} onChange={pickLayout} photos={photos.filter((photo) => !photo.uploading)} universe={universe} />
      </section>

      <div className="mt-auto flex flex-col items-center gap-3 pt-6">
        <Button className="w-full" onClick={() => navigate('/discover')} disabled={pending.length > 0}>
          {pending.length ? 'Uploading your photos' : 'Enter Discover'}
        </Button>
        <button
          type="button"
          onClick={() => navigate('/discover')}
          className="press label-mono text-[10px] transition-opacity duration-220 ease-ui hover:opacity-70"
        >
          I will add photos later
        </button>
      </div>
    </main>
  )
}
