import { ImagePlus } from 'lucide-react'
import EmptyWall from '@/components/EmptyWall.jsx'

export default function EmptyPoster() {
  return (
    <EmptyWall
      icon={ImagePlus}
      line="A blank wall. Hang your first photo."
      action="Add photos"
      to="/universe/edit"
      state={{ tool: 'photos' }}
      label="Add photos to your universe"
    />
  )
}
