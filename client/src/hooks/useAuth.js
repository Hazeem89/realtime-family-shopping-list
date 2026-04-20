import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()
    setProfile(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) await fetchProfile(currentUser.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (event === 'SIGNED_IN' && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname)
      }

      if (event === 'SIGNED_IN' && currentUser) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', currentUser.id)
          .single()

        if (!existing) {
          await supabase.from('profiles').insert({
            id: currentUser.id,
            full_name: currentUser.user_metadata?.full_name ?? 'Unknown'
          })
        }

        await fetchProfile(currentUser.id)
      }

      if (event === 'SIGNED_OUT') setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    return error
  }

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return { user, profile, loading, signUp, signIn, signOut }
}
