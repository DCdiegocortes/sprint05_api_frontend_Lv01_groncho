import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronUp, Image, Music, Smile, Type } from 'lucide-react'
import TabBar from '@/app/shell/TabBar.jsx'
import TopActions from '@/app/shell/TopActions.jsx'
import Logo from '@/components/Logo.jsx'
import { Limits, UniverseLayout } from '@/lib/constants.js'
import { cn } from '@/lib/utils'
import LayoutPicker from '../LayoutPicker.jsx'
import SongPill from '../SongPill.jsx'
import { useDeletePhoto, useMyUniverse, useReorderPhotos, useUpdateUniverse } from '../useMyUniverse.js'
import { usePhotoUpload } from '../usePhotoUpload.js'
import DecorationEditor from './DecorationEditor.jsx'
import PhotoBoard from './PhotoBoard.jsx'
import PhotosSheet from './PhotosSheet.jsx'
import SongSheet from './SongSheet.jsx'
import StickersSheet from './StickersSheet.jsx'
import TextSheet from './TextSheet.jsx'

const tools = [
  { id: 'photos', label: 'Photos', Icon: Image },
  { id: 'audio', label: 'Audio', Icon: Music },
  { id: 'stickers', label: 'Stickers', Icon: Smile },
  { id: 'text', label: 'Text', Icon: Type },
]

const AUTOSAVE_MS = 900

