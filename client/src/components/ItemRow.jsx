import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Shared by the sortable row and its DragOverlay preview. The overlay copy
// must not call useSortable itself — that would register the same item id
// as sortable twice while it's mid-drag.
function ItemRowContent({
  item,
  isNew,
  onToggle,
  onDelete,
  liRef,
  style,
  className = "",
  dragHandleProps,
}) {
  return (
    <li
      ref={liRef}
      style={style}
      className={`flex items-center gap-3 px-2 py-2 sm:px-3 rounded-xl transition ${isNew ? "item-highlight" : "hover:bg-white/40 active:bg-white/60"} ${className}`}
    >
      <button
        onClick={() => onDelete(item.id)}
        className="flex items-center justify-center min-w-[44px] min-h-[44px] text-stone-300 hover:text-red-400 active:text-red-500 transition rounded-xl"
        aria-label="Delete item"
      >
        ⛔
      </button>
      <div
        {...dragHandleProps}
        className="flex items-center gap-1 flex-1 touch-none cursor-grab active:cursor-grabbing"
      >
        <div
          className={`flex justify-between items-center flex-1 min-w-0 text-sm mr-2 sm:text-base ${
            item.bought ? "line-through text-stone-300" : "text-stone-700"
          }`}
        >
          <span className="truncate">{item.name}</span>

          <span className="text-stone-400 text-xs ml-4 shrink-0">
            by {item.addedBy}
          </span>
        </div>

        <span
          className="flex items-center justify-center w-8 min-h-[44px] text-stone-300 hover:text-stone-400"
          aria-hidden="true"
        >
          ☰
        </span>
      </div>
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
    </li>
  );
}

export default function ItemRow({ item, isNew, onToggle, onDelete }) {
  const {
    setNodeRef,
    transform,
    transition,
    attributes,
    listeners,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ItemRowContent
      item={item}
      isNew={isNew}
      onToggle={onToggle}
      onDelete={onDelete}
      liRef={setNodeRef}
      style={style}
      className={isDragging ? "opacity-40 bg-gray-400 shadow-2xl scale-[1.03]" : ""}
      dragHandleProps={{ ...attributes, ...listeners }}
    />
  );
}

// The floating copy dnd-kit renders under the pointer while dragging.
// Non-interactive — the real row underneath still owns toggle/delete.
export function ItemRowOverlay({ item }) {
  return (
    <ul className="list-none">
      <ItemRowContent
        item={item}
        onToggle={() => {}}
        onDelete={() => {}}
        className="bg-gray-400 shadow-2xl scale-[1.03] opacity-90"
      />
    </ul>
  );
}
