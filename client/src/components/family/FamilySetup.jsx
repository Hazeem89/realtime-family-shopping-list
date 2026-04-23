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
      <h1 className="text-4xl font-extrabold mb-8 tracking-tight bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_3px_8px_rgba(0,0,0,0.5)] text-shake">
        Shopping List
      </h1>
      <div className="w-full max-w-sm">
        {mode === 'create'
          ? <CreateFamily onCreate={onCreate} onSwitch={() => setMode('join')} />
          : <JoinFamily onJoin={onJoin} onSwitch={() => setMode('create')} />
        }
      </div>
    </div>
  )
}
