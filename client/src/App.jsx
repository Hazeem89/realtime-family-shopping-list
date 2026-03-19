import { useState, useEffect } from 'react'
import socket from './socket'
import JoinScreen from './components/JoinScreen'
import Header from './components/Header'
import AddItemForm from './components/AddItemForm'
import ItemList from './components/ItemList'
import ActivityFeed from './components/ActivityFeed'

export default function App() {
  const [username, setUsername] = useState(() => localStorage.getItem('shoppingUsername') || '')
  const [joined, setJoined] = useState(!!localStorage.getItem('shoppingUsername'))
  const [items, setItems] = useState([])
  const [activity, setActivity] = useState([])
  const [userCount, setUserCount] = useState(0)
  const [newItemId, setNewItemId] = useState(null)

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
    const res = await fetch('http://localhost:3001/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, user: username })
    })
    const item = await res.json()
    setNewItemId(item.id)
    setTimeout(() => setNewItemId(null), 2000)
  }

  const handleToggle = async (item) => {
    await fetch(`http://localhost:3001/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: username })
    })
  }

  const handleDelete = async (id) => {
    await fetch(`http://localhost:3001/items/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: username })
    })
  }

  if (!joined) return <JoinScreen onJoin={handleJoin} />

  return (
    <div className="min-h-screen bg-orange-100 py-4 px-3 sm:py-8 sm:px-4">
      <div className="w-full max-w-lg mx-auto">
        <Header userCount={userCount} username={username} onLeave={handleLeave} />
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
