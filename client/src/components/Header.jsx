import { useState } from 'react'

export default function Header({ familyName, username, memberCount, inviteCode, isAdmin, onSignOut }) {
  const [copied, setCopied] = useState(false)

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl px-4 py-3 sm:px-5 sm:py-4 mb-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Family Shopping List" className="h-8 w-auto" />
          </div>
          <p className="text-xs text-stone-400">{familyName}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 justify-between">
          <span className="text-amber-600 text-xs sm:text-sm bg-amber-50 border border-amber-200 px-3 py-1 rounded-full whitespace-nowrap">
            🟢 {memberCount} online
          </span>
          <div className="flex items-center gap-2">
            <span className="text-stone-400 text-xs whitespace-nowrap">{username}</span>
            <button
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 hover:border-red-300 active:bg-red-200 transition whitespace-nowrap"
              onClick={onSignOut}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {isAdmin && inviteCode && (
        <div className="mt-3 pt-3 border-t border-amber-50 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-stone-400 mb-0.5">Invite code</p>
            <p className="text-sm font-mono font-semibold text-stone-600 tracking-widest uppercase">{inviteCode}</p>
          </div>
          <button
            onClick={copyInviteCode}
            className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100 transition whitespace-nowrap"
          >
            {copied ? '✓ Copied!' : 'Copy code'}
          </button>
        </div>
      )}
    </div>
  )
}
