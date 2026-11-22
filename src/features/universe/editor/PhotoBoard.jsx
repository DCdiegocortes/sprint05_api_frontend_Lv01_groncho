import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import { cn } from '@/lib/utils'
import { baseId } from '../boards/motion.js'
import { PhotoFrameContext } from '../photoFrame.js'
import UniversePreview from '../UniversePreview.jsx'

function SortableFrame({ photo, dragId, className, style, children }) {
  const drag = useDraggable({ id: dragId, disabled: Boolean(photo.uploading) })
  const drop = useDroppable({ id: dragId })
  const setRef = (node) => {
    drag.setNodeRef(node)
    drop.setNodeRef(node)
  }

  return (
    <div
      ref={setRef}
      className={cn(
        className,
        'touch-manipulation select-none',
        drag.isDragging && 'opacity-30',
        drop.isOver && !drag.isDragging && 'ring-2 ring-accent ring-offset-2 ring-offset-paper',
      )}
      style={style}
      {...drag.attributes}
      {...drag.listeners}
    >
      {children}
    </div>
  )
}

export default function PhotoBoard({ layout, photos, onReorder, fill = false }) {
  const [active, setActive] = useState(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 260, tolerance: 6 } }),
    useSensor(KeyboardSensor),
  )

  const end = ({ active: dragged, over }) => {
    setActive(null)
    if (!over) return
    const from = photos.findIndex((photo) => String(photo.id) === baseId(dragged.id))
    const to = photos.findIndex((photo) => String(photo.id) === baseId(over.id))
    if (from < 0 || to < 0 || from === to) return
    const next = [...photos]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onReorder(next)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={({ active: dragged }) => setActive(photos.find((photo) => String(photo.id) === baseId(dragged.id)))}
      onDragCancel={() => setActive(null)}
      onDragEnd={end}
    >
      <PhotoFrameContext.Provider value={SortableFrame}>
        <UniversePreview layout={layout} photos={photos} fill={fill} />
      </PhotoFrameContext.Provider>
      <DragOverlay modifiers={[snapCenterToCursor]} dropAnimation={null}>
        {active ? (
          <img
            src={active.url}
            alt=""
            className="pointer-events-none w-32 rotate-3 rounded-[10px] object-cover shadow-float ring-2 ring-white"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
