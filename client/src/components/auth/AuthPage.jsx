import { useState } from 'react'
import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'

export default function AuthPage({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState('signin')

  return (
    <div className="min-h-screen bg-orange-100 flex flex-col items-center justify-center py-8 px-4">
      <img src="/logo.png" alt="Family Shopping List" className="h-16 w-auto mb-4 drop-shadow-md logo-slide" />
      <h1 className="text-4xl font-extrabold mb-8 tracking-tight bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-sm text-shake">
        Shopping List
      </h1>
      {mode === 'signin'
        ? <SignInForm onSignIn={onSignIn} onSwitch={() => setMode('signup')} />
        : <SignUpForm onSignUp={onSignUp} onSwitch={() => setMode('signin')} />
      }
    </div>
  )
}
