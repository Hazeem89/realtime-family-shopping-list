import { useState, useEffect } from 'react'
import CreateFamily from './CreateFamily'
import JoinFamily from './JoinFamily'

export default function FamilySetup({ onCreate, onJoin }) {
  const [mode, setMode] = useState('create')

  useEffect(() => {
    document.body.classList.add('bg-out')
    return () => document.body.classList.remove('bg-out')
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-8 px-4">
      <h1 className="text-3xl font-bold text-stone-700 mb-2">🛒 Family Shopping List</h1>
      <p className="text-stone-400 text-sm mb-8">Set up your family to get started</p>
      <div className="w-full max-w-sm">
        {mode === 'create'
          ? <CreateFamily onCreate={onCreate} onSwitch={() => setMode('join')} />
          : <JoinFamily onJoin={onJoin} onSwitch={() => setMode('create')} />
        }
      </div>
    </div>
  )
}
