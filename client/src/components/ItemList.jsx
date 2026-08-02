import { DndContext, closestCenter, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import ItemRow from './ItemRow'

// dnd-kit reports a drag as (draggedId, droppedOnId) — a position, not a
// move. onMove needs the neighbours the item should land between, so this
// is the one place that translates an index-based drop into prev/next ids.
// Everything past this point is server-side arithmetic (see useItems.moveItem).
export default function ItemList({ items, newItemId, onToggle, onDelete, onMove }) {
  // Not PointerSensor alongside TouchSensor — PointerSensor already handles
  // touch, and registering both double-fires on touch devices. A distance
  // tolerance (rather than a long-press delay) is enough to avoid accidental
  // drags because the handle in ItemRow is the only drag activator.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex(i => i.id === active.id)
    const newIndex = items.findIndex(i => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(items, oldIndex, newIndex)
    const movedIndex = reordered.findIndex(i => i.id === active.id)
    const prevId = reordered[movedIndex - 1]?.id ?? null
    const nextId = reordered[movedIndex + 1]?.id ?? null

    onMove(active.id, prevId, nextId)
  }

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl px-4 py-3 sm:px-5 sm:py-4 mb-4">
      <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 sm:mb-3">
        Shopping List
      </h2>
      {items.length === 0 && (
        <p className="text-stone-400 text-center py-6 text-sm">No items yet. Add something!</p>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-1">
            {items.map(item => (
              <ItemRow
                key={item.id}
                item={item}
                isNew={item.id === newItemId}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  )
}
