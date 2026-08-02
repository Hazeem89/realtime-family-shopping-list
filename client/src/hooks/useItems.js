import { useState, useEffect, useMemo, useRef } from 'react'
import supabase from '../lib/supabase'

// v2: caches written before sort_order existed would deserialize items with
// sortOrder === undefined and feed that straight to the comparator.
const itemsCacheKey = (familyId) => `fsl_items_v2_${familyId}`
const legacyItemsCacheKey = (familyId) => `fsl_items_${familyId}`

// Every items query selects through this constant, so the row shape reaching
// normalize() is identical everywhere.
const ITEM_SELECT = 'id, name, bought, sort_order, created_at, profiles!added_by(full_name)'

// Database row (snake_case) -> React model (camelCase).
const normalize = (item) => ({
  id: item.id,
  name: item.name,
  bought: item.bought,
  sortOrder: item.sort_order,
  addedBy: item.profiles?.full_name ?? 'Unknown'
})

// The subset of the model a realtime payload can supply on its own, so an
// UPDATE needs no re-fetch. The only field normalize() takes from a join is
// addedBy, and that never changes.
const normalizeChanges = (row) => {
  const changes = {}
  if (row.name !== undefined) changes.name = row.name
  if (row.bought !== undefined) changes.bought = row.bought
  if (row.sort_order !== undefined) changes.sortOrder = row.sort_order
  return changes
}

// Mirrors the fetch query's ORDER BY exactly. `bought` is deliberately not a
// key: checking an item leaves it where it is.
//
// The id tiebreak is what makes concurrent moves safe. Two clients can briefly
// land on the same sort_order, and without a tiebreak they would render the
// same data in different orders. Comparing undefined sortOrder yields NaN,
// which is falsy, so a stale cache degrades to id order instead of scrambling.
const bySortOrder = (a, b) =>
  (a.sortOrder - b.sortOrder) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)

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
    localStorage.removeItem(legacyItemsCacheKey(family.id))
    const hasCached = !!localStorage.getItem(cacheKey)
    if (!hasCached) setLoading(true)

    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
    try {
      const { data, error } = await Promise.race([
        supabase
          .from('items')
          .select(ITEM_SELECT)
          .eq('family_id', family.id)
          .order('sort_order', { ascending: true })
          .order('id', { ascending: true }),
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

  const withTimeout = (query, ms = 10000) =>
    Promise.race([query, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))])

  // prevId/nextId are the neighbours the item should land between in the
  // ordered list — either may be null at an end. All position arithmetic
  // happens in move_item; this only mirrors it optimistically so the drag
  // doesn't wait on a round trip, then reconciles with the server's answer.
  const moveItem = async (itemId, prevId, nextId) => {
    setError(null)
    const snapshot = itemsRef.current

    const prevOrder = prevId ? snapshot.find(i => i.id === prevId)?.sortOrder : undefined
    const nextOrder = nextId ? snapshot.find(i => i.id === nextId)?.sortOrder : undefined
    const optimisticOrder =
      prevOrder !== undefined && nextOrder !== undefined ? (prevOrder + nextOrder) / 2
      : prevOrder !== undefined ? prevOrder + 100
      : nextOrder !== undefined ? nextOrder - 100
      : 100

    patchItem(itemId, { sortOrder: optimisticOrder })

    try {
      const { data, error } = await withTimeout(
        supabase.rpc('move_item', {
          p_item_id: itemId,
          p_prev_item_id: prevId ?? null,
          p_next_item_id: nextId ?? null
        })
      )

      if (error) throw error

      // The server may have renormalized the whole family (gap collapse),
      // so its answer for this row's position is authoritative — but other
      // rows' sortOrder already arrive individually via realtime UPDATEs.
      patchItem(itemId, { sortOrder: data })
    } catch (err) {
      setItems(snapshot)
      setError(err.message === 'timeout' ? 'Connection timed out. Please try again.' : err.message)
    }
  }

  // The single choke point for ordering. ItemList never sorts, and no mutation
  // has to remember to: addItem appends, realtime patches sortOrder in place,
  // and both land in the right position here.
  const orderedItems = useMemo(() => [...items].sort(bySortOrder), [items])

  return {
    items: orderedItems,
    activity,
    newItemId,
    loading,
    error,
    setError,
    addItem,
    toggleItem,
    deleteItem,
    moveItem
  }
}
