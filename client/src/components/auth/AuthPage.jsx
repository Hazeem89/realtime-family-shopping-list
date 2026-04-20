import { useState } from 'react'
import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'

export default function AuthPage({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState('signin')

  return (
    <div className="min-h-screen bg-orange-100 flex flex-col items-center justify-center py-8 px-4">
      <h1 className="text-3xl font-bold text-stone-700 mb-8">🛒 Family Shopping List</h1>
      {mode === 'signin'
        ? <SignInForm onSignIn={onSignIn} onSwitch={() => setMode('signup')} />
        : <SignUpForm onSignUp={onSignUp} onSwitch={() => setMode('signin')} />
      }
    </div>
  )
}
