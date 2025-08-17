// pages/watch.js - Watch Page with YouTube Video Player
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { FaHamburger, FaSearch, FaTimes, FaRegEye, FaRegEdit, FaPlus } from "react-icons/fa"
import { TiDeleteOutline } from "react-icons/ti"
import { CgViewList } from "react-icons/cg"
import { IoText } from "react-icons/io5"
import { IoMdPower } from "react-icons/io"
import { RiLogoutCircleRLine } from "react-icons/ri"
import { TbGuitarPickFilled } from "react-icons/tb"
import { MdFlipCameraAndroid } from "react-icons/md"
import { ImLoop } from "react-icons/im"
import { BsReverseLayoutSidebarInsetReverse } from "react-icons/bs"
import { IoGameControllerOutline } from "react-icons/io5"
import TopBanner from '../components/TopBanner'

export default function Watch() {
  const { isAuthenticated, user, profile, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showRightMenuModal, setShowRightMenuModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Video player states
  const [videoId, setVideoId] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [videoChannel, setVideoChannel] = useState('')
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [player, setPlayer] = useState(null)
  
  // Control strip states - Individual row visibility
  const [showControlStrips, setShowControlStrips] = useState(false)
  const [showRow1, setShowRow1] = useState(false)
  const [showRow2, setShowRow2] = useState(false)
  const [showRow3, setShowRow3] = useState(false)

  // Video flip states
  const [flipState, setFlipState] = useState('normal') // 'normal', 'horizontal', 'vertical'
  
  // Loop segment states
  const [isLoopActive, setIsLoopActive] = useState(false)
  const [loopStartTime, setLoopStartTime] = useState('0:00')
  const [loopEndTime, setLoopEndTime] = useState('0:00')
  const [showLoopModal, setShowLoopModal] = useState(false)
  const [tempLoopStart, setTempLoopStart] = useState('0:00')
  const [tempLoopEnd, setTempLoopEnd] = useState('0:00')
  
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // User access control states
  const [isVideoFavorited, setIsVideoFavorited] = useState(false)
  const [userPlan, setUserPlan] = useState('free') // 'free', 'basic', 'premium'
  const [showUnfavoriteWarning, setShowUnfavoriteWarning] = useState(false)
  
  // Caption management states
  const [showCaptionModal, setShowCaptionModal] = useState(false)
  const [captions, setCaptions] = useState([])
  const [editingCaption, setEditingCaption] = useState(null)
  const [isAddingNewCaption, setIsAddingNewCaption] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [captionToDelete, setCaptionToDelete] = useState(null)
  const [conflictRowIndex, setConflictRowIndex] = useState(-1)
  const [isInCaptionMode, setIsInCaptionMode] = useState(false)
  const [editingCaptionId, setEditingCaptionId] = useState(null)
  const [originalCaptionState, setOriginalCaptionState] = useState(null) // Track original caption before editing

  // Database operation states
  const [isLoadingCaptions, setIsLoadingCaptions] = useState(false)
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)
  const [dbError, setDbError] = useState(null)
  
  // Watch time tracking states
  const [watchStartTime, setWatchStartTime] = useState(null)
  const [isTrackingWatchTime, setIsTrackingWatchTime] = useState(false)
  const lastSavedSessionRef = useRef(null)
  const saveTimeoutRef = useRef(null) // Add timeout ref for debouncing
  
  // YouTube API loading states
  const [youtubeAPILoading, setYoutubeAPILoading] = useState(false)
  const [youtubeAPIError, setYoutubeAPIError] = useState(false)

  // Feature Gates states
  const [featureGates, setFeatureGates] = useState(null)
  const [featureGatesLoading, setFeatureGatesLoading] = useState(true)

  // Daily limit upgrade modal states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [dailyLimitInfo, setDailyLimitInfo] = useState(null)
  const [currentDailyTotal, setCurrentDailyTotal] = useState(0) // Track current daily watch time total

  // Basic Supabase database operations
  const saveFavorite = async (videoData) => {
    try {
      setIsLoadingFavorites(true)
      setDbError(null)
      
      const { data, error } = await supabase
        .from('favorites')
        .insert([{
          user_id: user?.id,
          video_id: videoData.videoId,
          video_title: videoData.videoTitle,
          video_channel: videoData.videoChannel,
          video_thumbnail: videoData.videoThumbnail,
          video_duration_seconds: videoData.videoDuration
        }])
        .select()
      
      if (error) throw error
      
      console.log('✅ Favorite saved to database:', data)
      return data[0]
    } catch (error) {
      console.error('❌ Error saving favorite:', error)
      setDbError('Failed to save favorite')
      return null
    } finally {
      setIsLoadingFavorites(false)
    }
  }

  const loadCaptions = async (videoId) => {
    try {
      setIsLoadingCaptions(true)
      setDbError(null)
      
      // First get the favorite record for this video
      const { data: favoriteData, error: favoriteError } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user?.id)
        .eq('video_id', videoId)
        .single()
      
      if (favoriteError) {
        if (favoriteError.code === 'PGRST116') {
          // No favorite found, return empty array
          console.log('ℹ️ No favorite found for video, no captions to load')
          return []
        }
        throw favoriteError
      }
      
      // Now get captions for this favorite
      const { data, error } = await supabase
        .from('captions')
        .select('*')
        .eq('favorite_id', favoriteData.id)
        .order('start_time', { ascending: true })
      
      if (error) throw error
      
      // Transform database field names to frontend field names
      const transformedCaptions = (data || []).map(caption => ({
        id: caption.id,
        startTime: caption.start_time,
        endTime: caption.end_time,
        line1: caption.line1,
        line2: caption.line2,
        rowType: caption.row_type,
        favorite_id: caption.favorite_id,
        user_id: caption.user_id,
        created_at: caption.created_at,
        updated_at: caption.updated_at
      }))
      
      console.log('✅ Captions loaded from database:', data)
      console.log('🔄 Transformed captions for frontend:', transformedCaptions)
      return transformedCaptions
    } catch (error) {
      console.error('❌ Error loading captions:', error)
      setDbError('Failed to load captions')
      return []
    } finally {
      setIsLoadingCaptions(false)
    }
  }

  const checkIfVideoFavorited = async (videoId) => {
    try {
      if (!user?.id || !videoId) return false
      
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('video_id', videoId)
        .single()
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Error checking favorite status:', error)
        return false
      }
      
      return !!data // Convert to boolean
    } catch (error) {
      console.error('❌ Error checking favorite status:', error)
      return false
    }
  }

  const removeFavorite = async (videoId) => {
    try {
      if (!user?.id || !videoId) return false
      
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('video_id', videoId)
      
      if (error) throw error
      
      console.log('🗑️ Favorite removed from database')
      return true
    } catch (error) {
      console.error('❌ Error removing favorite:', error)
      setDbError('Failed to remove favorite')
      return false
    }
  }

  // Caption database operations
  const saveCaption = async (captionData) => {
    try {
      setIsLoadingCaptions(true)
      setDbError(null)
      
      // First ensure the video is favorited
      const isFavorited = await checkIfVideoFavorited(videoId)
      if (!isFavorited) {
        console.error('❌ Cannot save caption: video not favorited')
        setDbError('Video must be favorited to save captions')
        return null
      }
      
      // Get the favorite record to link the caption
      const { data: favoriteData, error: favoriteError } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('video_id', videoId)
        .single()
      
      if (favoriteError) throw favoriteError
      
      const { data, error } = await supabase
        .from('captions')
        .insert([{
          favorite_id: favoriteData.id,
          user_id: user.id,
          row_type: captionData.rowType,
          start_time: captionData.startTime || '0:00',
          end_time: captionData.endTime || '0:05',
          line1: captionData.line1 || '',
          line2: captionData.line2 || ''
        }])
        .select()
      
      if (error) throw error
      
      // Transform the saved caption to frontend format
      const savedCaption = data[0]
      const transformedCaption = {
        id: savedCaption.id,
        startTime: savedCaption.start_time,
        endTime: savedCaption.end_time,
        line1: savedCaption.line1,
        line2: savedCaption.line2,
        rowType: savedCaption.row_type,
        favorite_id: savedCaption.favorite_id,
        user_id: savedCaption.user_id,
        created_at: savedCaption.created_at,
        updated_at: savedCaption.updated_at
      }
      
      console.log('✅ Caption saved to database:', savedCaption)
      console.log('🔄 Transformed saved caption:', transformedCaption)
      return transformedCaption
    } catch (error) {
      console.error('❌ Error saving caption:', error)
      setDbError('Failed to save caption')
      return null
    } finally {
      setIsLoadingCaptions(false)
    }
  }

  const updateCaption = async (captionId, updates) => {
    try {
      setIsLoadingCaptions(true)
      setDbError(null)
      
      const { data, error } = await supabase
        .from('captions')
        .update({
          start_time: updates.startTime,
          end_time: updates.endTime,
          line1: updates.line1 || '',
          line2: updates.line2 || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', captionId)
        .eq('user_id', user.id) // Security: only update own captions
        .select()
      
      if (error) throw error
      
      // Transform the updated caption to frontend format
      const updatedCaption = data[0]
      const transformedCaption = {
        id: updatedCaption.id,
        startTime: updatedCaption.start_time,
        endTime: updatedCaption.end_time,
        line1: updatedCaption.line1,
        line2: updatedCaption.line2,
        rowType: updatedCaption.row_type,
        favorite_id: updatedCaption.favorite_id,
        user_id: updatedCaption.user_id,
        created_at: updatedCaption.created_at,
        updated_at: updatedCaption.updated_at
      }
      
      console.log('✅ Caption updated in database:', updatedCaption)
      console.log('🔄 Transformed updated caption:', transformedCaption)
      return transformedCaption
    } catch (error) {
      console.error('❌ Error updating caption:', error)
      setDbError('Failed to update caption')
      return null
    } finally {
      setIsLoadingCaptions(false)
    }
  }

  const deleteCaption = async (captionId) => {
    try {
      setIsLoadingCaptions(true)
      setDbError(null)
      
      const { error } = await supabase
        .from('captions')
        .delete()
        .eq('id', captionId)
        .eq('user_id', user.id) // Security: only delete own captions
      
      if (error) throw error
      
      console.log('🗑️ Caption deleted from database:', captionId)
      return true
    } catch (error) {
      console.error('❌ Error deleting caption:', error)
      setDbError('Failed to delete caption')
      return false
    } finally {
      setIsLoadingCaptions(false)
    }
  }

  // Watch time tracking functions
  const startWatchTimeTracking = () => {
    if (!videoId || !user?.id || !videoChannel) return null
    const startTime = Date.now()
    return startTime
  }

  const stopWatchTimeTracking = (startTime) => {
    if (!startTime || !videoId || !user?.id || !videoChannel) return
    
    const endTime = Date.now()
    const watchDurationSeconds = Math.floor((endTime - startTime) / 1000)
    
    if (watchDurationSeconds > 0) {
      saveWatchTimeToDatabase(watchDurationSeconds, startTime)
    }
  }

  const saveWatchTimeToDatabase = async (watchDurationSeconds, startTimestamp) => {
    try {
      if (!videoId || !user?.id || !videoChannel || watchDurationSeconds <= 0) return

      // DEBOUNCING: Clear any existing timeout to prevent rapid successive calls
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        console.log('⏱️ Cleared previous save timeout')
      }

      // DEBOUNCING: Set new timeout for 1 second to prevent duplicates
      saveTimeoutRef.current = setTimeout(async () => {
        const endTimestamp = new Date().toISOString()
        const startTimestampISO = new Date(startTimestamp).toISOString()

        // Check if we already saved this exact session to prevent duplicates
        const sessionKey = `${videoId}-${Math.floor(startTimestamp / 1000)}` // Round to nearest second
        
        if (lastSavedSessionRef.current === sessionKey) {
          console.log('⚠️ Duplicate session detected, skipping save:', sessionKey)
          return
        }

        const { data, error } = await supabase
          .from('channel_watch_time')
          .insert([{
            user_id: user.id,
            video_id: videoId,
            video_title: videoTitle,
            channel_name: videoChannel,
            channel_id: '',
            watch_time_seconds: watchDurationSeconds,
            watch_date: new Date().toISOString().split('T')[0],
            watch_timestamp_start: startTimestampISO,
            watch_timestamp_stop: endTimestamp
          }])
          .select()

        if (error) throw error
        
        // Mark this session as saved to prevent duplicates
        lastSavedSessionRef.current = sessionKey
        
        console.log('✅ Watch time saved:', watchDurationSeconds, 'seconds', 'from', startTimestampISO, 'to', endTimestamp)
      }, 1000) // 1 second debounce

    } catch (error) {
      console.error('❌ Error saving watch time:', error)
    }
  }

  // Query daily watch time total from Supabase
  const getDailyWatchTimeTotal = async () => {
    if (!user?.id) return
    
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('channel_watch_time')
        .select('watch_time_seconds')
        .eq('user_id', user.id)
        .eq('watch_date', today)

      if (error) throw error

      const totalSeconds = data.reduce((sum, record) => sum + record.watch_time_seconds, 0)
      const totalMinutes = (totalSeconds / 60).toFixed(1)
      
      console.log('📊 Daily watch time from Supabase:', totalMinutes, 'minutes')
      
      // Update the current daily total state for feature access checks
      setCurrentDailyTotal(parseFloat(totalMinutes))
      
      return totalMinutes
    } catch (error) {
      console.error('❌ Error querying daily watch time:', error)
      return 0
    }
  }

  // Check if user has exceeded their daily watch time limits
  const checkDailyWatchTimeLimits = (dailyMinutes) => {
    if (!user?.id || !userPlan) return
    
    // Update current daily total state for feature access checks
    setCurrentDailyTotal(parseFloat(dailyMinutes))
    
    // Define daily limits for each plan
    const dailyLimits = {
      'free': 60,      // 60 minutes per day (1 hour)
      'roadie': 180,   // 180 minutes per day (3 hours)
      'hero': 480      // 480 minutes per day (8 hours)
    }
    
    const userLimit = dailyLimits[userPlan] || dailyLimits.free
    const hasExceeded = dailyMinutes >= userLimit
    
    console.log('🔐 Daily limit check:', {
      userPlan,
      dailyMinutes,
      userLimit,
      hasExceeded,
      remainingMinutes: userLimit - dailyMinutes
    })
    
    if (hasExceeded) {
      console.log('⚠️ User has exceeded daily watch time limit!')
      
      // Set daily limit info for the upgrade modal
      setDailyLimitInfo({
        userPlan,
        dailyMinutes,
        userLimit,
        hasExceeded,
        remainingMinutes: userLimit - dailyMinutes
      })
      
      // Show the upgrade modal
      setShowUpgradeModal(true)
    }
    
    return { hasExceeded, userPlan, dailyMinutes, userLimit }
  }

  // Check if user can access features based on daily watch time limits
  const checkDailyLimitForFeature = () => {
    if (!user?.id || !userPlan) return false
    
    // Get current daily total from state
    const dailyMinutes = currentDailyTotal
    
    // Define daily limits for each plan
    const dailyLimits = {
      'free': 60,      // 60 minutes per day (1 hour)
      'roadie': 180,   // 180 minutes per day (3 hours)
      'hero': 480      // 480 minutes per day (8 hours)
    }
    
    const userLimit = dailyLimits[userPlan] || dailyLimits.free
    const hasExceeded = dailyMinutes >= userLimit
    
    if (hasExceeded) {
      console.log('🚫 Feature access blocked - daily limit exceeded:', {
        userPlan,
        dailyMinutes,
        userLimit,
        remainingMinutes: userLimit - dailyMinutes
      })
      
      // Set daily limit info for the upgrade modal
      setDailyLimitInfo({
        userPlan,
        dailyMinutes,
        userLimit,
        hasExceeded,
        remainingMinutes: userLimit - dailyMinutes
      })
      
      // Show the upgrade modal
      setShowUpgradeModal(true)
      return false
    }
    
    return true
  }

  // Feature Gates Helper Functions
  const loadFeatureGates = async () => {
    try {
      setFeatureGatesLoading(true)
      console.log('🚪 Loading feature gates configuration...')
      
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('setting_key', 'feature_gates')
        .single()

      if (error) {
        console.error('❌ Error loading feature gates:', error)
        return
      }

      if (data && data.setting_value) {
        setFeatureGates(data.setting_value)
        console.log('✅ Feature gates loaded:', data.setting_value)
      } else {
        console.log('⚠️ No feature gates configuration found')
      }
    } catch (error) {
      console.error('❌ Error in loadFeatureGates:', error)
    } finally {
      setFeatureGatesLoading(false)
    }
  }

  const checkFeatureAccess = (featureKey, options = {}) => {
    if (!featureGates || !featureGates.feature_gates) {
      console.log('⚠️ Feature gates not loaded, defaulting to restricted')
      return { hasAccess: false, reason: 'feature_gates_not_loaded' }
    }

    const feature = featureGates.feature_gates[featureKey]
    if (!feature) {
      console.log(`⚠️ Feature '${featureKey}' not found in configuration`)
      return { hasAccess: false, reason: 'feature_not_configured' }
    }

    // Check if feature is enabled
    if (!feature.is_enabled) {
      return { hasAccess: false, reason: 'feature_disabled', message: 'This feature is currently disabled' }
    }

    // Check tier requirement
    const tierOrder = { 'free': 0, 'roadie': 1, 'hero': 2 }
    const userTier = userPlan || 'free'
    const requiredTier = feature.min_tier || 'free'
    
    if (tierOrder[userTier] < tierOrder[requiredTier]) {
      const message = feature.messages?.tier_restriction || 
        `Requires ${requiredTier.toUpperCase()} Plan or higher`
      return { 
        hasAccess: false, 
        reason: 'tier_restriction', 
        message,
        upgradeButton: feature.upgrade_button
      }
    }

    // Check video playing restriction
    if (options.checkVideoPlaying && feature.video_restricted && isVideoPlaying()) {
      const message = feature.messages?.video_playing || 
        featureGates.global_settings?.video_playing_message || 
        'Please pause video before using this feature'
      return { 
        hasAccess: false, 
        reason: 'video_playing', 
        message 
      }
    }

    return { hasAccess: true }
  }

  const isVideoPlaying = () => {
    if (!player || !player.getPlayerState) return false
    const state = player.getPlayerState()
    // YouTube states: 1=playing, 2=paused, 3=buffering, 5=video cued
    return state === 1 || state === 3
  }

  const getFeatureRestrictionMessage = (featureKey, options = {}) => {
    const access = checkFeatureAccess(featureKey, options)
    if (access.hasAccess) return null
    
    return {
      message: access.message,
      reason: access.reason,
      upgradeButton: access.upgradeButton
    }
  }

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update user plan when profile loads
  useEffect(() => {
    if (profile && profile.subscription_tier) {
      setUserPlan(profile.subscription_tier)
      console.log('🔓 User plan updated:', profile.subscription_tier)
      
      // Check daily watch time limits after user plan is confirmed
      if (user?.id) {
        console.log('🔐 User plan confirmed - checking daily watch time limits')
        getDailyWatchTimeTotal().then(dailyMinutes => {
          if (dailyMinutes) {
            checkDailyWatchTimeLimits(parseFloat(dailyMinutes))
          }
        })
      }
    }
  }, [profile, user?.id])

  // Load feature gates configuration
  useEffect(() => {
    if (mounted && isAuthenticated) {
      loadFeatureGates()
    }
  }, [mounted, isAuthenticated])

  // Debug feature gates state
  useEffect(() => {
    if (featureGates) {
      console.log('🚪 Feature gates state updated:', {
        features: Object.keys(featureGates.feature_gates || {}),
        globalSettings: featureGates.global_settings,
        userTier: userPlan
      })
    }
  }, [featureGates, userPlan])

  // Track when user data becomes available
  useEffect(() => {
    console.log('👤 User data useEffect triggered:', { 
      hasUser: !!user, 
      userId: user?.id, 
      hasProfile: !!profile,
      loading,
      isAuthenticated
    })
  }, [user, profile, loading, isAuthenticated])

  // Load YouTube API script
  useEffect(() => {
    if (mounted && !window.YT) {
      console.log('📡 Loading YouTube iframe API...')
      setYoutubeAPILoading(true)
      setYoutubeAPIError(false)
      
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      
      // Add more detailed error handling
      tag.onerror = (error) => {
        console.error('❌ Failed to load YouTube iframe API:', error)
        console.error('❌ Error details:', { 
          error: error.message, 
          type: error.type,
          target: tag.src 
        })
        setYoutubeAPILoading(false)
        setYoutubeAPIError(true)
        handleYouTubeAPIError()
      }
      
      tag.onload = () => {
        console.log('✅ YouTube iframe API script loaded')
        setYoutubeAPILoading(false)
      }
      
      // Add timeout to detect hanging script loading
      const timeoutId = setTimeout(() => {
        if (!window.YT) {
          console.error('⏰ YouTube API script loading timeout - script may be hanging')
          setYoutubeAPILoading(false)
          setYoutubeAPIError(true)
        }
      }, 10000) // 10 second timeout
      
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
      
      // Cleanup timeout if script loads successfully
      if (window.YT) {
        clearTimeout(timeoutId)
      }
    } else if (mounted && window.YT) {
      console.log('✅ YouTube API already loaded')
    }
  }, [mounted])

  // Initialize YouTube player when API is ready
  useEffect(() => {
    if (mounted && videoId) {
      console.log('🎬 Initializing YouTube player for video:', videoId)
      
      const initPlayer = () => {
        if (window.YT && window.YT.Player) {
          console.log('✅ YouTube API ready, creating player...')
          const newPlayer = new window.YT.Player('youtube-player', {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
              controls: 1,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              fs: 0, // Disable YouTube's fullscreen button
              origin: window.location.origin
            },
            events: {
              onReady: (event) => handleVideoReady(event, newPlayer),
              onStateChange: (event) => handlePlayerStateChange(event),
              onError: handleVideoError
            }
          })
          
          // Store the player reference for later use
          console.log('⏳ Player created, waiting for onReady event...')
        } else {
          console.log('⚠️ YouTube API not ready yet, waiting...')
        }
      }

      // Check if API is already loaded
      if (window.YT && window.YT.Player) {
        console.log('🚀 YouTube API already loaded, initializing immediately')
        initPlayer()
      } else {
        // Wait for API to be ready
        console.log('⏳ Setting up YouTube API ready callback...')
        window.onYouTubeIframeAPIReady = () => {
          console.log('🎉 YouTube API ready callback triggered!')
          initPlayer()
        }
      }
    }
  }, [mounted, videoId])

  // Load video from URL parameters when page loads
  useEffect(() => {
    console.log('🔍 Video loading useEffect triggered:', { 
      mounted, 
      routerIsReady: router.isReady, 
      routerQuery: router.query,
      hasVideoId: !!router.query?.v,
      videoId: router.query?.v,
      title: router.query?.title,
      channel: router.query?.channel,
      currentUrl: window.location.href,
      pathname: router.pathname,
      asPath: router.asPath
    })
    
    // Try to get video data from URL if router isn't ready yet
    if (mounted && !router.isReady) {
      console.log('🔍 Router not ready, trying to parse URL manually...')
      const urlParams = new URLSearchParams(window.location.search)
      const v = urlParams.get('v')
      const title = urlParams.get('title')
      const channel = urlParams.get('channel')
      
      if (v) {
        console.log('✅ Got video data from URL manually:', { v, title, channel })
        setVideoId(v)
        setVideoTitle(title ? decodeURIComponent(title) : '')
        setVideoChannel(channel ? decodeURIComponent(channel) : '')
        setIsVideoReady(true)
      } else {
        console.log('❌ No video ID in URL, redirecting to home')
        router.push('/')
      }
    } else if (mounted && router.isReady) {
      const { v, title, channel } = router.query
      if (v && typeof v === 'string') {
        console.log('✅ Setting video data from router:', { v, title, channel })
        setVideoId(v)
        setVideoTitle(title ? decodeURIComponent(title) : '')
        setVideoChannel(channel ? decodeURIComponent(channel) : '')
        setIsVideoReady(true)
        
        // Query daily watch time total when video loads
        if (user?.id) {
          console.log('📊 Video loaded - querying daily watch time total')
          getDailyWatchTimeTotal()
        }
      } else {
        console.log('❌ No video ID provided, redirecting to home')
        // No video ID provided, redirect to home
        router.push('/')
      }
    } else {
      console.log('⏳ Video loading conditions not met:', { mounted, routerIsReady: router.isReady })
    }
  }, [mounted, router.isReady, router.query])

  // Fallback: Check URL immediately when component mounts
  useEffect(() => {
    if (mounted) {
      console.log('🔍 Fallback: Checking URL immediately on mount...')
      const urlParams = new URLSearchParams(window.location.search)
      const v = urlParams.get('v')
      const title = urlParams.get('title')
      const channel = urlParams.get('channel')
      
      if (v && !videoId) {
        console.log('✅ Fallback: Setting video data from URL:', { v, title, channel })
        setVideoId(v)
        setVideoTitle(title ? decodeURIComponent(title) : '')
        setVideoChannel(channel ? decodeURIComponent(channel) : '')
        setIsVideoReady(true)
      }
    }
  }, [mounted, videoId])

  // Check if video is favorited when video loads or user changes
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (videoId && user?.id) {
        const isFavorited = await checkIfVideoFavorited(videoId)
        setIsVideoFavorited(isFavorited)
        console.log('⭐ Favorite status checked:', isFavorited)
      }
    }
    
    checkFavoriteStatus()
  }, [videoId, user?.id])

  // Load captions when video loads or user changes
  useEffect(() => {
    const loadVideoCaptions = async () => {
      console.log('🔄 Caption loading effect triggered:', { videoId, userId: user?.id, isVideoFavorited })
      
      if (videoId && user?.id && isVideoFavorited) {
        console.log('📝 Loading captions for video:', videoId)
        const videoCaptions = await loadCaptions(videoId)
        console.log('📝 Captions loaded:', videoCaptions)
        setCaptions(videoCaptions)
        console.log('📝 Captions set in state:', videoCaptions.length)
      } else {
        console.log('📝 Clearing captions - conditions not met:', { videoId, userId: user?.id, isVideoFavorited })
        setCaptions([])
      }
    }
    
    loadVideoCaptions()
  }, [videoId, user?.id, isVideoFavorited])

  // Automatic watch time tracking
  useEffect(() => {
    console.log('🔄 Watch time tracking useEffect EXECUTED', {
      timestamp: Date.now(),
      playerReady: isPlayerReady(),
      isTracking: isTrackingWatchTime,
      hasWatchStartTime: !!watchStartTime,
      executionCount: (useEffect.executionCount || 0) + 1
    })
    
    // Track execution count
    useEffect.executionCount = (useEffect.executionCount || 0) + 1
    
    if (!player || !isPlayerReady() || !user?.id || !videoId || !videoChannel) {
      console.log('⏸️ Watch time tracking paused - conditions not met:', {
        hasPlayer: !!player,
        playerReady: isPlayerReady(),
        hasUser: !!user?.id,
        hasVideoId: !!videoId,
        hasChannel: !!videoChannel
      })
      return
    }

    // Set up polling to check player state
    const checkPlayerState = () => {
      try {
        if (!player || !isPlayerReady()) return
        
        const playerState = player.getPlayerState()
        console.log('🎮 Player state check:', {
          state: playerState,
          isTracking: isTrackingWatchTime,
          hasStartTime: !!watchStartTime,
          timestamp: Date.now()
        })
        
        if (playerState === 1 && !isTrackingWatchTime) { // Playing
          console.log('▶️ Starting watch time tracking...')
          const startTime = startWatchTimeTracking()
          setWatchStartTime(startTime)
          setIsTrackingWatchTime(true)
        } else if ((playerState === 2 || playerState === 0) && isTrackingWatchTime && watchStartTime) { // Paused or Ended
          console.log('⏸️ Stopping watch time tracking...')
          stopWatchTimeTracking(watchStartTime)
          setWatchStartTime(null)
          setIsTrackingWatchTime(false)
        }
      } catch (error) {
        console.log('⚠️ Error checking player state:', error)
      }
    }

    // Check player state every 2 seconds
    const intervalId = setInterval(checkPlayerState, 2000)

    // Cleanup function
    return () => {
      clearInterval(intervalId)
      if (isTrackingWatchTime && watchStartTime) {
        stopWatchTimeTracking(watchStartTime)
      }
    }
  }, [player, user?.id, videoId, videoChannel, isTrackingWatchTime, watchStartTime])





  // Handle login/logout
  const handleAuthClick = async () => {
    if (isAuthenticated) {
      try {
        await signOut()
        setShowAuthModal(false)
        setShowRightMenuModal(false)
      } catch (error) {
        console.error('Sign out failed:', error)
      }
    } else {
      setShowAuthModal(true)
    }
  }

  // Video player functions
  const handleVideoReady = (event, playerInstance) => {
    setIsVideoReady(true)
    console.log('🎥 YouTube player ready and methods available')
    
    // Set the fully ready player in state
    if (playerInstance) {
      console.log('✅ Setting fully ready player in state...')
      setPlayer(playerInstance)
    } else {
      console.log('⚠️ No player instance provided to handleVideoReady')
    }
  }

  const handleVideoError = (error) => {
    console.error('Video error:', error)
    // Handle video loading errors
  }

  // Handle YouTube player state changes - Global event handler for all play/pause actions
  const handlePlayerStateChange = (event) => {
    console.log('🎮 YouTube player state changed:', event.data)
    
    // YouTube player states:
    // -1: UNSTARTED, 0: ENDED, 1: PLAYING, 2: PAUSED, 3: BUFFERING, 5: CUED
    
    // Log state changes for debugging (watch time tracking still works)
    if (event.data === 1) { // PLAYING
      console.log('▶️ Video started playing')
    } else if (event.data === 2) { // PAUSED
      console.log('⏸️ Video paused')
    } else if (event.data === 3) { // BUFFERING
      console.log('🔄 Video buffering')
    } else if (event.data === 5) { // CUED
      console.log('📋 Video cued')
    }
  }

  // Handle YouTube API loading errors
  const handleYouTubeAPIError = () => {
    console.error('❌ YouTube API failed to load')
    // Could show a retry button or fallback message
  }

  // Handle keyboard shortcuts for video control
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Spacebar for play/pause
      if (e.code === 'Space' && isPlayerReady()) {
        // Check if any input field is currently focused - disable video control if so
        if (document.activeElement && 
            (document.activeElement.tagName === 'INPUT' || 
             document.activeElement.tagName === 'TEXTAREA')) {
          console.log('🔤 Input field focused - spacebar video control disabled')
          return // Exit early, don't handle video control
        }
        
        e.preventDefault()
        console.log('🎯 Spacebar pressed, player state:', player)
        
        try {
          // Try to get player state first
          if (player.getPlayerState && typeof player.getPlayerState === 'function') {
            const playerState = player.getPlayerState()
            console.log('🎮 Player state:', playerState)
            
            if (playerState === 1) { // Playing
              player.pauseVideo()
              console.log('⏸️ Video paused')
            } else { // Paused or other states
              player.playVideo()
              console.log('▶️ Video playing')
              
              // Query daily watch time total only when starting from beginning (0:00)
              if (player.getCurrentTime && typeof player.getCurrentTime === 'function') {
                const currentTime = player.getCurrentTime()
                if (currentTime <= 1) { // Within 1 second of start (0:00)
                  console.log('🎯 Video starting from beginning (0:00) - querying daily watch time total')
                  getDailyWatchTimeTotal()
                } else {
                  console.log('⏭️ Video resuming from position:', currentTime, '- skipping daily total query')
                }
              }
            }
          } else {
            // Fallback: try to pause if we can't determine state
            console.log('⚠️ getPlayerState not available, trying fallback')
            if (player.pauseVideo && typeof player.pauseVideo === 'function') {
              player.pauseVideo()
              console.log('⏸️ Video paused (fallback)')
            }
          }
        } catch (error) {
          console.error('❌ Spacebar handler error:', error)
          // Final fallback: try to pause
          try {
            if (player.pauseVideo && typeof player.pauseVideo === 'function') {
              player.pauseVideo()
              console.log('⏸️ Video paused (final fallback)')
            }
          } catch (fallbackError) {
            console.error('💥 All fallbacks failed:', fallbackError)
          }
        }
      }
      
      // F11 for fullscreen toggle
      if (e.code === 'F11') {
        e.preventDefault()
        handleFullscreenToggle()
      }
      
      // Escape to exit fullscreen
      if (e.code === 'Escape' && isFullscreen) {
        handleFullscreenToggle()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [player, isVideoReady, isFullscreen])

  // Check if player is fully ready with all methods available
  const isPlayerReady = () => {
    const result = player && 
           player.getPlayerState && 
           typeof player.getPlayerState === 'function' &&
           player.playVideo && 
           typeof player.playVideo === 'function' &&
           player.pauseVideo && 
           typeof player.pauseVideo === 'function'
    

    
    return result
  }

  // Check if user can access loop functionality
  const canAccessLoops = () => {
    const hasAccess = userPlan !== 'free' && isVideoFavorited
    console.log('🔐 Access check:', { userPlan, isVideoFavorited, hasAccess })
    return hasAccess
  }

  // Handle control strips toggle - SIMPLIFIED
  const handleControlStripsToggle = () => {
    // Check daily watch time limits before allowing control strips feature
    if (!checkDailyLimitForFeature()) {
      console.log('🚫 Control Strips access blocked - daily limit exceeded')
      return
    }
    
    const newState = !showControlStrips
    console.log('🔘 Toggle clicked! Current state:', showControlStrips, 'New state:', newState)
    
    if (newState) {
      // When showing control strips, ensure ALL rows are visible for smallest video size
      setShowRow1(true)
      setShowRow2(true)
      setShowRow3(true)
    }
    
    setShowControlStrips(newState)
  }

  // Handle individual row hide/show
  const handleRowToggle = (rowNumber) => {
    switch(rowNumber) {
      case 1:
        setShowRow1(false)
        break
      case 2:
        setShowRow2(false)
        break
      case 3:
        setShowRow3(false)
        break
      default:
        break
    }
  }

  // Handle show all rows (reset)
  const handleShowAllRows = () => {
    setShowRow1(true)
    setShowRow2(true)
    setShowRow3(true)
  }

  // Handle favorite/unfavorite video
  const handleFavoriteToggle = async () => {
    if (isVideoFavorited) {
      // Show warning before unfavoriting
      setShowUnfavoriteWarning(true)
    } else {
      // Add to favorites
      try {
        const videoData = {
          videoId,
          videoTitle,
          videoChannel,
          videoThumbnail: '', // TODO: Get from YouTube API
          videoDuration: 0 // TODO: Get from YouTube API
        }
        
        const savedFavorite = await saveFavorite(videoData)
        if (savedFavorite) {
          setIsVideoFavorited(true)
          console.log('✅ Video saved to favorites in database')
        } else {
          console.error('❌ Failed to save favorite to database')
        }
      } catch (error) {
        console.error('❌ Error in handleFavoriteToggle:', error)
        setDbError('Failed to save favorite')
      }
    }
  }

  // Handle unfavorite confirmation
  const handleUnfavoriteConfirm = async () => {
    try {
      const removed = await removeFavorite(videoId)
      if (removed) {
        setIsVideoFavorited(false)
        setShowUnfavoriteWarning(false)
        
        // Wipe loop data from Supabase
        console.log('🗑️ Wiping loop data for unfavorited video')
        // TODO: Delete loop records from Supabase
        
        // Reset loop state
        setIsLoopActive(false)
        setLoopStartTime('0:00')
        setLoopEndTime('0:00')
        
        console.log('✅ Favorite removed from database')
      } else {
        console.error('❌ Failed to remove favorite from database')
        setDbError('Failed to remove favorite')
      }
    } catch (error) {
      console.error('❌ Error in handleUnfavoriteConfirm:', error)
      setDbError('Failed to remove favorite')
    }
  }

  // Handle unfavorite cancel
  const handleUnfavoriteCancel = () => {
    setShowUnfavoriteWarning(false)
  }

  // Handle caption edit click with access control
  const handleCaptionEditClick = (rowNumber) => {
    // Check if user can access captions (same as loops)
    if (!canAccessLoops()) {
      if (userPlan === 'free') {
        alert('🔒 Captions require a paid plan. Please upgrade to access this feature.')
        return
      }
      if (!isVideoFavorited) {
        alert('⭐ Please save this video to favorites before editing captions.')
        return
      }
      return
    }

    // Open caption edit modal for the specific row
    console.log(`📝 Opening caption editor for row ${rowNumber}`)
    setShowCaptionModal(true)
    setEditingCaption({ rowType: rowNumber, rowName: rowNumber === 1 ? 'Text Captions' : rowNumber === 2 ? 'Chords Captions' : 'Auto-Gen' })
  }

  // Handle entering caption editing mode
  const handleEnterCaptionMode = (mode, captionId = null) => {
    // Store current loop state if active
    if (isLoopActive) {
      setTempLoopStart(loopStartTime)
      setTempLoopEnd(loopEndTime)
      setIsLoopActive(false)
      console.log('🔄 Loop paused and stored:', { start: loopStartTime, end: loopEndTime })
    }
    
    // Store original caption state if editing existing caption
    if (captionId && mode === 'edit') {
      const existingCaption = captions.find(c => c.id === captionId)
      if (existingCaption) {
        setOriginalCaptionState({ ...existingCaption })
        console.log('💾 Original caption state stored:', existingCaption)
      }
    }
    
    // Enter caption mode
    setIsInCaptionMode(true)
    setEditingCaptionId(captionId)
    console.log('📝 Entering caption mode:', { mode, captionId })
  }

  // Handle saving caption changes and exiting edit mode
  const handleSaveCaptionChanges = async () => {
    if (editingCaptionId) {
      const captionToUpdate = captions.find(c => c.id === editingCaptionId)
      if (captionToUpdate) {
        try {
          // Update caption in database
          const updatedCaption = await updateCaption(editingCaptionId, {
            startTime: tempLoopStart,
            endTime: tempLoopEnd,
            line1: captionToUpdate.line1,
            line2: captionToUpdate.line2
          })
          
          if (updatedCaption) {
            // Update local state with database response
            setCaptions(prev => prev.map(caption => 
              caption.id === editingCaptionId 
                ? { ...caption, startTime: tempLoopStart, endTime: tempLoopEnd }
                : caption
            ))
            console.log('💾 Caption changes saved to database and exiting edit mode:', { id: editingCaptionId, start: tempLoopStart, end: tempLoopEnd })
          } else {
            console.error('❌ Failed to save caption changes to database')
            return // Don't exit edit mode if save failed
          }
        } catch (error) {
          console.error('❌ Error saving caption changes:', error)
          return // Don't exit edit mode if save failed
        }
      }
    }
    
    // Exit caption mode WITHOUT restoring loop state
    setIsInCaptionMode(false)
    setEditingCaptionId(null)
    console.log('📝 Exiting caption mode via SAVE button - loop remains inactive')
  }

  // Handle canceling caption changes and reverting to original state
  const handleCancelCaptionChanges = () => {
    console.log('🚫 CANCEL button clicked! Starting cancel process...')
    
    if (editingCaptionId) {
      // Find the current caption
      const currentCaption = captions.find(c => c.id === editingCaptionId)
      console.log('🔍 Current caption found:', currentCaption)
      
      if (currentCaption) {
        // Check if this was a newly added caption by checking if we have original state
        // If we have originalCaptionState, it means this was an existing caption being edited
        // If we don't have originalCaptionState, it means this was a newly added caption
        const isNewCaption = !originalCaptionState
        
        console.log('🔍 Caption type check:', { 
          isNewCaption, 
          hasOriginalState: !!originalCaptionState,
          captionId: currentCaption.id 
        })
        
        if (isNewCaption) {
          // Remove the newly added caption completely
          setCaptions(prev => prev.filter(caption => caption.id !== editingCaptionId))
          console.log('🗑️ Newly added caption removed:', editingCaptionId)
        } else {
          // Restore existing caption to original state
          setCaptions(prev => prev.map(caption => 
            caption.id === editingCaptionId 
              ? { ...originalCaptionState }
              : caption
          ))
          console.log('🔄 Existing caption restored to original state:', originalCaptionState)
        }
      }
    }
    
    // Clear original state and exit caption mode completely
    setOriginalCaptionState(null)
    setIsInCaptionMode(false)
    setEditingCaptionId(null)
    console.log('📝 Exiting caption mode via CANCEL button - all changes reverted')
  }

  // Handle exiting caption editing mode
  const handleExitCaptionMode = () => {
    // Save any pending caption changes
    if (editingCaptionId) {
      const captionToUpdate = captions.find(c => c.id === editingCaptionId)
      if (captionToUpdate) {
        // Update the caption with any changes made
        setCaptions(prev => prev.map(caption => 
          caption.id === editingCaptionId 
            ? { ...caption, startTime: tempLoopStart, endTime: tempLoopEnd }
            : caption
        ))
        console.log('💾 Caption changes saved:', { id: editingCaptionId, start: tempLoopStart, end: tempLoopEnd })
      }
    }
    
    // Restore loop state if it was active
    if (tempLoopStart && tempLoopEnd && !isLoopActive) {
      setLoopStartTime(tempLoopStart)
      setLoopEndTime(tempLoopEnd)
      setIsLoopActive(true)
      console.log('🔄 Loop restored:', { start: tempLoopStart, end: tempLoopEnd })
    }
    
    // Exit caption mode
    setIsInCaptionMode(false)
    setEditingCaptionId(null)
    console.log('📝 Exiting caption mode')
  }

  // Handle adding new caption from timeline
  const handleAddCaptionFromTimeline = () => {
    if (!canAccessLoops()) {
      if (userPlan === 'free') {
        alert('🔒 Captions require a paid plan. Please upgrade to access this feature.')
        return
      }
      if (!isVideoFavorited) {
        alert('⭐ Please save this video to favorites before editing captions.')
        return
      }
      return
    }

    // Calculate start time based on existing captions
    let startTime = 0
    let endTime = 5
    
    if (captions.length > 0) {
      // Find the caption with the latest end time
      const lastCaption = captions.reduce((latest, current) => {
        const latestEnd = timeToSeconds(latest.endTime)
        const currentEnd = timeToSeconds(current.endTime)
        return currentEnd > latestEnd ? current : latest
      })
      
      // Start time = 1 second after the last caption ends
      startTime = timeToSeconds(lastCaption.endTime) + 1
      endTime = startTime + 5
      
      console.log('📅 Last caption ends at:', lastCaption.endTime, '→ New caption starts at:', startTime, 'seconds')
    } else {
      // No existing captions, use current video time
      if (player && isPlayerReady()) {
        try {
          startTime = Math.floor(player.getCurrentTime())
          endTime = startTime + 5
          console.log('🎬 No existing captions, using current video time:', startTime, 'seconds')
        } catch (error) {
          console.error('Error getting current time:', error)
          startTime = 0
          endTime = 5
        }
      } else {
        console.log('⚠️ Player not ready, using default time')
        startTime = 0
        endTime = 5
      }
    }

    // Convert seconds to MM:SS format
    const startMinutes = Math.floor(startTime / 60)
    const startSeconds = startTime % 60
    const endMinutes = Math.floor(endTime / 60)
    const endSeconds = endTime % 60
    
    const startTimeString = `${startMinutes}:${startSeconds.toString().padStart(2, '0')}`
    const endTimeString = `${endMinutes}:${endSeconds.toString().padStart(2, '0')}`
    
    console.log('⏰ New caption time range:', { start: startTimeString, end: endTimeString })

    // Create new caption with calculated times
    const newCaption = {
      id: Date.now(),
      startTime: startTimeString,
      endTime: endTimeString,
      line1: '',
      line2: '',
      rowType: editingCaption?.rowType || 1
    }

    console.log('📝 New caption created:', newCaption)

    // Add to captions array
    setCaptions(prev => {
      const newCaptions = [...prev, newCaption]
      console.log('📋 Updated captions array:', newCaptions)
      return newCaptions
    })
    
    // Don't close modal, just add the caption
    console.log('✅ Caption added successfully')
  }

  // Handle adding new caption from control strip
  const handleAddCaptionFromControlStrip = async (rowNumber) => {
    if (!canAccessLoops()) {
      if (userPlan === 'free') {
        alert('🔒 Captions require a paid plan. Please upgrade to access this feature.')
        return
      }
      if (!isVideoFavorited) {
        alert('⭐ Please save this video to favorites before editing captions.')
        return
      }
      return
    }

    // Check if video is playing
    if (player && isPlayerReady()) {
      try {
        const playerState = player.getPlayerState()
        if (playerState === 1) { // Playing
          console.log('⏸️ Cannot add caption while video is playing')
          return
        }
      } catch (error) {
        console.error('Error checking player state:', error)
      }
    }

    // Enter caption mode
    handleEnterCaptionMode('add', null)
    
    // Get current video time
    let currentTime = 0
    if (player && isPlayerReady()) {
      try {
        currentTime = Math.floor(player.getCurrentTime())
      } catch (error) {
        console.error('Error getting current time:', error)
      }
    }

    // Check if there's a caption currently displayed at this time
    const currentCaption = captions.find(caption => {
      const start = timeToSeconds(caption.startTime)
      const end = timeToSeconds(caption.endTime)
      return currentTime >= start && currentTime <= end
    })

    if (currentCaption) {
      // Cut the existing caption - reduce end time to current time - 1 second
      const newEndTime = Math.max(0, currentTime - 1)
      const newEndTimeString = `${Math.floor(newEndTime / 60)}:${(newEndTime % 60).toString().padStart(2, '0')}`
      
      setCaptions(prev => prev.map(caption => 
        caption.id === currentCaption.id 
          ? { ...caption, endTime: newEndTimeString }
          : caption
      ))
      
      console.log('✂️ Cut existing caption end time to:', newEndTimeString)
    }

    // Add new caption starting at current time
    const startTimeString = `${Math.floor(currentTime / 60)}:${(currentTime % 60).toString().padStart(2, '0')}`
    const endTimeString = `${Math.floor((currentTime + 5) / 60)}:${((currentTime + 5) % 60).toString().padStart(2, '0')}`

    const newCaption = {
      startTime: startTimeString,
      endTime: endTimeString,
      line1: '',
      line2: '',
      rowType: rowNumber
    }

    // Save caption to database
    const savedCaption = await saveCaption(newCaption)
    if (savedCaption) {
      // Add to local state with database ID
      setCaptions(prev => [...prev, savedCaption])
      
      // Update footer fields to control this caption
      setTempLoopStart(startTimeString)
      setTempLoopEnd(endTimeString)
      
      // Set this as the editing caption
      setEditingCaptionId(savedCaption.id)
      
      console.log('📝 New caption saved to database:', savedCaption)
    } else {
      console.error('❌ Failed to save new caption to database')
      setDbError('Failed to save new caption')
    }
  }

  // Handle inline editing from control strip
  const handleInlineEditCaption = (rowNumber) => {
    if (!canAccessLoops()) {
      if (userPlan === 'free') {
        alert('🔒 Captions require a paid plan. Please upgrade to access this feature.')
        return
      }
      if (!isVideoFavorited) {
        alert('⭐ Please save this video to favorites before editing captions.')
        return
      }
      return
    }

    // Check if video is playing
    if (player && isPlayerReady()) {
      try {
        const playerState = player.getPlayerState()
        if (playerState === 1) { // Playing
          console.log('⏸️ Cannot edit caption while video is playing')
          return
        }
      } catch (error) {
        console.error('Error checking player state:', error)
      }
    }

    // Check if there are captions to edit
    if (captions.length === 0) {
      console.log('📝 No captions available to edit')
      return
    }

    // Find current caption at this time
    let currentTime = 0
    if (player && isPlayerReady()) {
      try {
        currentTime = Math.floor(player.getCurrentTime())
      } catch (error) {
        console.error('Error getting current time:', error)
      }
    }

    const currentCaption = captions.find(caption => {
      const start = timeToSeconds(caption.startTime)
      const end = timeToSeconds(caption.endTime)
      return currentTime >= start && currentTime <= end
    })

    if (!currentCaption) {
      console.log('📝 No caption currently displayed at this time')
      return
    }

    // Enter caption mode for editing
    handleEnterCaptionMode('edit', currentCaption.id)
    
    // Update footer fields to control this caption
    setTempLoopStart(currentCaption.startTime)
    setTempLoopEnd(currentCaption.endTime)
    
    console.log('✏️ Entering inline edit mode for caption:', currentCaption)
  }

  // Handle saving captions
  const handleSaveCaptions = () => {
    // Sort captions by start time
    const sortedCaptions = [...captions].sort((a, b) => {
      const aStart = timeToSeconds(a.startTime)
      const bStart = timeToSeconds(b.startTime)
      return aStart - bStart
    })

    // Check for time overlaps and find the conflicting row
    let hasOverlap = false
    let conflictIndex = -1
    
    for (let i = 0; i < sortedCaptions.length - 1; i++) {
      const current = sortedCaptions[i]
      const next = sortedCaptions[i + 1]
      
      const currentEnd = timeToSeconds(current.endTime)
      const nextStart = timeToSeconds(next.startTime)
      
      if (currentEnd > nextStart) {
        hasOverlap = true
        // Highlight the LOWER row (next one) that's causing the conflict
        conflictIndex = i + 1
        break
      }
    }

    if (hasOverlap) {
      // Find the actual index in the original array for highlighting
      const conflictCaption = sortedCaptions[conflictIndex]
      const originalIndex = captions.findIndex(c => c.id === conflictCaption.id)
      
      // Set the conflict index for highlighting
      setConflictRowIndex(originalIndex)
      
      alert(`❌ Time overlap detected! Row ${conflictIndex + 1} conflicts with the previous row. Please fix overlapping start/end times before saving.`)
      return
    }

    // Clear any previous conflict highlighting
    setConflictRowIndex(-1)

    // TODO: Save to Supabase
    console.log('💾 Saving captions:', sortedCaptions)
    
    // Update local state with sorted captions
    setCaptions(sortedCaptions)
    
    // Close modal
    setShowCaptionModal(false)
    setEditingCaption(null)
    setIsAddingNewCaption(false)
  }

  // Handle canceling caption editing
  const handleCancelCaptions = () => {
    setShowCaptionModal(false)
    setIsAddingNewCaption(false)
    setEditingCaption(null)
    // TODO: Revert to original captions
  }

  // Handle delete caption confirmation
  const handleDeleteCaption = (captionIndex) => {
    setCaptionToDelete(captionIndex)
    setShowDeleteConfirm(true)
  }

  // Confirm caption deletion
  const handleConfirmDelete = async () => {
    if (captionToDelete !== null) {
      try {
        const captionToDeleteObj = captions[captionToDelete]
        if (captionToDeleteObj?.id) {
          const deleted = await deleteCaption(captionToDeleteObj.id)
          if (deleted) {
            const newCaptions = captions.filter((_, i) => i !== captionToDelete)
            setCaptions(newCaptions)
            setCaptionToDelete(null)
            setShowDeleteConfirm(false)
            console.log('🗑️ Caption deleted from database')
          } else {
            console.error('❌ Failed to delete caption from database')
            setDbError('Failed to delete caption')
          }
        } else {
          // Fallback for captions without database IDs
          const newCaptions = captions.filter((_, i) => i !== captionToDelete)
          setCaptions(newCaptions)
          setCaptionToDelete(null)
          setShowDeleteConfirm(false)
        }
      } catch (error) {
        console.error('❌ Error deleting caption:', error)
        setDbError('Failed to delete caption')
      }
    }
  }

  // Cancel caption deletion
  const handleCancelDelete = () => {
    setCaptionToDelete(null)
    setShowDeleteConfirm(false)
  }

  // Video flip handler - cycles through 3 states
  const handleFlipVideo = () => {
    // Check daily watch time limits before allowing flip feature
    if (!checkDailyLimitForFeature()) {
      console.log('🚫 Flip Video access blocked - daily limit exceeded')
      return
    }
    
    switch(flipState) {
      case 'normal':
        setFlipState('horizontal')
        break
      case 'horizontal':
        setFlipState('both')
        break
      case 'both':
        setFlipState('normal')
        break
      default:
        setFlipState('normal')
    }
  }

  // Loop modal handlers
  const handleLoopClick = () => {
    // Check daily watch time limits before allowing loop feature
    if (!checkDailyLimitForFeature()) {
      console.log('🚫 Loop access blocked - daily limit exceeded')
      return
    }
    
    // Check if user can access loops
    if (!canAccessLoops()) {
      if (userPlan === 'free') {
        alert('🔒 Loops require a paid plan. Please upgrade to access this feature.')
        return
      }
      if (!isVideoFavorited) {
        alert('⭐ Please save this video to favorites before creating loops.')
        return
      }
      return
    }

    if (isLoopActive) {
      // Stop the loop
      setIsLoopActive(false)
      console.log('🔄 Loop stopped')
    } else {
      // Open modal for configuration
      setTempLoopStart(loopStartTime)
      setTempLoopEnd(loopEndTime)
      setShowLoopModal(true)
    }
  }

  const handleLoopTimesClick = () => {
    // Check daily watch time limits before allowing loop feature
    if (!checkDailyLimitForFeature()) {
      console.log('🚫 Loop access blocked - daily limit exceeded')
      return
    }
    
    // Check if user can access loops
    if (!canAccessLoops()) {
      if (userPlan === 'free') {
        alert('🔒 Loops require a paid plan. Please upgrade to access this feature.')
        return
      }
      if (!isVideoFavorited) {
        alert('⭐ Please save this video to favorites before creating loops.')
        return
      }
      return
    }

    // Open modal directly when clicking on time display
    setTempLoopStart(loopStartTime)
    setTempLoopEnd(loopEndTime)
    setShowLoopModal(true)
  }

  const handleSaveLoop = () => {
    // Update the actual loop times
    setLoopStartTime(tempLoopStart)
    setLoopEndTime(tempLoopEnd)
    
    // Start the loop
    setIsLoopActive(true)
    
    // Close modal
    setShowLoopModal(false)
    
    console.log('🔄 Loop started:', { start: tempLoopStart, end: tempLoopEnd })
    
    // Debug: Log the converted seconds
    const startSeconds = timeToSeconds(tempLoopStart)
    const endSeconds = timeToSeconds(tempLoopEnd)
    console.log('🔄 Loop seconds:', { start: startSeconds, end: endSeconds })
    
    // CRITICAL: Jump to start time immediately when loop starts
    if (player && player.seekTo && typeof player.seekTo === 'function') {
      try {
        player.seekTo(startSeconds, true)
        console.log('🚀 Initial jump to start time:', startSeconds)
      } catch (error) {
        console.error('Initial seek error:', error)
      }
    }
  }

  const handleCancelLoop = () => {
    // Just close modal, don't start loop or update times
    setShowLoopModal(false)
    console.log('❌ Loop configuration cancelled')
  }

  // Convert time string (e.g., "1:23") to seconds
  const timeToSeconds = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') {
      console.warn('⚠️ timeToSeconds called with invalid value:', timeStr)
      return 0
    }
    
    const parts = timeStr.split(':').map(Number)
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]
    }
    return 0
  }

  // Check if video should loop (runs every second when loop is active)
  useEffect(() => {
    if (!isLoopActive || !player || !isPlayerReady()) return

    const loopInterval = setInterval(() => {
      try {
        if (player.getCurrentTime && typeof player.getCurrentTime === 'function') {
          const currentTime = player.getCurrentTime()
          const startSeconds = timeToSeconds(loopStartTime)
          const endSeconds = timeToSeconds(loopEndTime)
          
          // Debug: Log current loop status every 5 seconds
          if (Math.floor(currentTime) % 5 === 0) {
            console.log('🔄 Loop check:', { current: Math.floor(currentTime), start: startSeconds, end: endSeconds })
          }
          
          // If we've reached or passed the end time, loop back to start
          if (currentTime >= endSeconds) {
            if (player.seekTo && typeof player.seekTo === 'function') {
              player.seekTo(startSeconds, true)
              console.log('🔄 Looping back to:', startSeconds)
            }
          }
        }
      } catch (error) {
        console.error('Loop check error:', error)
      }
    }, 1000) // Check every second

    return () => clearInterval(loopInterval)
  }, [isLoopActive, player, loopStartTime, loopEndTime])

  // Effect to auto-sort captions by start time
  useEffect(() => {
    if (captions.length > 0) {
      const sortedCaptions = [...captions].sort((a, b) => {
        const timeA = timeToSeconds(a.startTime)
        const timeB = timeToSeconds(b.startTime)
        return timeA - timeB
      })
      
      // Only update if order actually changed
      const orderChanged = sortedCaptions.some((caption, index) => caption.id !== captions[index].id)
      if (orderChanged) {
        console.log('🔄 Auto-sorting captions by start time')
        setCaptions(sortedCaptions)
      }
    }
  }, [captions])

  // Effect to update displayed caption based on video time
  useEffect(() => {
    if (!player || !isPlayerReady() || captions.length === 0) return

    const captionUpdateInterval = setInterval(() => {
      try {
        const currentTime = player.getCurrentTime()
        // Force re-render to update displayed caption
        setCaptions(prev => [...prev])
      } catch (error) {
        console.error('Caption update error:', error)
      }
    }, 500) // Update every 500ms for smooth caption transitions

    return () => clearInterval(captionUpdateInterval)
  }, [player, captions.length])

  // Effect to update caption timing when footer fields change in caption mode
  useEffect(() => {
    if (isInCaptionMode && editingCaptionId && tempLoopStart && tempLoopEnd) {
      setCaptions(prev => prev.map(caption => 
        caption.id === editingCaptionId 
          ? { ...caption, startTime: tempLoopStart, endTime: tempLoopEnd }
          : caption
      ))
      console.log('⏰ Caption timing updated via footer:', { start: tempLoopStart, end: tempLoopEnd })
    }
  }, [tempLoopStart, tempLoopEnd, isInCaptionMode, editingCaptionId])

  // Fullscreen toggle handler
  const handleFullscreenToggle = async () => {
    try {
      if (!isFullscreen) {
        // Enter fullscreen
        const videoContainer = document.getElementById('video-container')
        if (videoContainer) {
          await videoContainer.requestFullscreen()
          setIsFullscreen(true)
          console.log('🎬 Entered fullscreen mode')
        }
      } else {
        // Exit fullscreen
        if (document.fullscreenElement) {
          await document.exitFullscreen()
          setIsFullscreen(false)
          console.log('🎬 Exited fullscreen mode')
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  if (!mounted || (loading && !router.isReady)) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="relative h-screen overflow-hidden bg-black">
      {/* Full-Screen Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/gt_splashBG_dark.png')`,
          width: '100%',
          height: '100%',
          minWidth: '100vw',
          minHeight: '100vh'
        }}
      />
      
      {/* 75% Black Overlay */}
      <div className="absolute inset-0 bg-black/75 z-0" />
      
      {/* Top Banner - Admin controlled */}
      <TopBanner />
      
      {/* Responsive Header - 3 rows on mobile, 1 row on desktop */}
      <header className="relative z-10 px-4 md:px-6 py-3 md:py-4 bg-black/80 md:bg-transparent">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
          {/* Row 1: Logo + Favorites (Left) + Auth Buttons (Right) - Mobile Only */}
          <div className="flex md:hidden justify-between items-center w-full">
            {/* Left side: Logo + Favorites */}
            <div className="flex items-center space-x-2">
              <a href="/?home=true" className="hover:opacity-80 transition-opacity">
                <img src="/images/gt_logoM_PlayButton.png" alt="VideoFlip Logo" className="h-8 w-auto" />
              </a>
              <button className="p-2 rounded-lg transition-colors duration-300 hover:bg-white/10" title="Show Favorites Only">
                <TbGuitarPickFilled className="w-8 h-8 text-[#8dc641]" />
              </button>
            </div>
            {/* Right side: Auth buttons + Search icon */}
            <div className="flex items-center space-x-2">
              <button onClick={handleAuthClick} className="p-2 rounded-lg transition-all duration-200 relative group text-white hover:bg-white/10 hover:scale-105" title={isAuthenticated ? "End of the Party" : "Start Me Up"}>
                {isAuthenticated ? (<RiLogoutCircleRLine className="w-6 h-6 group-hover:text-yellow-400 transition-colors" />) : (<IoMdPower className="w-6 h-6 group-hover:text-green-400 transition-colors" />)}
              </button>
              <button onClick={() => setShowMobileSearch(!showMobileSearch)} className="p-2 rounded-lg transition-all duration-200 relative group text-white hover:bg-white/10 hover:scale-105" title="Search for videos">
                <FaSearch className="w-6 h-6 group-hover:text-yellow-400 transition-colors" />
              </button>
              <button onClick={() => setShowRightMenuModal(true)} className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors group">
                <FaHamburger className="w-6 h-6 group-hover:text-yellow-400 transition-colors" />
              </button>
            </div>
          </div>
          
          {/* Row 2: Search Bar - Mobile Only (Hidden by default) */}
          <div className={`flex md:hidden w-full transition-all duration-300 ease-in-out ${showMobileSearch ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'}`}>
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="how to play guitar" 
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 border border-white/20 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all" 
                style={{ borderRadius: '77px' }}
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-105">
                <FaSearch className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Desktop Layout - Hidden on Mobile */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Logo and Favorites Icon */}
            <div className="flex items-center space-x-4">
              <a href="/?home=true" className="hover:opacity-80 transition-opacity">
                <img src="/images/gt_logoM_PlayButton.png" alt="VideoFlip Logo" className="h-10 w-auto" />
              </a>
              <button className="p-2 rounded-lg transition-colors duration-300 hover:bg-white/10" title="Show Favorites Only">
                <TbGuitarPickFilled className="w-8 h-8 text-[#8dc641]" />
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="how to play guitar" 
                className="w-96 px-4 py-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 border border-white/20 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all" 
                style={{ borderRadius: '77px' }}
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-105">
                <FaSearch className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Desktop Right side buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <button onClick={handleAuthClick} className="p-2 rounded-lg transition-all duration-200 relative group text-white hover:bg-white/10 hover:scale-105" title={isAuthenticated ? "End of the Party" : "Start Me Up"}>
              {isAuthenticated ? (<RiLogoutCircleRLine className="w-6 h-6 group-hover:text-yellow-400 transition-colors" />) : (<IoMdPower className="w-6 h-6 group-hover:text-green-400 transition-colors" />)}
            </button>
            <button onClick={() => setShowRightMenuModal(true)} className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors group">
              <FaHamburger className="w-6 h-6 group-hover:text-yellow-400 transition-colors" />
            </button>
          </div>
        </div>
      </header>



      {/* Main Content Area - Theatre Mode Layout with Dynamic Height */}
      <div className="relative z-10 overflow-hidden px-6" style={{ 
        height: showControlStrips ? `calc(100vh - ${140 + (showRow1 ? 51.2 : 0) + (showRow2 ? 102.4 : 0) + (showRow3 ? 102.4 : 0)}px)` : 'calc(100vh - 135px)',
        transition: 'height 0.3s ease-in-out'
      }}>
        {/* Video Player Container - Edge-to-Edge Width with Dynamic Height */}
        <div id="video-container" className="w-full max-w-none h-full flex items-center justify-center">
          {/* YouTube Video Player - Theatre Mode with Dynamic Sizing */}
          {videoId && (
            <div className="relative w-full h-full bg-black rounded-lg overflow-hidden shadow-2xl">
              {/* Video Container - Dynamic height based on available space with flip transformations */}
              <div 
                className="relative w-full h-full transition-transform duration-300"
                style={{
                  // Calculate height to maintain 16:9 aspect ratio within available space
                  height: '100%',
                  maxHeight: '100%',
                  // Ensure video never exceeds container bounds
                  objectFit: 'contain',
                  // Apply flip transformations based on state
                  transform: flipState === 'horizontal' 
                    ? 'scaleX(-1)' 
                    : flipState === 'both'
                    ? 'scaleX(-1) scaleY(-1)'
                    : 'none'
                }}
              >
                {/* YouTube API Player */}
                <div id="youtube-player" className="w-full h-full" />
                
                {/* Fallback iframe if API fails */}
                {!player && (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1&rel=0&showinfo=0&origin=${window.location.origin}`}
                    title={videoTitle}
                    className="w-full h-full absolute inset-0"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )}
              </div>
              

            </div>
          )}
        </div>
      </div>

      {/* STICKY CONTROL STRIPS FOOTER */}
      {showControlStrips && (
        <div className="fixed bottom-16 left-0 right-0 z-40 h-64 bg-transparent px-4 md:px-6">
          {/* Control Strips Container - Dynamic positioning from bottom */}
          <div className="h-full relative">
            
            {/* Row 1: Text Captions - 20% height, positioned from bottom */}
            {showRow1 && (
              <div className={`absolute left-0 right-0 flex border-2 border-white rounded-t-lg overflow-hidden h-[20%] transition-all duration-300 ${
                showRow2 && showRow3 ? 'bottom-[80%]' : 
                showRow2 ? 'bottom-[40%]' : 
                showRow3 ? 'bottom-[40%]' : 'bottom-0'
              }`}>
              {/* Left Column - Main Content (92% width) */}
              <div className="w-[92%] p-2 bg-transparent border-r-2 border-white flex flex-col justify-center overflow-hidden">
                {/* Display current caption based on video time */}
                {(() => {
                  if (!player || captions.length === 0) {
                    return <span className="text-white text-sm font-medium">Text Captions</span>
                  }
                  
                  try {
                    const currentTime = player.getCurrentTime()
                    
                    const currentCaption = captions.find(caption => {
                      const start = timeToSeconds(caption.startTime)
                      const end = timeToSeconds(caption.endTime)
                      return currentTime >= start && currentTime <= end
                    })
                    
                    if (currentCaption) {
                      // Check if we're editing this caption inline
                      const isEditingThisCaption = isInCaptionMode && editingCaptionId === currentCaption.id
                      
                      if (isEditingThisCaption) {
                        return (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={currentCaption.line1}
                              onChange={(e) => {
                                setCaptions(prev => prev.map(caption => 
                                  caption.id === currentCaption.id 
                                    ? { ...caption, line1: e.target.value }
                                    : caption
                                ))
                              }}
                              className="w-full px-2 py-1 text-sm bg-white/20 text-white border border-white/30 rounded focus:border-blue-400 focus:outline-none"
                              placeholder="First line of caption"
                            />
                            <input
                              type="text"
                              value={currentCaption.line2}
                              onChange={(e) => {
                                setCaptions(prev => prev.map(caption => 
                                  caption.id === currentCaption.id 
                                    ? { ...caption, line2: e.target.value }
                                    : caption
                                ))
                              }}
                              className="w-full px-2 py-1 text-sm bg-white/20 text-white border border-white/30 rounded focus:border-blue-400 focus:outline-none"
                              placeholder="Second line of caption"
                            />
                          </div>
                        )
                      } else {
                        return (
                          <div className="text-white text-sm">
                            <div className="font-medium">{currentCaption.line1}</div>
                            {currentCaption.line2 && <div className="text-gray-300">{currentCaption.line2}</div>}
                          </div>
                        )
                      }
                    } else {
                      return <span className="text-white text-sm font-medium">Text Captions</span>
                    }
                  } catch (error) {
                    return <span className="text-white text-sm font-medium">Text Captions</span>
                  }
                })()}
              </div>
              {/* Middle Column - ADD + EDIT icons (4% width) */}
              <div className="w-[4%] p-2 bg-transparent border-r-2 border-white flex flex-col items-center justify-center space-y-3">
                <button 
                  onClick={() => handleAddCaptionFromControlStrip(1)}
                  className={`transition-opacity cursor-pointer ${
                    isInCaptionMode 
                      ? 'opacity-30 cursor-not-allowed' 
                      : 'hover:opacity-70'
                  }`}
                  title={isInCaptionMode ? "Disabled while editing" : "Add new caption at current time"}
                  disabled={isInCaptionMode}
                >
                  <FaPlus className="w-4 h-4 text-white" />
                </button>
                <button 
                  onClick={() => handleInlineEditCaption(1)}
                  className={`transition-colors cursor-pointer ${
                    isInCaptionMode 
                      ? 'text-green-400' 
                      : 'text-white hover:opacity-70'
                  }`}
                  title={isInCaptionMode ? "Currently editing captions" : "Edit caption inline"}
                  disabled={isInCaptionMode}
                >
                  <FaRegEdit className="w-4 h-4" />
                </button>
              </div>
              {/* Right Column - EYE + CgViewList icons (4% width) */}
              <div className="w-[4%] p-2 bg-transparent flex flex-col items-center justify-center space-y-2">
                <button 
                  onClick={() => !isInCaptionMode && handleRowToggle(1)}
                  className={`transition-opacity cursor-pointer ${
                    isInCaptionMode 
                      ? 'opacity-30 cursor-not-allowed' 
                      : 'hover:opacity-70'
                  }`}
                  title={isInCaptionMode ? "Disabled while editing" : "Hide this row"}
                  disabled={isInCaptionMode}
                >
                  <FaRegEye className="w-5 h-5 text-white" />
                </button>
                <button 
                  onClick={() => !isInCaptionMode && handleCaptionEditClick(1)}
                  className={`transition-opacity cursor-pointer ${
                    isInCaptionMode 
                      ? 'opacity-30 cursor-not-allowed' 
                      : 'hover:opacity-70'
                  }`}
                  title={isInCaptionMode ? "Disabled while editing" : "Open caption editor modal"}
                  disabled={isInCaptionMode}
                >
                  <CgViewList className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            )}

            {/* Row 2: Chords Captions - 40% height, positioned from bottom */}
            {showRow2 && (
              <div className={`absolute left-0 right-0 flex border-l-2 border-r-2 border-white overflow-hidden h-[40%] transition-all duration-300 ${
                showRow3 ? 'bottom-[40%]' : 'bottom-0'
              }`}>
              {/* Left Column - Main Content (92% width) */}
              <div className="w-[92%] p-2 bg-transparent border-r-2 border-white flex items-center">
                <span className="text-white text-sm font-medium">Chords Captions</span>
              </div>
              {/* Middle Column - ADD + EDIT icons (4% width) */}
              <div className="w-[4%] p-2 bg-transparent border-r-2 border-white flex flex-col items-center justify-center space-y-3">
                <button 
                  onClick={() => handleAddCaptionFromControlStrip(2)}
                  className={`transition-opacity cursor-pointer ${
                    isInCaptionMode 
                      ? 'opacity-30 cursor-not-allowed' 
                      : 'hover:opacity-70'
                  }`}
                  title={isInCaptionMode ? "Disabled while editing" : "Add new caption at current time"}
                  disabled={isInCaptionMode}
                >
                  <FaPlus className="w-4 h-4 text-white" />
                </button>
                <button 
                  onClick={() => handleInlineEditCaption(2)}
                  className={`transition-colors cursor-pointer ${
                    isInCaptionMode 
                      ? 'text-green-400' 
                      : 'text-white hover:opacity-70'
                  }`}
                  title={isInCaptionMode ? "Currently editing captions" : "Edit caption inline"}
                  disabled={isInCaptionMode}
                >
                  <FaRegEdit className="w-4 h-4" />
                </button>
              </div>
              {/* Right Column - EYE + CgViewList icons (4% width) */}
              <div className="w-[4%] p-2 bg-transparent flex flex-col items-center justify-center space-y-2">
                <button 
                  onClick={() => !isInCaptionMode && handleRowToggle(2)}
                  className={`transition-opacity cursor-pointer ${
                    isInCaptionMode 
                      ? 'opacity-30 cursor-not-allowed' 
                      : 'hover:opacity-70'
                  }`}
                  title={isInCaptionMode ? "Disabled while editing" : "Hide this row"}
                  disabled={isInCaptionMode}
                >
                  <FaRegEye className="w-5 h-5 text-white" />
                </button>
                <button 
                  onClick={() => !isInCaptionMode && handleCaptionEditClick(2)}
                  className={`transition-opacity cursor-pointer ${
                    isInCaptionMode 
                      ? 'opacity-30 cursor-not-allowed' 
                      : 'hover:opacity-70'
                  }`}
                  title={isInCaptionMode ? "Disabled while editing" : "Open caption editor modal"}
                  disabled={isInCaptionMode}
                >
                  <CgViewList className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            )}

            {/* Row 3: Auto-Gen - 40% height, always at bottom */}
            {showRow3 && (
              <div className="absolute bottom-0 left-0 right-0 flex border-2 border-white rounded-b-lg overflow-hidden h-[40%] transition-all duration-300">
              {/* Left Column - Main Content (92% width) */}
              <div className="w-[92%] p-2 bg-transparent border-r-2 border-white flex items-center">
                <span className="text-white text-sm font-medium">Auto-Gen</span>
              </div>
              {/* Middle Column - ADD + EDIT icons (4% width) */}
              <div className="w-[4%] p-2 bg-transparent border-r-2 border-white flex flex-col items-center justify-center space-y-3">
                <button 
                  onClick={() => handleAddCaptionFromControlStrip(3)}
                  className={`transition-opacity cursor-pointer ${
                    isInCaptionMode 
                      ? 'opacity-30 cursor-not-allowed' 
                      : 'hover:opacity-70'
                  }`}
                  title={isInCaptionMode ? "Disabled while editing" : "Add new caption at current time"}
                  disabled={isInCaptionMode}
                >
                  <FaPlus className="w-4 h-4 text-white" />
                </button>
                <button 
                  onClick={() => handleInlineEditCaption(3)}
                  className={`transition-colors cursor-pointer ${
                    isInCaptionMode 
                      ? 'text-gray-400' 
                      : 'text-white hover:opacity-70'
                  }`}
                  title={isInCaptionMode ? "Currently editing captions" : "Edit caption inline"}
                  disabled={isInCaptionMode}
                >
                  <FaRegEdit className="w-4 h-4" />
                </button>
              </div>
              {/* Right Column - EYE + CgViewList icons (4% width) */}
              <div className="w-[4%] p-2 bg-transparent flex flex-col items-center justify-center space-y-2">
                <button 
                  onClick={() => !isInCaptionMode && handleRowToggle(3)}
                  className={`transition-opacity cursor-pointer ${
                    isInCaptionMode 
                      ? 'opacity-30 cursor-not-allowed' 
                      : 'hover:opacity-70'
                  }`}
                  title={isInCaptionMode ? "Disabled while editing" : "Hide this row"}
                  disabled={isInCaptionMode}
                >
                  <FaRegEye className="w-5 h-5 text-white" />
                </button>
                <button 
                  onClick={() => !isInCaptionMode && handleCaptionEditClick(3)}
                  className={`transition-opacity cursor-pointer ${
                    isInCaptionMode 
                      ? 'opacity-30 cursor-not-allowed' 
                      : 'hover:opacity-70'
                  }`}
                  title={isInCaptionMode ? "Disabled while editing" : "Open caption editor modal"}
                  disabled={isInCaptionMode}
                >
                  <CgViewList className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            )}

          </div>
        </div>
      )}

      {/* PERMANENT FOOTER CONTROL AREA - NEVER DISAPPEARS */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-t border-white/20 p-1">
        <div className="grid grid-cols-3 max-w-7xl mx-auto h-full">
          
          {/* Left Column - Left-justified content with Video Controls */}
          <div className="flex items-center justify-start space-x-3 -ml-3 md:ml-0">
            {/* Flip Video Button - 3 States */}
            <button
              onClick={handleFlipVideo}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                flipState === 'normal' 
                  ? 'bg-white/10 text-white hover:bg-white/20' 
                  : flipState === 'horizontal'
                  ? 'bg-yellow-500/20 border border-yellow-400/50 text-yellow-400'
                  : 'bg-green-500/20 border border-green-400/50 text-green-400'
              }`}
              title={`Flip Video - Current: ${flipState === 'normal' ? 'Normal' : flipState === 'horizontal' ? 'Horizontal' : 'Both Directions'}`}
            >
              <MdFlipCameraAndroid className="w-5 h-5" />
            </button>

            {/* Loop Segment / Caption Mode Button */}
            <button
              onClick={isInCaptionMode ? undefined : handleLoopClick}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isInCaptionMode
                  ? 'bg-blue-600 text-white shadow-lg cursor-default' 
                  : isLoopActive 
                  ? 'bg-blue-600 text-white shadow-lg hover:scale-105' 
                  : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
              }`}
              title={isInCaptionMode ? "Caption Mode Active" : (isLoopActive ? "Stop loop" : "Configure loop segment")}
            >
              {isInCaptionMode ? (
                <IoText className="w-5 h-5" />
              ) : (
                <ImLoop className="w-5 h-5" />
              )}
            </button>







            {/* Loop Time Display / Caption Timing Fields */}
            <div className="flex flex-col items-start space-y-1">
              {/* Mode indicator */}
              {isInCaptionMode && (
                <span className="text-xs text-blue-400 font-medium">
                  Caption Timing
                </span>
              )}
              
              {isInCaptionMode ? (
                /* Editable caption timing fields with SAVE button */
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={tempLoopStart}
                    onChange={(e) => setTempLoopStart(e.target.value)}
                    className="w-16 px-2 py-1 text-xs bg-white/20 text-white border border-white/30 rounded focus:border-blue-400 focus:outline-none"
                    placeholder="0:00"
                  />
                  <span className="text-white text-xs">-</span>
                  <input
                    type="text"
                    value={tempLoopEnd}
                    onChange={(e) => setTempLoopEnd(e.target.value)}
                    className="w-16 px-2 py-1 text-xs bg-white/20 text-white border border-white/30 rounded focus:border-blue-400 focus:outline-none"
                    placeholder="0:00"
                  />
                  {/* SAVE button for caption changes */}
                  <button
                    onClick={handleSaveCaptionChanges}
                    className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                    title="Save caption changes and exit edit mode"
                  >
                    SAVE
                  </button>
                  {/* CANCEL button for caption changes */}
                  <button
                    onClick={() => {
                      console.log('🚫 CANCEL button clicked directly!')
                      handleCancelCaptionChanges()
                    }}
                    className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors ml-2 cursor-pointer z-10 relative border border-red-500"
                    title="Cancel all changes and revert to original state"
                    style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                    data-testid="cancel-button"
                  >
                    CANCEL
                  </button>
                </div>
              ) : (
                /* Read-only loop timing display */
                <button
                  onClick={handleLoopTimesClick}
                  className={`text-sm font-mono transition-colors cursor-pointer hover:opacity-80 ${
                    isLoopActive ? 'text-blue-400' : 'text-gray-300'
                  }`}
                  title="Click to edit loop times"
                >
                  {loopStartTime} - {loopEndTime}
                </button>
              )}
            </div>
          </div>

          {/* Middle Column - Center-justified content (Empty for spacing) */}
          <div className="flex items-center justify-center">
            {/* Empty - just for spacing */}
          </div>

          {/* Right Column - Right-justified content */}
          <div className="flex items-center justify-end mr-0 space-x-3">
            {/* Guitar Pick Favorites */}
            <button 
              onClick={handleFavoriteToggle}
              className={`p-2 rounded-lg transition-colors ${
                isVideoFavorited 
                  ? 'text-[#8dc641] bg-[#8dc641]/20' 
                  : 'text-gray-400 hover:text-[#8dc641] hover:bg-white/10'
              }`}
              title={isVideoFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <TbGuitarPickFilled className="w-6 h-6" />
            </button>
            
            {/* Control Strip Toggle (Game Controller) */}
            <button
              onClick={handleControlStripsToggle}
              className={`p-2 rounded-lg transition-colors ${
                showControlStrips 
                  ? 'bg-[#8dc641]/20 border border-[#8dc641]/30 text-[#8dc641]' 
                  : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
              }`}
              title={showControlStrips ? "Hide Control Strips" : "Show Control Strips"}
            >
              <IoGameControllerOutline className="w-5 h-5" />
            </button>
            
            {/* Layout Icon */}
            <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors" title="Layout Options">
              <BsReverseLayoutSidebarInsetReverse className="w-5 h-5" />
            </button>
            
            {/* Custom Fullscreen Button */}
            <button
              onClick={handleFullscreenToggle}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-105 bg-white/10 text-white hover:bg-white/20"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Menu Modal */}
      {showRightMenuModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRightMenuModal(false)
            }
          }}
        >
          <div className="bg-black rounded-2xl shadow-2xl max-w-md w-full relative text-white p-8">
            {/* Close Button */}
            <button
              onClick={() => setShowRightMenuModal(false)}
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors text-2xl font-bold"
            >
              ×
            </button>
            
            {/* Menu Content */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-4">Menu</h2>
            </div>
            
            <div className="space-y-4 text-gray-300">
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Go to Search
              </button>
              <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                Go to Features
              </button>
              <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                Go to Pricing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unfavorite Warning Modal */}
      {showUnfavoriteWarning && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUnfavoriteWarning(false)
            }
          }}
        >
          <div className="bg-black rounded-2xl shadow-2xl max-w-sm w-full relative text-white p-6">
            {/* Modal Content */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-4">⚠️ Remove from Favorites?</h2>
              <p className="text-gray-300 text-sm">
                Removing this favorite will also delete all user entered meta-data. This action cannot be undone. Proceed?
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleUnfavoriteCancel}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleUnfavoriteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                PROCEED
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Limit Upgrade Modal */}
      {showUpgradeModal && dailyLimitInfo && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUpgradeModal(false)
            }
          }}
        >
          <div className="bg-black rounded-2xl shadow-2xl max-w-md w-full relative text-white p-6">
            {/* Modal Content */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-4 text-red-400">⏰ Daily Limit Exceeded</h2>
              <p className="text-gray-300 text-sm mb-4">
                Sorry, you've exceeded your <span className="font-semibold text-blue-400">{dailyLimitInfo.userPlan.toUpperCase()}</span> plan daily watch limit.
              </p>
              <div className="bg-gray-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-300">
                  <span className="text-red-400">Used:</span> {dailyLimitInfo.dailyMinutes} minutes
                </p>
                <p className="text-sm text-gray-300">
                  <span className="text-green-400">Limit:</span> {dailyLimitInfo.userLimit} minutes
                </p>
              </div>
              <p className="text-gray-300 text-xs">
                Your daily limit resets at midnight. Upgrade your plan for more watch time!
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowUpgradeModal(false)
                  router.push('/pricing')
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                UPGRADE PLAN
              </button>
              <button
                onClick={() => {
                  setShowUpgradeModal(false)
                  router.push('/')
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                GO HOME
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteConfirm(false)
            }
          }}
        >
          <div className="bg-black rounded-2xl shadow-2xl max-w-sm w-full relative text-white p-6">
            {/* Modal Content */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-4">🗑️ Delete Caption?</h2>
              <p className="text-gray-300 text-sm">
                This action cannot be undone. Are you sure you want to delete this caption?
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Caption Editor Modal */}
      {showCaptionModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCaptionModal(false)
            }
          }}
        >
          <div className="bg-black rounded-2xl shadow-2xl max-w-4xl w-full relative text-white p-6 max-h-[90vh] overflow-y-auto">
            {/* Add Caption Button - Upper Left */}
            <button
              onClick={handleAddCaptionFromTimeline}
              className="absolute top-4 left-4 z-20 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
              title="Add new caption at current time"
            >
              <FaPlus className="w-5 h-5" />
            </button>
            
            {/* Close Button */}
            <button
              onClick={handleCancelCaptions}
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors text-2xl font-bold"
            >
              ×
            </button>
            
            {/* Modal Header */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">
                {editingCaption?.rowName} Editor
              </h2>
              <p className="text-gray-300 text-sm">
                Manage your captions with start/stop times and content
              </p>
            </div>
            
            {/* Captions List */}
            <div className="space-y-4 mb-6">
              {captions.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>No captions yet. Use the + button on the video to add your first caption!</p>
                </div>
              ) : (
                captions.map((caption, index) => (
                  <div 
                    key={caption.id} 
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      conflictRowIndex === index 
                        ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20' 
                        : 'border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Start Time - 50% narrower */}
                      <div className="w-16">
                        <input
                          type="text"
                          value={caption.startTime}
                          onChange={(e) => {
                            const newCaptions = [...captions]
                            newCaptions[index].startTime = e.target.value
                            setCaptions(newCaptions)
                          }}
                          className="w-full px-2 py-1 text-sm bg-white/20 text-white border border-white/30 rounded focus:border-blue-400 focus:outline-none"
                          placeholder="Start"
                        />
                      </div>
                      
                      {/* End Time - 50% narrower */}
                      <div className="w-16">
                        <input
                          type="text"
                          value={caption.endTime}
                          onChange={(e) => {
                            const newCaptions = [...captions]
                            newCaptions[index].endTime = e.target.value
                            setCaptions(newCaptions)
                          }}
                          className="w-full px-2 py-1 text-sm bg-white/20 text-white border border-white/30 rounded focus:border-blue-400 focus:outline-none"
                          placeholder="End"
                        />
                      </div>
                      
                      {/* Caption Lines - Stacked and stretched */}
                      <div className="flex-1 space-y-2">
                        {/* Line 1 */}
                        <input
                          type="text"
                          value={caption.line1}
                          onChange={(e) => {
                            const newCaptions = [...captions]
                            newCaptions[index].line1 = e.target.value
                            setCaptions(newCaptions)
                          }}
                          className="w-full px-3 py-2 text-sm bg-white/20 text-white border border-white/30 rounded focus:border-blue-400 focus:outline-none"
                          placeholder="First line of caption"
                        />
                        
                        {/* Line 2 */}
                        <input
                          type="text"
                          value={caption.line2}
                          onChange={(e) => {
                            const newCaptions = [...captions]
                            newCaptions[index].line2 = e.target.value
                            setCaptions(newCaptions)
                          }}
                          className="w-full px-3 py-2 text-sm bg-white/20 text-white border border-white/30 rounded focus:border-blue-400 focus:outline-none"
                          placeholder="Second line of caption"
                        />
                      </div>
                      
                      {/* Delete Icon */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleDeleteCaption(index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg transition-colors"
                          title="Delete caption"
                        >
                          <TiDeleteOutline className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3 justify-end">
              <button
                onClick={handleCancelCaptions}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCaptions}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Save Captions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loop Configuration Modal */}
      {showLoopModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLoopModal(false)
            }
          }}
        >
          <div className="bg-black rounded-2xl shadow-2xl max-w-sm w-full relative text-white p-6">
            {/* Close Button */}
            <button
              onClick={handleCancelLoop}
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors text-2xl font-bold"
            >
              ×
            </button>
            
            {/* Modal Content */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-4">
                {isLoopActive ? 'Edit Loop Segment' : 'Configure Loop Segment'}
              </h2>
            </div>
            
            {/* Loop Time Inputs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-300 text-sm font-medium">Start Time:</label>
                <input
                  type="text"
                  value={tempLoopStart}
                  onChange={(e) => setTempLoopStart(e.target.value)}
                  placeholder="0:00"
                  className="w-20 px-3 py-2 text-sm bg-white/20 text-white border border-white/30 rounded focus:border-blue-400 focus:outline-none"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-gray-300 text-sm font-medium">End Time:</label>
                <input
                  type="text"
                  value={tempLoopEnd}
                  onChange={(e) => setTempLoopEnd(e.target.value)}
                  placeholder="0:00"
                  className="w-20 px-3 py-2 text-sm bg-white/20 text-white border border-white/30 rounded focus:border-blue-400 focus:outline-none"
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCancelLoop}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLoop}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {isLoopActive ? 'Update & Restart Loop' : 'Save & Start Loop'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}
    </div>
  )
}