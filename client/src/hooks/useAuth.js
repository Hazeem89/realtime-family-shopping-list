import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
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
      }
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

  return { user, loading, signUp, signIn, signOut }
}
