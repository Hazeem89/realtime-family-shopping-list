import { useState } from 'react'

export default function JoinScreen({ onJoin }) {
  const [input, setInput] = useState('')

  const handleJoin = () => {
    if (!input.trim()) return
    onJoin(input.trim())
  }

  return (
    <div className="min-h-screen bg-orange-100 flex items-center justify-center px-3 sm:px-4">
      <div className="bg-white border border-amber-100 shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-stone-800 mb-2">
          🛒 Family Shopping List
        </h1>
        <p className="text-stone-400 text-center mb-6 text-sm sm:text-base">Enter your name to join</p>
        <input
          className="w-full px-4 py-3 mb-4 rounded-xl bg-orange-50 border border-orange-200 text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 text-base"
          placeholder="Your name..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
          autoFocus
        />
        <button
          className="w-full py-3 rounded-xl bg-amber-400 text-white font-semibold hover:bg-amber-500 active:bg-amber-600 transition shadow-sm text-base"
          onClick={handleJoin}
        >
          Join
        </button>
      </div>
    </div>
  )
}
