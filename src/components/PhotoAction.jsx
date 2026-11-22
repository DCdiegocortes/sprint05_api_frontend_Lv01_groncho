import { Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const icons = { close: X, delete: Trash2 }

export default function PhotoAction({ icon, label, onClick, className, size = 20 }) {
  const Icon = icons[icon]
  return (
    <button type="button" aria-label={label} onClick={onClick} className={cn('photo-action grid place-items-center', className)}>
      <Icon style={{ width: size, height: size }} strokeWidth={icon === 'close' ? 2.2 : 1.8} />
    </button>
  )
}
