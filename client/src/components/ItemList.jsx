import { useState } from 'react'
import { createPortal } from 'react-dom'
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import ItemRow, { ItemRowOverlay } from './ItemRow'

const modifiers = [restrictToVerticalAxis]

// dnd-kit reports a drag as (draggedId, droppedOnId) — a position, not a
// move. onMove needs the neighbours the item should land between, so this
// is the one place that translates an index-based drop into prev/next ids.
// Everything past this point is server-side arithmetic (see useItems.moveItem).
export default function ItemList({ items, newItemId, onToggle, onDelete, onMove }) {
  const [activeId, setActiveId] = useState(null)
  const activeItem = items.find(i => i.id === activeId)

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
    setActiveId(null)
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
      {/* autoScroll defaults to true and picks up the page's own scroll,
          which is the only scrollable ancestor here — nothing to configure. */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={modifiers}
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
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
        {/* Portaled to body: this card has backdrop-blur (a backdrop-filter),
            which creates a containing block for position:fixed descendants.
            DragOverlay is fixed-positioned, so left inline it renders offset
            from the pointer instead of tracking it. React context still
            reaches across the portal, so DndContext/useDndContext are unaffected. */}
        {createPortal(
          <DragOverlay modifiers={modifiers}>
            {activeItem && <ItemRowOverlay item={activeItem} />}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  )
}
