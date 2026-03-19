import { useState } from 'react'

export default function ActivityFeed({ activity }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white border border-amber-100 shadow-sm rounded-2xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-4 text-left hover:bg-orange-50 active:bg-orange-100 transition min-h-[52px]"
      >
        <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
          Activity {activity.length > 0 && <span className="ml-1 text-amber-400">({activity.length})</span>}
        </span>
        <span className="text-stone-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-4">
          {activity.length === 0 && (
            <p className="text-stone-400 text-center py-2 text-sm">No activity yet</p>
          )}
          <ul className="space-y-2">
            {activity.map((msg, i) => (
              <li key={i} className="text-sm text-stone-500 border-l-2 border-amber-300 pl-3 py-0.5">
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
