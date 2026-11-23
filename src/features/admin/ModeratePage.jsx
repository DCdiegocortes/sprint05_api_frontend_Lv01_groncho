import { useCallback, useState } from 'react'
import Loader from '@/components/Loader.jsx'
import { loadingLines } from '@/lib/loadingLines.js'
import { useParams } from 'react-router'
import PageHeader from '@/components/PageHeader.jsx'
import Toast from '@/components/Toast.jsx'
import { Segmented } from '@/components/ui/segmented.jsx'
import { useMediaQuery } from '@/hooks/useMediaQuery.js'
import { BackLink } from './AdminBits.jsx'
import ModeratePhotos from './ModeratePhotos.jsx'
import ModeratePieces from './ModeratePieces.jsx'
import { useUser, useUserItems } from './useAdmin.js'

const Tab = Object.freeze({ UNIVERSE: 'universe', PIECES: 'pieces' })

const sublines = {
  [Tab.UNIVERSE]: { touch: 'Long press a photo to select several.', fine: 'Hover a photo to remove it. Shift click to select several.' },
  [Tab.PIECES]: { touch: 'A whole piece or single photos.', fine: 'Remove a whole piece or single photos. Hover a photo to act on it.' },
}

export default function ModeratePage() {
  const { userId } = useParams()
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)')
  const { data: user, isPending, isError } = useUser(userId)
  const { data: items } = useUserItems(userId)
  const [tab, setTab] = useState(Tab.UNIVERSE)
  const [toast, setToast] = useState(null)
  const clearToast = useCallback((done) => setToast((current) => (done && current !== done ? current : null)), [])

  const back = <BackLink to={`/admin/users/${userId}`}>{user?.name ?? 'User'}</BackLink>
  const photoCount = user?.universe?.images?.length ?? 0

  return (
    <div className="flex flex-col gap-7 xl:gap-10">
      <div className="flex flex-col gap-7 xl:hidden">{back}</div>
      <PageHeader label={user ? `008 — Admin · ${user.name}` : '008 — Admin'} title="Moderate" subline={sublines[tab][fine ? 'fine' : 'touch']} />
      <div className="flex items-center justify-between gap-5 xl:-mb-2">
        <span className="hidden xl:flex">{back}</span>
        <Segmented
          label="What to moderate"
          fit
          className="w-full xl:w-[306px]"
          value={tab}
          onChange={setTab}
          options={[
            { value: Tab.UNIVERSE, label: `Universe · ${photoCount}` },
            { value: Tab.PIECES, label: `Pieces · ${items?.length ?? 0}` },
          ]}
        />
      </div>
      {isPending && <Loader line={loadingLines.admin} />}
      {isError && <p className="text-sm text-secondary">This user could not be loaded.</p>}
      {user && tab === Tab.UNIVERSE && <ModeratePhotos user={user} fine={fine} notify={setToast} />}
      {user && tab === Tab.PIECES && <ModeratePieces userId={userId} fine={fine} notify={setToast} />}
      <Toast toast={toast} onDone={clearToast} duration={toast?.duration ?? 3200} />
    </div>
  )
}
