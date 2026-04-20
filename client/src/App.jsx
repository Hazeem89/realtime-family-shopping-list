import { useAuth } from './hooks/useAuth'
import AuthPage from './components/auth/AuthPage'

export default function App() {
  const { user, loading, signIn, signUp, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-100 flex items-center justify-center">
        <p className="text-stone-400 text-sm">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <AuthPage onSignIn={signIn} onSignUp={signUp} />
  }

  return (
    <div className="min-h-screen bg-orange-100 flex items-center justify-center">
      <div className="text-center">
        <p className="text-stone-600 mb-4">Signed in as <strong>{user.email}</strong></p>
        <button
          onClick={signOut}
          className="px-4 py-2 rounded-xl bg-amber-400 text-white font-semibold hover:bg-amber-500 transition"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
