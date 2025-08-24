// contexts/UserContext.js - User Profile and Feature Management
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase/client'
import { useAuth } from './AuthContext'

const UserContext = createContext({})

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)

  // Get user from AuthContext
  const { user } = useAuth()

  // Fetch profile when user changes
  useEffect(() => {
    if (user?.id) {
      fetchUserProfile(user.id)
    } else {
      setProfile(null)
    }
  }, [user])

  const fetchUserProfile = async (userId) => {
    if (!userId) return
    
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*, subscription_tier, subscription_status')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Profile fetch error:', error)
        return
      }

      if (data) {
        setProfile(data)
        console.log('Profile loaded:', data.email, data.subscription_tier, 'Plan:', data.subscription_tier, 'Status:', data.subscription_status)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = () => {
    if (profile?.id) {
      fetchUserProfile(profile.id)
    }
  }

  const value = {
    // State
    profile,
    loading,
    
    // Computed values
    isPremium: profile?.subscription_tier === 'premium',
    hasPlanAccess: !!(profile?.subscription_tier && profile?.subscription_status === 'active'),
    planType: profile?.subscription_tier || 'freebird',
    planStatus: profile?.subscription_status || null,
    
    // Feature access
    canSearch: !!(profile?.subscription_tier && profile?.subscription_status === 'active'),
    
    // User data helpers
    userName: profile?.full_name || profile?.email?.split('@')[0] || 'User',
    userEmail: profile?.email,
    dailySearchesUsed: profile?.daily_searches_used || 0,
    searchLimit: profile?.subscription_tier === 'premium' ? 999999 : 20,
    
    // Actions
    fetchUserProfile,
    refreshProfile,
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}
