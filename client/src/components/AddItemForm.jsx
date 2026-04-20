import { useState } from 'react'

export default function AddItemForm({ onAdd }) {
  const [value, setValue] = useState('')

  const handleAdd = () => {
    if (!value.trim()) return
    onAdd(value.trim())
    setValue('')
  }

  return (
    <div className="bg-white border border-amber-100 shadow-sm rounded-2xl px-4 py-3 sm:px-5 sm:py-4 mb-4">
      <div className="flex gap-2">
        <input
          className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 text-base"
          placeholder="Add an item..."
          value={value}
          autoComplete="off"
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button
          className="px-5 py-3 rounded-xl bg-amber-400 text-white font-semibold hover:bg-amber-500 active:bg-amber-600 transition shadow-sm text-base whitespace-nowrap"
          onClick={handleAdd}
        >
          Add
        </button>
      </div>
    </div>
  )
}
