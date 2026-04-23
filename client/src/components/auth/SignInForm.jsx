import { useState } from 'react'

export default function SignInForm({ onSignIn, onSwitch }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = await onSignIn(email, password)
    if (err) setError(err.message)
    setLoading(false)
  }

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl px-6 py-8 w-full max-w-sm mx-auto">
      <h2 className="text-2xl font-bold text-stone-700 mb-6 text-center">Welcome back</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 rounded-xl bg-amber-400 text-white font-semibold hover:bg-amber-500 active:bg-amber-600 transition shadow-sm disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="text-center text-stone-400 text-sm mt-6">
        No account?{' '}
        <button onClick={onSwitch} className="text-amber-500 font-semibold hover:underline">
          Sign up
        </button>
      </p>
    </div>
  )
}
