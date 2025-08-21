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
  const [hasShownResumePrompt, setHasShownResumePrompt] = useState(false)

  // SEPARATE useEffect for timeout (not nested!)
  useEffect(() => {
    // Safety timeout - if loading stays true for more than 10 seconds, force it to false
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('⚠️ Loading timeout - forcing loading to false')
        setLoading(false)
      }
    }, 10000) // 10 seconds

    return () => clearTimeout(timeout)
  }, [loading])

  // SEPARATE useEffect for auth management
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth session error:', error)
        } else if (session?.user) {
          setUser(session.user)
          // Don't await - fetch profile in background
          fetchUserProfile(session.user.id).catch(err => {
            console.error('Profile fetch failed:', err)
          })
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
          // Don't await - fetch profile in background
          fetchUserProfile(session.user.id).catch(err => {
            console.error('Profile fetch failed:', err)
          })
        } else {
          setUser(null)
          setProfile(null)
          setHasShownResumePrompt(false) // Reset resume prompt state on logout
        }
        
        // ALWAYS set loading to false regardless of profile fetch
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
        
        // Check for saved session data to offer resume after login
        checkForLoginResume(data)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  // Check for saved session data and offer resume after login
  const checkForLoginResume = async (userProfile) => {
    try {
      // Prevent multiple resume checks - only show once per login session
      if (hasShownResumePrompt) {
        console.log('📝 Resume prompt already shown this session, skipping')
        return
      }

      // Only check if user has resume feature enabled and has saved session data
      if (!userProfile.resume_enabled || !userProfile.last_video_id || !userProfile.last_video_timestamp) {
        console.log('📝 No resume data or feature disabled for user')
        return
      }

      console.log('🎯 Found saved session data after login:', {
        videoId: userProfile.last_video_id,
        timestamp: userProfile.last_video_timestamp,
        title: userProfile.last_video_title,
        channel: userProfile.last_video_channel_name,
        sessionDate: userProfile.last_session_date
      })

      // Mark that we've shown the resume prompt
      setHasShownResumePrompt(true)
      
      // Show resume prompt to user
      showLoginResumePrompt(userProfile)
    } catch (error) {
      console.error('❌ Error checking login resume:', error)
    }
  }

  // Show resume prompt after login
  const showLoginResumePrompt = (userProfile) => {
    const minutes = Math.floor(userProfile.last_video_timestamp / 60)
    const seconds = Math.floor(userProfile.last_video_timestamp % 60)
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`
    
    const title = userProfile.last_video_title || 'your last video'
    const message = `Welcome back! Would you like to resume ${title} from ${timeString}?`
    
    // Use browser confirm for now (can be enhanced with custom modal later)
    const shouldResume = window.confirm(message)
    
    if (shouldResume) {
      console.log('✅ User chose to resume after login')
      // Navigate to the saved video with resume parameters
      navigateToResumeVideo(userProfile)
    } else {
      console.log('❌ User chose not to resume after login')
    }
  }

  // Navigate to saved video for resume
  const navigateToResumeVideo = (userProfile) => {
    try {
      // Build the video URL with parameters
      const videoUrl = `/watch?v=${userProfile.last_video_id}`
      const titleParam = userProfile.last_video_title ? `&title=${encodeURIComponent(userProfile.last_video_title)}` : ''
      const channelParam = userProfile.last_video_channel_name ? `&channel=${encodeURIComponent(userProfile.last_video_channel_name)}` : ''
      
      const fullUrl = videoUrl + titleParam + channelParam
      console.log('🌐 Navigating to resume video:', fullUrl)
      
      // Use window.location.href but with replace to prevent back button issues
      // This is the safest method for navigation from a context
      window.location.replace(fullUrl)
    } catch (error) {
      console.error('❌ Error navigating to resume video:', error)
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