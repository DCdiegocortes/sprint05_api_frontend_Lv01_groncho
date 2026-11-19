import { UniverseLayout } from '@/lib/constants.js'
import DecorationLayer from './DecorationLayer.jsx'
import UniversePreview from './UniversePreview.jsx'

export default function UniverseBoard({ universe, emptyState = null }) {
  const photos = universe?.images ?? []

  return (
    <div className="@container relative">
      {photos.length ? <UniversePreview layout={universe?.layout ?? UniverseLayout.MASONRY} photos={photos} /> : emptyState}
      <DecorationLayer decorations={universe?.decorations ?? []} />
    </div>
  )
}
