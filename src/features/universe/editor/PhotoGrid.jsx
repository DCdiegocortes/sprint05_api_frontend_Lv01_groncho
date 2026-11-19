import { closestCenter, DndContext, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

function SortablePhoto({ photo, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('relative aspect-[3/4] touch-none', isDragging && 'z-10 scale-105')}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="block size-full cursor-grab overflow-hidden rounded-2xl bg-plate shadow-subtle active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <img src={photo.url} alt="" draggable={false} className="size-full object-cover" />
      </button>
      <button
        type="button"
        aria-label="Remove photo"
        onClick={() => onRemove(photo.id)}
        className="press absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full bg-card text-ink shadow-subtle"
      >
        <X className="size-3.5" strokeWidth={1.8} />
      </button>
    </li>
  )
}

export default function PhotoGrid({ photos, onReorder, onRemove }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const from = photos.findIndex((photo) => photo.id === active.id)
    const to = photos.findIndex((photo) => photo.id === over.id)
    onReorder(arrayMove(photos, from, to))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={photos.map((photo) => photo.id)} strategy={rectSortingStrategy}>
        <ul className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <SortablePhoto key={photo.id} photo={photo} onRemove={onRemove} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
