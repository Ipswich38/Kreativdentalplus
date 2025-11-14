import { useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: AuthError | null
}

export function useAuth(): AuthState & {
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ user: User | null; error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
} {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        setError(error)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
      }

      setLoading(false)
    }

    getSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        setError(null)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error)
    }

    setLoading(false)
    return { user: data.user, error }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })

    if (error) {
      setError(error)
    }

    setLoading(false)
    return { user: data.user, error }
  }

  const signOut = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()

    if (error) {
      setError(error)
    }

    setLoading(false)
    return { error }
  }

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  }
}