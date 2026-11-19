import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Image, Music, Sticker, Type } from 'lucide-react'
import Logo from '@/components/Logo.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Limits, UniverseLayout } from '@/lib/constants.js'
import LayoutPicker from '../LayoutPicker.jsx'
import SongPill from '../SongPill.jsx'
import UniversePreview from '../UniversePreview.jsx'
import { useDeletePhoto, useMyUniverse, useReorderPhotos, useUpdateUniverse } from '../useMyUniverse.js'
import { usePhotoUpload } from '../usePhotoUpload.js'
import DecorationEditor from './DecorationEditor.jsx'
import PhotoGrid from './PhotoGrid.jsx'
import PhotosSheet from './PhotosSheet.jsx'
import SongSheet from './SongSheet.jsx'
import StickersSheet from './StickersSheet.jsx'
import TextSheet from './TextSheet.jsx'

const tools = [
  { id: 'photos', label: 'Photos', Icon: Image },
  { id: 'audio', label: 'Audio', Icon: Music },
  { id: 'stickers', label: 'Stickers', Icon: Sticker },
  { id: 'text', label: 'Text', Icon: Type },
]

export default function EditUniversePage() {
  const navigate = useNavigate()
  const { data: universe } = useMyUniverse()
  const update = useUpdateUniverse(universe?.id)
  const reorder = useReorderPhotos(universe?.id)
  const removePhoto = useDeletePhoto(universe?.id)
  const { pending, error: uploadError, upload } = usePhotoUpload(universe?.id)
  const [sheet, setSheet] = useState(null)
  const [draft, setDraft] = useState(null)
  const [selected, setSelected] = useState(null)
  const [saveError, setSaveError] = useState('')

  if (!universe) return null

  const decorations = draft ?? universe.decorations ?? []
  const photos = universe.images ?? []
  const layout = universe.layout ?? UniverseLayout.MASONRY

  const editDecorations = (next) => setDraft(next)

  const addDecoration = (decoration) => {
    if (decorations.length >= Limits.DECORATIONS_MAX) {
      setSaveError(`A universe holds up to ${Limits.DECORATIONS_MAX} decorations.`)
      return
    }
    const next = [...decorations, { x: 34, y: 12, ...decoration }]
    editDecorations(next)
    setSelected(next.length - 1)
  }

  const done = () => {
    if (draft === null) return navigate('/universe')
    update.mutate(
      { decorations: draft },
      {
        onSuccess: () => navigate('/universe'),
        onError: () => setSaveError('Your decorations could not be saved. Try again.'),
      },
    )
  }

  const saveSong = (changes, onDone) =>
    update.mutate(changes, {
      onSuccess: () => onDone?.(),
      onError: () => setSaveError('The song could not be saved. Check the link and try again.'),
    })

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col gap-[18px] px-6 pt-[max(env(safe-area-inset-top),24px)] pb-[max(env(safe-area-inset-bottom),32px)] md:max-w-[768px]">
      <div className="flex items-center justify-between pt-10">
        <Logo size={20} />
        <Button size="sm" onClick={done} disabled={update.isPending}>
          {update.isPending ? 'Saving' : 'Done'}
        </Button>
      </div>

      <header className="flex flex-col gap-1">
        <span className="label-mono">004 — Editing</span>
        <h1 className="text-display font-bold">Edit universe</h1>
        <p className="font-serif text-subline text-secondary">Drag photos to reorder them.</p>
      </header>

      <section className="flex flex-col gap-2.5">
        <span className="label-mono">Layout · how others see it</span>
        <LayoutPicker value={layout} onChange={(next) => update.mutate({ layout: next })} />
      </section>

      <div className="grid grid-cols-4 gap-3">
        {tools.map(({ id, label, Icon }) => (
          <button key={id} type="button" onClick={() => setSheet(id)} className="press flex flex-col items-center gap-2">
            <span className="grid size-[58px] place-items-center rounded-full bg-paper text-ink shadow-raised">
              <Icon className="size-[22px]" strokeWidth={1.5} />
            </span>
            <span className="label-mono text-[8.5px]">{label}</span>
          </button>
        ))}
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

      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="label-mono">Moodboard · drag decorations</span>
          {draft !== null && <span className="label-mono text-[9px] text-accent">Unsaved</span>}
        </div>
        <div className="rounded-[26px] bg-card p-3 shadow-raised">
        <div className="@container relative min-h-40">
          {photos.length ? (
            <UniversePreview layout={layout} photos={photos} />
          ) : (
            <button type="button" onClick={() => setSheet('photos')} className="press grid h-40 w-full place-items-center rounded-2xl bg-paper text-sm font-semibold text-secondary shadow-inset">
              + Add your first photos
            </button>
          )}
          <DecorationEditor
            decorations={decorations}
            selected={selected}
            onSelect={setSelected}
            onChange={(index, changes) => editDecorations(decorations.map((d, i) => (i === index ? { ...d, ...changes } : d)))}
            onRemove={(index) => {
              editDecorations(decorations.filter((_, i) => i !== index))
              setSelected(null)
            }}
          />
        </div>
        </div>
      </section>

      {photos.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <span className="label-mono">Photos · hold and drag to reorder</span>
          <PhotoGrid photos={photos} onReorder={(next) => reorder.mutate(next)} onRemove={(id) => removePhoto.mutate(id)} />
        </section>
      )}

      <PhotosSheet open={sheet === 'photos'} onOpenChange={(open) => setSheet(open ? 'photos' : null)} pending={pending} error={uploadError} onFiles={upload} />
      <SongSheet open={sheet === 'audio'} onOpenChange={(open) => setSheet(open ? 'audio' : null)} universe={universe} onSave={saveSong} saving={update.isPending} />
      <StickersSheet open={sheet === 'stickers'} onOpenChange={(open) => setSheet(open ? 'stickers' : null)} onPick={addDecoration} />
      <TextSheet open={sheet === 'text'} onOpenChange={(open) => setSheet(open ? 'text' : null)} onPlace={addDecoration} />
    </main>
  )
}
