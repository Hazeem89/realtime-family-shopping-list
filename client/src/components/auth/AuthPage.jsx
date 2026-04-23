import { useState, useEffect } from 'react'
import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'

export default function AuthPage({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState('signin')

  useEffect(() => {
    document.body.classList.add('bg-out')
    return () => document.body.classList.remove('bg-out')
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-8 px-4">
      <img src="/logo.png" alt="Family Shopping List" className="h-16 w-auto mb-4 drop-shadow-md logo-slide" />
      <h1 className="text-4xl font-extrabold mb-8 tracking-tight bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_3px_8px_rgba(0,0,0,0.5)] text-shake">
        Shopping List
      </h1>
      {mode === 'signin'
        ? <SignInForm onSignIn={onSignIn} onSwitch={() => setMode('signup')} />
        : <SignUpForm onSignUp={onSignUp} onSwitch={() => setMode('signin')} />
      }
    </div>
  )
}
