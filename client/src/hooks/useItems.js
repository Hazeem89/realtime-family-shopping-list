import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

export function useItems(family, user) {
  const [items, setItems] = useState([])
  const [newItemId, setNewItemId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!family) { setItems([]); setLoading(false); return }
    fetchItems()
  }, [family])

  const fetchItems = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('items')
      .select('id, name, bought, created_at, profiles!added_by(full_name)')
      .order('created_at', { ascending: true })

    if (error) { setError(error.message); setLoading(false); return }

    setItems(data.map(normalize))
    setLoading(false)
  }

  const normalize = (item) => ({
    id: item.id,
    name: item.name,
    bought: item.bought,
    addedBy: item.profiles?.full_name ?? 'Unknown'
  })

  const addItem = async (name) => {
    setError(null)
    const duplicate = items.find(i => i.name.toLowerCase() === name.toLowerCase())
    if (duplicate) { setError(`"${name}" is already on the list`); return }

    const { data, error } = await supabase
      .from('items')
      .insert({ name, family_id: family.id, added_by: user.id })
      .select('id, name, bought, profiles!added_by(full_name)')
      .single()

    if (error) { setError(error.message); return }

    const newItem = normalize(data)
    setItems(prev => [...prev, newItem])
    setNewItemId(newItem.id)
    setTimeout(() => setNewItemId(null), 2000)
  }

  const toggleItem = async (item) => {
    setError(null)
    const { error } = await supabase
      .from('items')
      .update({
        bought: !item.bought,
        bought_by: !item.bought ? user.id : null
      })
      .eq('id', item.id)

    if (error) { setError(error.message); return }

    setItems(prev => prev.map(i => i.id === item.id ? { ...i, bought: !i.bought } : i))
  }

  const deleteItem = async (id) => {
    setError(null)
    const { error } = await supabase.from('items').delete().eq('id', id)
    if (error) { setError(error.message); return }
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return { items, newItemId, loading, error, setError, addItem, toggleItem, deleteItem }
}
