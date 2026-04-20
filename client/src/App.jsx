import { useAuth } from './hooks/useAuth'
import { useFamily } from './hooks/useFamily'
import AuthPage from './components/auth/AuthPage'
import FamilySetup from './components/family/FamilySetup'

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const { family, loading: familyLoading, createFamily, joinFamily } = useFamily(user)

  if (authLoading || familyLoading) {
    return (
      <div className="min-h-screen bg-orange-100 flex items-center justify-center">
        <p className="text-stone-400 text-sm">Loading...</p>
      </div>
    )
  }

  if (!user) return <AuthPage onSignIn={signIn} onSignUp={signUp} />

  if (!family) return <FamilySetup onCreate={createFamily} onJoin={joinFamily} />

  return (
    <div className="min-h-screen bg-orange-100 flex items-center justify-center">
      <div className="text-center">
        <p className="text-stone-600 mb-1">Welcome to <strong>{family.name}</strong></p>
        <p className="text-stone-400 text-sm mb-4">Signed in as {user.email}</p>
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
