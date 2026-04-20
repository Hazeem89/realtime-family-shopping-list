export default function Header({ familyName, username, memberCount, onSignOut }) {
  return (
    <div className="bg-white border border-amber-100 shadow-sm rounded-2xl px-4 py-3 sm:px-5 sm:py-4 mb-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-stone-800">🛒 Family Shopping List</h1>
          <p className="text-xs text-stone-400">{familyName}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 justify-between">
          <span className="text-amber-600 text-xs sm:text-sm bg-amber-50 border border-amber-200 px-3 py-1 rounded-full whitespace-nowrap">
            👥 {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
          <span className="text-stone-400 text-xs whitespace-nowrap">
            {username} •{' '}
            <button
              className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-red-500 transition px-2 py-1 rounded-md hover:bg-red-50 active:bg-red-100 min-h-[44px] sm:min-h-0"
              onClick={onSignOut}
            >
              Sign out
            </button>
          </span>
        </div>
      </div>
    </div>
  )
}
