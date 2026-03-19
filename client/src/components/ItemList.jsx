import ItemRow from './ItemRow'

export default function ItemList({ items, newItemId, onToggle, onDelete }) {
  return (
    <div className="bg-white border border-amber-100 shadow-sm rounded-2xl px-4 py-3 sm:px-5 sm:py-4 mb-4">
      <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 sm:mb-3">
        Shopping List
      </h2>
      {items.length === 0 && (
        <p className="text-stone-400 text-center py-6 text-sm">No items yet. Add something!</p>
      )}
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
    </div>
  )
}
