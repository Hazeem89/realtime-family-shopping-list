import { useState } from 'react'

export default function CreateFamily({ onCreate, onSwitch }) {
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)
    setLoading(true)
    const err = await onCreate(name.trim())
    if (err) setError(err.message)
    setLoading(false)
  }

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl px-6 py-8 w-full">
      <h2 className="text-xl font-bold text-stone-700 mb-2">Create a family</h2>
      <p className="text-stone-400 text-sm mb-6">Start a new shopping list for your family.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Family name (e.g. The Johnsons)"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          autoComplete="off"
          className="px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 rounded-xl bg-amber-400 text-white font-semibold hover:bg-amber-500 active:bg-amber-600 transition shadow-sm disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create family'}
        </button>
      </form>
      <p className="text-center text-stone-400 text-sm mt-6">
        Have an invite code?{' '}
        <button onClick={onSwitch} className="text-amber-500 font-semibold hover:underline">
          Join a family
        </button>
      </p>
    </div>
  )
}
