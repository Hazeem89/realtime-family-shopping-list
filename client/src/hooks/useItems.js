import { useState, useEffect, useRef } from 'react'
import supabase from '../lib/supabase'

const itemsCacheKey = (familyId) => `fsl_items_${familyId}`

// Every items query selects through this constant, so the row shape reaching
// normalize() is identical everywhere.
const ITEM_SELECT = 'id, name, bought, created_at, profiles!added_by(full_name)'

// Database row (snake_case) -> React model (camelCase).
const normalize = (item) => ({
  id: item.id,
  name: item.name,
  bought: item.bought,
  addedBy: item.profiles?.full_name ?? 'Unknown'
})

// The subset of the model a realtime payload can supply on its own, so an
// UPDATE needs no re-fetch. The only field normalize() takes from a join is
// addedBy, and that never changes.
const normalizeChanges = (row) => {
  const changes = {}
  if (row.name !== undefined) changes.name = row.name
  if (row.bought !== undefined) changes.bought = row.bought
  return changes
}

export function useItems(family, user) {
  const [items, setItems] = useState(() => {
    if (!family?.id) return []
    try { return JSON.parse(localStorage.getItem(itemsCacheKey(family.id))) ?? [] } catch { return [] }
  })
  const [activity, setActivity] = useState([])
  const [newItemId, setNewItemId] = useState(null)
  const [loading, setLoading] = useState(() => {
    if (!family?.id) return true
    try { return !localStorage.getItem(itemsCacheKey(family.id)) } catch { return true }
  })
  const [error, setError] = useState(null)
  const profileCache = useRef({})

  // Mirrors `items` so realtime handlers can read the current list without
  // taking a dependency on it or abusing setItems as a getter.
  const itemsRef = useRef(items)
  useEffect(() => { itemsRef.current = items }, [items])

  // --- local state helpers -------------------------------------------------
  // Every mutation goes through these, so there is one place that knows how
  // the items array is shaped.

  const patchItem = (id, changes) =>
    setItems(prev => prev.map(i => (i.id === id ? { ...i, ...changes } : i)))

  const replaceItem = (item) =>
    setItems(prev => prev.map(i => (i.id === item.id ? item : i)))

  const addLocalItem = (item) =>
    setItems(prev => (prev.some(i => i.id === item.id) ? prev : [...prev, item]))

  const removeLocalItem = (id) =>
    setItems(prev => prev.filter(i => i.id !== id))

  // --- reads ---------------------------------------------------------------

  const resolveProfile = async (userId) => {
    if (profileCache.current[userId]) return profileCache.current[userId]
    const { data } = await supabase.from('profiles').select('full_name').eq('id', userId).single()
    const name = data?.full_name ?? 'Someone'
    profileCache.current[userId] = name
    return name
  }

  const addActivity = (msg) => {
    setActivity(prev => [msg, ...prev].slice(0, 10))
  }

  const fetchItem = async (id) => {
    const { data } = await supabase.from('items').select(ITEM_SELECT).eq('id', id).single()
    return data ? normalize(data) : null
  }

  const fetchItems = async () => {
    const cacheKey = itemsCacheKey(family.id)
    const hasCached = !!localStorage.getItem(cacheKey)
    if (!hasCached) setLoading(true)

    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
    try {
      const { data, error } = await Promise.race([
        supabase
          .from('items')
          .select(ITEM_SELECT)
          .eq('family_id', family.id)
          .order('created_at', { ascending: true }),
        timeout
      ])

      if (error) { setError(error.message); return }

      const normalized = data.map(normalize)
      localStorage.setItem(cacheKey, JSON.stringify(normalized))
      setItems(normalized)
    } catch {
      // timeout — keep cached data
    } finally {
      setLoading(false)
    }
  }

  // --- realtime ------------------------------------------------------------

  useEffect(() => {
    if (!family) { setItems([]); setLoading(false); return }
    fetchItems()

    const channel = supabase
      .channel(`items:${family.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'items',
        filter: `family_id=eq.${family.id}`
      }, async (payload) => {
        // Re-fetch: the replication payload carries no joined profile name.
        const item = await fetchItem(payload.new.id)
        if (!item) return
        addLocalItem(item)
        addActivity(`${item.addedBy} added ${item.name}`)
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'items',
        filter: `family_id=eq.${family.id}`
      }, async (payload) => {
        const row = payload.new
        const cached = itemsRef.current.find(i => i.id === row.id)

        if (cached) {
          // items is REPLICA IDENTITY FULL, so the payload has every column we
          // render. No round trip on what will become the drag hot path.
          replaceItem({ ...cached, ...normalizeChanges(row) })
        } else {
          // Not in local state (e.g. it arrived while this tab was away), so
          // this one does need the join.
          const item = await fetchItem(row.id)
          if (item) addLocalItem(item)
        }

        // Only a bought/unbought change is worth an activity entry. Updates to
        // other columns (sort_order next) must stay silent.
        if (payload.old?.bought === row.bought) return

        const name = row.name ?? cached?.name
        if (!name) return
        const actorName = row.bought && row.bought_by
          ? await resolveProfile(row.bought_by)
          : 'Someone'
        addActivity(`${actorName} ${row.bought ? 'checked' : 'unchecked'} ${name}`)
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'items',
        filter: `family_id=eq.${family.id}`
      }, (payload) => {
        addActivity(`"${payload.old.name}" was removed`)
        removeLocalItem(payload.old.id)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [family?.id])

  // --- mutations -----------------------------------------------------------

  const addItem = async (name) => {
    setError(null)
    const duplicate = items.find(i => i.name.toLowerCase() === name.toLowerCase())
    if (duplicate) { setError(`"${name}" is already on the list`); return }

    const { data, error } = await supabase
      .from('items')
      .insert({ name, family_id: family.id, added_by: user.id })
      .select(ITEM_SELECT)
      .single()

    if (error) { setError(error.message); return }

    const newItem = normalize(data)
    addLocalItem(newItem)
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

    patchItem(item.id, { bought: !item.bought })
  }

  const deleteItem = async (id) => {
    setError(null)
    const { error } = await supabase.from('items').delete().eq('id', id)
    if (error) { setError(error.message); return }
    removeLocalItem(id)
  }

  return { items, activity, newItemId, loading, error, setError, addItem, toggleItem, deleteItem }
}
