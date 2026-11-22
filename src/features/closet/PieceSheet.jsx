import { useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import PhotoAction from '@/components/PhotoAction.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Segmented } from '@/components/ui/segmented.jsx'
import { Sheet, SheetContent } from '@/components/ui/sheet.jsx'
import { checkPhotos } from '@/features/universe/usePhotoUpload.js'
import { ItemCondition, ItemType, OfferType } from '@/lib/constants.js'
import PhotoViewer from './PhotoViewer.jsx'
import { conditionOptions, offerOptions, typeOptions } from './pieces.js'
import { useSavePiece } from './useCloset.js'

const SIZE_MAX = 20
const NAME_MAX = 255

function Thumb({ photo, onOpen, onRemove }) {
  return (
    <li className="relative size-[84px] shrink-0 transition-transform duration-220 ease-ui hover:z-10 hover:scale-150">
      <button type="button" aria-label="Open photo" onClick={onOpen} className="block size-full overflow-hidden rounded-[18px] shadow-subtle">
        <img src={photo.url} alt="" className="size-full object-cover" />
      </button>
      <PhotoAction icon="delete" label="Remove photo" size={16} onClick={onRemove} className="absolute top-1 right-1 size-8" />
    </li>
  )
}

function PieceForm({ piece, onDone }) {
  const { save, saving, progress } = useSavePiece()
  const [name, setName] = useState(piece?.name ?? '')
  const [size, setSize] = useState(piece?.size ?? '')
  const [type, setType] = useState(piece?.type ?? ItemType.CLOTHES)
  const [condition, setCondition] = useState(piece?.item_condition ?? ItemCondition.GOOD)
  const [offer, setOffer] = useState(piece?.offer_type ?? OfferType.TRADE)
  const [description, setDescription] = useState(piece?.description ?? '')
  const [kept, setKept] = useState(() => (piece?.images ?? []).map((image) => ({ key: `image-${image.id}`, id: image.id, url: image.url })))
  const [added, setAdded] = useState([])
  const [errors, setErrors] = useState({})
  const [viewing, setViewing] = useState(null)
  const input = useRef(null)
  const urls = useRef([])

  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), [])

  const photos = [...kept, ...added]

  const addFiles = (fileList) => {
    const files = Array.from(fileList ?? [])
    if (!files.length) return
    const problem = checkPhotos(files)
    if (problem) {
      setErrors((current) => ({ ...current, photos: problem }))
      return
    }
    const next = files.map((file, index) => {
      const url = URL.createObjectURL(file)
      urls.current.push(url)
      return { key: `file-${Date.now()}-${index}`, file, url }
    })
    setAdded((current) => [...current, ...next])
    setErrors((current) => ({ ...current, photos: undefined }))
  }

  const remove = (key) => {
    setKept((current) => current.filter((photo) => photo.key !== key))
    setAdded((current) => current.filter((photo) => photo.key !== key))
  }

  const removeViewed = () => {
    const photo = photos[viewing]
    if (!photo) return
    remove(photo.key)
    if (photos.length <= 1) setViewing(null)
    else setViewing(Math.min(viewing, photos.length - 2))
  }

  const submit = async (event) => {
    event.preventDefault()
    const found = {}
    if (!name.trim()) found.name = 'Give your piece a name.'
    else if (name.trim().length > NAME_MAX) found.name = `Keep the name under ${NAME_MAX} characters.`
    if (size.length > SIZE_MAX) found.size = `Keep the size under ${SIZE_MAX} characters.`
    setErrors(found)
    if (Object.keys(found).length) return

    const fields = {
      name: name.trim(),
      size: size.trim() || null,
      type,
      item_condition: condition,
      offer_type: offer,
      description: description.trim() || null,
    }
    const keptIds = new Set(kept.map((photo) => photo.id))
    const removedImageIds = (piece?.images ?? []).map((image) => image.id).filter((id) => !keptIds.has(id))
    try {
      await save({ piece, fields, files: added.map((photo) => photo.file), removedImageIds })
      onDone()
    } catch (error) {
      const fieldErrors = error?.response?.status === 422 ? error.response.data?.errors : null
      if (fieldErrors) setErrors(Object.fromEntries(Object.entries(fieldErrors).map(([field, messages]) => [field, messages[0]])))
      else setErrors({ root: error?.response?.data?.message ?? 'Your piece could not be saved. Try again.' })
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-2.5">
        <span className="label-mono font-medium">Photos · up to 10 MB each</span>
        <ul className="no-scrollbar -mx-2 flex gap-2.5 overflow-x-auto px-2 py-2 md:overflow-visible">
          <li className="shrink-0">
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="press flex size-[84px] flex-col items-center justify-center gap-1.5 rounded-[18px] bg-paper text-ink shadow-inset"
            >
              <Plus className="size-[18px]" strokeWidth={1.8} />
              <span className="label-mono">Photo</span>
            </button>
            <input
              ref={input}
              type="file"
              accept="image/*"
              multiple
              hidden
              data-testid="piece-photo-input"
              onChange={(event) => {
                addFiles(event.target.files)
                event.target.value = ''
              }}
            />
          </li>
          {photos.map((photo, index) => (
            <Thumb key={photo.key} photo={photo} onOpen={() => setViewing(index)} onRemove={() => remove(photo.key)} />
          ))}
        </ul>
        {errors.photos && <p className="text-[13px] text-secondary">{errors.photos}</p>}
      </div>

      <Input label="Name" value={name} error={errors.name} placeholder="Silver moto boots" onChange={(event) => setName(event.target.value)} />

      <div className="grid gap-[18px] sm:grid-cols-2 sm:gap-3">
        <Input label="Size" value={size} error={errors.size} placeholder="42 EU" onChange={(event) => setSize(event.target.value)} />
        <div className="flex flex-col gap-2">
          <span className="label-mono font-medium">Type</span>
          <Segmented fit label="Type" options={typeOptions} value={type} onChange={setType} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="label-mono font-medium">Condition</span>
        <Segmented label="Condition" options={conditionOptions} value={condition} onChange={setCondition} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="label-mono font-medium">Offer it as</span>
        <Segmented label="Offer it as" options={offerOptions} value={offer} onChange={setOffer} />
      </div>

      <Input
        label="Description · optional"
        value={description}
        error={errors.description}
        placeholder="A line about wear, fit or story"
        onChange={(event) => setDescription(event.target.value)}
      />

      {errors.root && (
        <p role="alert" className="flex items-center gap-2 text-[13px] text-ink">
          <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
          {errors.root}
        </p>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? (added.length ? `Uploading ${Math.round(progress * 100)}%` : 'Saving') : piece ? 'Save changes' : 'Add piece'}
      </Button>

      <PhotoViewer
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
        photos={photos}
        index={viewing ?? 0}
        onIndexChange={setViewing}
        title={name.trim() || 'New piece'}
        footer={
          <Button className="w-full max-w-[392px]" onClick={removeViewed}>
            Remove this photo
          </Button>
        }
      />
    </form>
  )
}

export default function PieceSheet({ open, onOpenChange, piece = null }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent serif title={piece ? 'Edit piece' : 'Add a piece'} subtitle="Photos first, the rest takes a minute.">
        <PieceForm piece={piece} onDone={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  )
}
