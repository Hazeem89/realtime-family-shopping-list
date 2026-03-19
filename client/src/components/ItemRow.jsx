export default function ItemRow({ item, isNew, onToggle, onDelete }) {
  return (
    <li className={`flex items-center gap-3 px-2 py-2 sm:px-3 rounded-xl transition ${isNew ? 'item-highlight' : 'hover:bg-orange-50 active:bg-orange-100'}`}>
      <button
        onClick={() => onToggle(item)}
        className="flex items-center justify-center min-w-[44px] min-h-[44px]"
        aria-label={item.bought ? 'Mark as not bought' : 'Mark as bought'}
      >
        <input
          type="checkbox"
          checked={item.bought}
          onChange={() => {}}
          className="w-5 h-5 cursor-pointer accent-amber-400 pointer-events-none"
        />
      </button>
      <span className={`flex-1 min-w-0 text-sm sm:text-base ${item.bought ? 'line-through text-stone-300' : 'text-stone-700'}`}>
        {item.name}
        <span className="text-stone-400 text-xs ml-4">by {item.addedBy}</span>
      </span>
      <button
        onClick={() => onDelete(item.id)}
        className="flex items-center justify-center min-w-[44px] min-h-[44px] text-stone-300 hover:text-red-400 active:text-red-500 transition rounded-xl"
        aria-label="Delete item"
      >
        ⛔
      </button>
    </li>
  )
}
