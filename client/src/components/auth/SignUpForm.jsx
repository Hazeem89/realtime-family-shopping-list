import { useState } from 'react'

export default function SignUpForm({ onSignUp, onSwitch }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = await onSignUp(email, password, fullName)
    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl px-6 py-8 w-full max-w-sm mx-auto text-center">
        <p className="text-2xl mb-2">📬</p>
        <h2 className="text-xl font-bold text-stone-700 mb-2">Check your email</h2>
        <p className="text-stone-400 text-sm">We sent you a confirmation link. Click it to activate your account.</p>
      </div>
    )
  }

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl px-6 py-8 w-full max-w-sm mx-auto">
      <h2 className="text-2xl font-bold text-stone-700 mb-6 text-center">Create account</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
          className="px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
        />
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
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          className="px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 rounded-xl bg-amber-400 text-white font-semibold hover:bg-amber-500 active:bg-amber-600 transition shadow-sm disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
      <p className="text-center text-stone-400 text-sm mt-6">
        Already have an account?{' '}
        <button onClick={onSwitch} className="text-amber-500 font-semibold hover:underline">
          Sign in
        </button>
      </p>
    </div>
  )
}
