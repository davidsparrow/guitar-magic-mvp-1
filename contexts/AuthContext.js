// contexts/AuthContext.js - Full Authentication System
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth session error:', error)
        } else if (session?.user) {
          setUser(session.user)
          await fetchUserProfile(session.user.id)
        }
      } catch (error) {
        console.error('Failed to get session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        
        if (session?.user) {
          setUser(session.user)
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Profile fetch error:', error)
        // If profile doesn't exist, it will be created by the database trigger
        return
      }

      if (data) {
        setProfile(data)
        console.log('Profile loaded:', data.email, data.subscription_tier)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (error) {
        console.error('Sign up error:', error)
        return { data: null, error }
      }

      console.log('Sign up successful:', data.user?.email)
      return { data, error: null }
    } catch (error) {
      console.error('Sign up failed:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Sign in error:', error)
        return { data: null, error }
      }

      console.log('Sign in successful:', data.user?.email)
      return { data, error: null }
    } catch (error) {
      console.error('Sign in failed:', error)
      return { data: null, error }
    }
  }

const signOut = async () => {
  try {
    console.log('Starting sign out...')
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Sign out error:', error)
      return { error }
    }

    console.log('Sign out successful - forcing reload')
    // Force page reload to clear all state
    window.location.href = '/'
    return { error: null }
  } catch (error) {
    console.error('Sign out failed:', error)
    return { error }
  }
}

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        console.error('Password reset error:', error)
        return { error }
      }

      console.log('Password reset email sent')
      return { error: null }
    } catch (error) {
      console.error('Password reset failed:', error)
      return { error }
    }
  }

  const value = {
    // State
    user,
    profile,
    loading,
    
    // Computed values
    isAuthenticated: !!user,
    isPremium: profile?.subscription_tier === 'premium',
    isEmailConfirmed: user?.email_confirmed_at != null,
    
    // Actions
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshProfile: () => fetchUserProfile(user?.id),
    
    // User data helpers
    userName: profile?.full_name || user?.email?.split('@')[0] || 'User',
    userEmail: user?.email,
    subscriptionTier: profile?.subscription_tier || 'free',
    dailySearchesUsed: profile?.daily_searches_used || 0,
    searchLimit: profile?.subscription_tier === 'premium' ? 999999 : 20,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}