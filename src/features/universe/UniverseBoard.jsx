import { UniverseLayout } from '@/lib/constants.js'
import DecorationLayer from './DecorationLayer.jsx'
import UniversePreview from './UniversePreview.jsx'

export default function UniverseBoard({ universe, emptyState = null, fill = false }) {
  const photos = universe?.images ?? []

  return (
    <div className="@container relative">
      {photos.length ? <UniversePreview layout={universe?.layout ?? UniverseLayout.MASONRY} photos={photos} fill={fill} /> : emptyState}
      <DecorationLayer decorations={universe?.decorations ?? []} />
    </div>
  )
}
