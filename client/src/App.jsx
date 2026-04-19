import { useState, useEffect } from 'react'
import socket from './socket'
import JoinScreen from './components/JoinScreen'
import Header from './components/Header'
import AddItemForm from './components/AddItemForm'
import ItemList from './components/ItemList'
import ActivityFeed from './components/ActivityFeed'

const API_URL = import.meta.env.VITE_API_URL

export default function App() {
  const [username, setUsername] = useState(() => localStorage.getItem('shoppingUsername') || '')
  const [joined, setJoined] = useState(!!localStorage.getItem('shoppingUsername'))
  const [items, setItems] = useState([])
  const [activity, setActivity] = useState([])
  const [userCount, setUserCount] = useState(0)
  const [newItemId, setNewItemId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    socket.on('itemsUpdated', setItems)
    socket.on('activity', msg => setActivity(prev => [msg, ...prev].slice(0, 10)))
    socket.on('userCount', setUserCount)
    return () => {
      socket.off('itemsUpdated')
      socket.off('activity')
      socket.off('userCount')
    }
  }, [])

  useEffect(() => {
    if (joined && username) socket.emit('setUser', username)
  }, [joined, username])

  const handleJoin = (name) => {
    localStorage.setItem('shoppingUsername', name)
    setUsername(name)
    setJoined(true)
  }

  const handleLeave = () => {
    localStorage.removeItem('shoppingUsername')
    setUsername('')
    setJoined(false)
  }

  const handleAddItem = async (name) => {
    setError(null)
    try {
      const res = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, user: username })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }
      setNewItemId(data.id)
      setTimeout(() => setNewItemId(null), 2000)
    } catch {
      setError('Could not connect to server. Is it running?')
    }
  }

  const handleToggle = async (item) => {
    setError(null)
    try {
      const res = await fetch(`${API_URL}/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username })
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error)
      }
    } catch {
      setError('Could not connect to server. Is it running?')
    }
  }

  const handleDelete = async (id) => {
    setError(null)
    try {
      const res = await fetch(`${API_URL}/items/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username })
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error)
      }
    } catch {
      setError('Could not connect to server. Is it running?')
    }
  }

  if (!joined) return <JoinScreen onJoin={handleJoin} />

  return (
    <div className="min-h-screen bg-orange-100 py-4 px-3 sm:py-8 sm:px-4">
      <div className="w-full max-w-lg mx-auto">
        <Header userCount={userCount} username={username} onLeave={handleLeave} />
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}
        <AddItemForm onAdd={handleAddItem} />
        <ItemList
          items={items}
          newItemId={newItemId}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
        <ActivityFeed activity={activity} />
      </div>
    </div>
  )
}