export default function EditUniversePage() {
  const { data: universe } = useMyUniverse()
  const update = useUpdateUniverse(universe?.id)
  const reorder = useReorderPhotos(universe?.id)
  const removePhoto = useDeletePhoto(universe?.id)
  const { pending, error: uploadError, upload } = usePhotoUpload(universe?.id)
  const [sheet, setSheet] = useState(null)
  const [draft, setDraft] = useState(null)
  const [selected, setSelected] = useState(null)
  const [saveError, setSaveError] = useState('')
  const [tabsOpen, setTabsOpen] = useState(false)
  const saveTimer = useRef(null)
  const mutateRef = useRef(update.mutate)

  useEffect(() => {
    mutateRef.current = update.mutate
  })

  useEffect(() => {
    if (draft === null) return undefined
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      mutateRef.current(
        { decorations: draft },
        {
          onSuccess: () => setDraft(null),
          onError: () => setSaveError('Your decorations could not be saved. Try again.'),
        },
      )
    }, AUTOSAVE_MS)
    return () => clearTimeout(saveTimer.current)
  }, [draft])

  if (!universe) return null

  const decorations = draft ?? universe.decorations ?? []
  const photos = universe.images ?? []
  const layout = universe.layout ?? UniverseLayout.MASONRY

  const addDecoration = (decoration) => {
    if (decorations.length >= Limits.DECORATIONS_MAX) {
      setSaveError(`A universe holds up to ${Limits.DECORATIONS_MAX} decorations.`)
      return
    }
    const next = [...decorations, { x: 34, y: 12, ...decoration }]
    setDraft(next)
    setSelected(next.length - 1)
  }

  const saveSong = (changes, onDone) =>
    update.mutate(changes, {
      onSuccess: () => onDone?.(),
      onError: () => setSaveError('The song could not be saved. Check the link and try again.'),
    })

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col gap-[18px] px-6 pt-[max(env(safe-area-inset-top),24px)] pb-28 md:max-w-[768px]">
      <div className="flex items-center justify-between pt-10">
        <Logo size={20} />
        <TopActions />
      </div>

      <header className="flex flex-col gap-1">
        <span className="label-mono">004 — Editing</span>
        <h1 className="text-display font-bold">Edit universe</h1>
        <p className="font-serif text-subline text-secondary">Drag photos to reorder them.</p>
      </header>

      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="label-mono">Layout · how others see it</span>
          <span className="label-mono text-[9px] text-accent">See all 10</span>
        </div>
        <LayoutPicker value={layout} photos={photos} universe={{ ...universe, decorations }} onChange={(next) => update.mutate({ layout: next })} />
      </section>

      <div className="grid grid-cols-4 gap-3">
        {tools.map(({ id, label, Icon }) => {
          const open = sheet === id
          return (
            <button key={id} type="button" onClick={() => setSheet(id)} className="press group flex flex-col items-center gap-2">
              <span
                className={cn(
                  'grid size-[58px] place-items-center rounded-full bg-paper shadow-raised transition-[box-shadow,color] duration-220 ease-ui group-active:shadow-pressed',
                  open ? 'text-accent shadow-pressed' : 'text-ink',
                )}
              >
                <Icon className="size-[22px]" strokeWidth={1.5} />
              </span>
              <span className={cn('label-mono text-[8.5px]', open && 'text-ink')}>{label}</span>
            </button>
          )
        })}
      </div>

      <SongPill
        key={universe.spotify_track_id ?? 'none'}
        trackId={universe.spotify_track_id}
        title={universe.spotify_track_title}
        cover={universe.spotify_track_cover_url}
        empty="Universe soundtrack"
        onEmptyClick={() => setSheet('audio')}
      />

      {saveError && (
        <p role="alert" className="flex items-center gap-2 text-[13px] text-ink">
          <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
          {saveError}
        </p>
      )}

      <section
        aria-label="Your universe"
        className="@container relative mt-1 min-h-64 md:ml-[calc(50%-min(640px,50vw-32px))] md:w-[min(1280px,100vw-64px)]"
        onPointerDown={(event) => {
          if (!event.target.closest('[aria-label^="Decoration"], [aria-label="Remove decoration"]')) setSelected(null)
        }}
      >
        {photos.length ? (
          <PhotoBoard fill layout={layout} photos={photos} onReorder={(next) => reorder.mutate(next)} />
        ) : (
          <button type="button" onClick={() => setSheet('photos')} className="press grid h-64 w-full place-items-center rounded-[22px] bg-paper text-sm font-semibold text-secondary shadow-inset">
            + Add your first photos
          </button>
        )}
        <DecorationEditor
          decorations={decorations}
          selected={selected}
          onSelect={setSelected}
          onChange={(index, changes) => setDraft(decorations.map((d, i) => (i === index ? { ...d, ...changes } : d)))}
          onRemove={(index) => {
            setDraft(decorations.filter((_, i) => i !== index))
            setSelected(null)
          }}
        />
      </section>

      <AnimatePresence>
        {tabsOpen ? (
          <motion.div key="tabs" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
            <TabBar />
            <button
              type="button"
              aria-label="Hide tabs"
              onClick={() => setTabsOpen(false)}
              className="fixed inset-x-0 bottom-[calc(max(env(safe-area-inset-bottom),20px)+90px)] z-30 mx-auto grid size-8 place-items-center rounded-full bg-paper text-secondary shadow-subtle xl:hidden"
            >
              <ChevronUp className="size-4 rotate-180" strokeWidth={1.8} />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="handle"
            type="button"
            onClick={() => setTabsOpen(true)}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="press fixed inset-x-0 bottom-[max(env(safe-area-inset-bottom),24px)] z-30 mx-auto flex w-fit items-center gap-2 rounded-full bg-paper px-5 py-2.5 shadow-float xl:hidden"
          >
            <ChevronUp className="size-4 text-ink" strokeWidth={1.8} />
            <span className="label-mono text-[9px] text-ink">Tabs</span>
          </motion.button>
        )}
      </AnimatePresence>

      <PhotosSheet
        open={sheet === 'photos'}
        onOpenChange={(open) => setSheet(open ? 'photos' : null)}
        photos={photos}
        onRemove={(id) => removePhoto.mutate(id)}
        pending={pending}
        error={uploadError}
        onFiles={upload}
      />
      <SongSheet open={sheet === 'audio'} onOpenChange={(open) => setSheet(open ? 'audio' : null)} universe={universe} onSave={saveSong} saving={update.isPending} />
      <StickersSheet open={sheet === 'stickers'} onOpenChange={(open) => setSheet(open ? 'stickers' : null)} onPick={addDecoration} />
      <TextSheet open={sheet === 'text'} onOpenChange={(open) => setSheet(open ? 'text' : null)} onPlace={addDecoration} />
    </main>
  )
}
