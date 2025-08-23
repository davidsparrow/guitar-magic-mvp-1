// pages/search.js - Search Page with YouTube API Integration
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'
import SupportModal from '../components/SupportModal'
import MenuModal from '../components/MenuModal'
import Header from '../components/Header'
import { useRouter } from 'next/router'
import { searchVideos, formatDuration, formatViewCount, formatPublishDate, getBestThumbnail } from '../lib/youtube'

// Helper function to parse YouTube duration format (PT1M30S) to seconds
const parseDuration = (duration) => {
  if (!duration) return null
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return null
  const hours = parseInt(match[1] || 0)
  const minutes = parseInt(match[2] || 0) 
  const seconds = parseInt(match[3] || 0)
  return hours * 3600 + minutes * 60 + seconds
}
import TopBanner from '../components/TopBanner'
import { supabase } from '../lib/supabase'

export default function Search() {
  const { isAuthenticated, user, profile, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showMenuModal, setShowMenuModal] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [nextPageToken, setNextPageToken] = useState(null)
  const [sortOrder, setSortOrder] = useState('relevance')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [userFavorites, setUserFavorites] = useState([]) // This would be populated from your backend
  const [pendingVideo, setPendingVideo] = useState(null) // Store video for post-login navigation
  const [savedSession, setSavedSession] = useState(null) // Store saved video session data

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-search when page loads with query parameter
  useEffect(() => {
    if (mounted && router.isReady) {
      const { q } = router.query
      if (q && typeof q === 'string') {
        setSearchQuery(q)
        // Perform search directly with the URL query
        performSearchWithQuery(q)
      }
    }
  }, [mounted, router.isReady, router.query])

  // Handle post-login navigation to pending video
  useEffect(() => {
    if (isAuthenticated && pendingVideo && !loading) {
      // User just logged in and has a pending video
      const video = pendingVideo
      const videoId = video.id.videoId
      
      // Store video info for the player page
      localStorage.setItem('currentVideo', JSON.stringify({
        id: videoId,
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        description: video.snippet.description,
        thumbnails: video.snippet.thumbnails,
        publishedAt: video.snippet.publishedAt,
        statistics: video.statistics,
        contentDetails: video.contentDetails
      }))
      
      // Navigate to video player
      router.push(`/watch?v=${videoId}&title=${encodeURIComponent(video.snippet.title)}&channel=${encodeURIComponent(video.snippet.channelTitle)}`)
      
      // Clear pending video
      setPendingVideo(null)
    }
  }, [isAuthenticated, pendingVideo, loading, router])

  // Check for saved session when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id && !loading) {
      console.log('🔍 User authenticated, checking for saved session...')
      checkForSavedSession().then(sessionData => {
        setSavedSession(sessionData)
        console.log('💾 Saved session state updated:', sessionData ? 'Found' : 'None')
      })
      
      // Load user favorites from database
      loadUserFavorites()
    } else {
      // Clear saved session and favorites when user logs out
      setSavedSession(null)
      setUserFavorites([])
    }
  }, [isAuthenticated, user?.id, loading])

  // Handle login/logout
  const handleAuthClick = async () => {
    if (isAuthenticated) {
      try {
        await signOut()
        setShowAuthModal(false)
        setShowMenuModal(false)
      } catch (error) {
        console.error('Sign out failed:', error)
      }
    } else {
      setShowAuthModal(true)
    }
  }

  // Handle search
  const handleSearch = async (pageToken = null) => {
    if (!searchQuery.trim()) return

    if (pageToken) {
      setIsLoadingMore(true)
    } else {
      setIsSearching(true)
      setSearchError('')
    }

    try {
      const results = await searchVideos(searchQuery.trim(), {
        maxResults: 12, // Limit results per search
        pageToken: pageToken,
        order: sortOrder
      })

      if (pageToken) {
        // Append to existing results for load more
        setSearchResults(prev => [...prev, ...results.videos])
      } else {
        // Replace results for new search
        setSearchResults(results.videos)
        setHasSearched(true)
      }

      setNextPageToken(results.nextPageToken)

    } catch (error) {
      console.error('Search error:', error)
      setSearchError(error.message || 'Search failed. Please try again.')
    } finally {
      setIsSearching(false)
      setIsLoadingMore(false)
    }
  }

  // Perform search with direct query string (for auto-search from URL)
  const performSearchWithQuery = async (query) => {
    if (!query.trim()) return

    setIsSearching(true)
    setSearchError('')

    try {
      const results = await searchVideos(query.trim(), {
        maxResults: 12,
        pageToken: null,
        order: sortOrder
      })

      setSearchResults(results.videos)
      setHasSearched(true)
      setNextPageToken(results.nextPageToken)

    } catch (error) {
      console.error('Search error:', error)
      setSearchError(error.message || 'Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }



  // Load user favorites from database
  const loadUserFavorites = async () => {
    if (!user?.id) {
      console.log('❌ No user ID, cannot load favorites')
      return
    }

    try {
      console.log('🎯 Loading user favorites for user:', user.id)
      
      const { data: favorites, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Error loading favorites:', error)
        return
      }
      
      console.log('✅ Loaded favorites:', favorites?.length || 0, 'videos')
      setUserFavorites(favorites || [])
      
    } catch (error) {
      console.error('❌ Error loading favorites:', error)
    }
  }

  // Check for saved video session data
  const checkForSavedSession = async () => {
    if (!user?.id) {
      console.log('❌ No user ID, cannot check for saved session')
      return null
    }

    try {
      console.log('🔍 Checking for saved session data for user:', user.id)
      
      // Query the database for saved session data
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('last_video_id, last_video_timestamp, last_video_title, last_video_channel_name, last_session_date')
        .eq('id', user.id)
        .single()
      
      if (error) {
        console.log('⚠️ No saved session data found:', error.message)
        return null
      }
      
      if (profile?.last_video_id && profile?.last_video_timestamp) {
        console.log('🎯 Found saved session data:', {
          videoId: profile.last_video_id,
          timestamp: profile.last_video_timestamp,
          title: profile.last_video_title,
          channel: profile.last_video_channel_name,
          sessionDate: profile.last_session_date
        })
        return profile
      } else {
        console.log('📝 No saved session data found')
        return null
      }
    } catch (error) {
      console.error('❌ Error checking saved session:', error)
      return null
    }
  }

  // Handle load more
  const handleLoadMore = () => {
    if (nextPageToken && !isLoadingMore) {
      handleSearch(nextPageToken)
    }
  }

  // Handle video click
  const handleVideoClick = (video) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Show login modal for unauthenticated users
      setShowAuthModal(true)
      setPendingVideo(video) // Store the video for post-login navigation
      return
    }

    const videoId = video.id.videoId
    
    // Store video info for the player page
    localStorage.setItem('currentVideo', JSON.stringify({
      id: videoId,
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      description: video.snippet.description,
      thumbnails: video.snippet.thumbnails,
      publishedAt: video.snippet.publishedAt,
      statistics: video.statistics,
      contentDetails: video.contentDetails
    }))
    
    // Navigate to video player
    router.push(`/watch?v=${videoId}&title=${encodeURIComponent(video.snippet.title)}&channel=${encodeURIComponent(video.snippet.channelTitle)}`)
  }

  // Handle sort order change
  const handleSortChange = (newOrder) => {
    setSortOrder(newOrder)
    // Note: Sort only affects new searches, not existing results
  }

  // Handle favorites toggle
  const handleFavoritesToggle = () => {
    setShowFavoritesOnly(!showFavoritesOnly)
    console.log('🎯 Favorites filter toggled:', !showFavoritesOnly ? 'ON' : 'OFF')
  }

  // Handle video favorite toggle
  const handleVideoFavoriteToggle = async (video, isFavorited) => {
    if (!isAuthenticated || !user?.id) {
      console.log('❌ User not authenticated, cannot toggle favorite')
      return
    }

    try {
      if (isFavorited) {
        // Remove from favorites
        console.log('🗑️ Removing from favorites:', video.snippet.title)
        
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('video_id', video.id.videoId)
        
        if (error) {
          console.error('❌ Error removing favorite:', error)
          return
        }
        
        // Update local state
        setUserFavorites(prev => prev.filter(fav => fav.video_id !== video.id.videoId))
        console.log('✅ Removed from favorites')
        
      } else {
        // Add to favorites
        console.log('💝 Adding to favorites:', video.snippet.title)
        
        const favoriteData = {
          user_id: user.id,
          video_id: video.id.videoId,
          video_title: video.snippet.title,
          video_thumbnail: getBestThumbnail(video.snippet.thumbnails),
          video_channel: video.snippet.channelTitle,
          video_duration_seconds: video.contentDetails?.duration ? parseDuration(video.contentDetails.duration) : null,
          video_channel_id: video.snippet.channelId,
          is_public: false
        }
        
        const { data, error } = await supabase
          .from('favorites')
          .insert([favoriteData])
          .select()
        
        if (error) {
          console.error('❌ Error adding favorite:', error)
          return
        }
        
        // Update local state
        setUserFavorites(prev => [...prev, data[0]])
        console.log('✅ Added to favorites')
      }
    } catch (error) {
      console.error('❌ Error toggling favorite:', error)
    }
  }

  // Check if video is favorited
  const isVideoFavorited = (video) => {
    return userFavorites.some(fav => fav.video_id === video.id.videoId)
  }

  if (!mounted || (loading && !router.isReady)) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="relative h-screen overflow-hidden bg-black" style={{ 
      backgroundColor: '#000000',
      minHeight: '100vh',
      minHeight: '100dvh',
      width: '100vw',
      overflow: 'hidden'
    }}>
      {/* Full-Screen Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/gt_splashBG_dark.png')`,
          width: '100%',
          height: '100%',
          minWidth: '100vw',
          minHeight: '100vh',
          minHeight: '100dvh'
        }}
      />
      
      {/* 75% Black Overlay */}
      <div className="absolute inset-0 bg-black/75 z-0" />
      
      {/* Top Banner - Admin controlled */}
      <TopBanner />
      
      {/* Header Component with Search Functionality */}
      <Header 
        showBrainIcon={false}
        showSearchIcon={false}
        logoImage="/images/gt_logoM_PlayButton.png"
        // Search functionality
        showSearchBar={true}
        showFavoritesToggle={true}
        showResumeButton={true}
        showSortDropdown={true}
        // Search state
        searchQuery={searchQuery}
        sortOrder={sortOrder}
        showFavoritesOnly={showFavoritesOnly}
        savedSession={savedSession}
        // Event handlers
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearch}
        onFavoritesToggle={handleFavoritesToggle}
        onResumeClick={() => {
          console.log('🚀 Resume button clicked - navigating to saved video...')
          console.log('📺 Video details:', {
            id: savedSession.last_video_id,
            title: savedSession.last_video_title,
            channel: savedSession.last_video_channel_name,
            timestamp: savedSession.last_video_timestamp
          })
          
          // Navigate to video page with resume parameters
          router.push(`/watch?v=${savedSession.last_video_id}&title=${encodeURIComponent(savedSession.last_video_title || '')}&channel=${encodeURIComponent(savedSession.last_video_channel_name || '')}`)
        }}
        onSortChange={handleSortChange}
        // Standard props
        onAuthClick={handleAuthClick}
        onMenuClick={() => setShowMenuModal(true)}
        isAuthenticated={isAuthenticated}
      />
      
      {/* Main Content Area - Video Grid */}
      <div 
        className="relative z-10 flex-1 overflow-y-auto px-6 pb-6 hide-scrollbar" 
        style={{ 
          height: 'calc(100vh - 140px)',
          backgroundColor: 'transparent'
        }}
      >
        {/* Search Error */}
        {searchError && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-center">
            {searchError}
          </div>
        )}

        {/* Video Grid */}
        {hasSearched && (() => {
          // Filter results based on favorites toggle
          const filteredResults = showFavoritesOnly 
            ? searchResults.filter(video => isVideoFavorited(video))
            : searchResults
          
          return (
            <div className="mt-6">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {showFavoritesOnly ? 'Favorites' : 'Search Results'}
                  {filteredResults.length > 0 && (
                    <span className="text-lg font-normal text-white/60 ml-2">
                      ({filteredResults.length} videos)
                    </span>
                  )}
                </h2>
              </div>

              {/* Video Cards Grid */}
              {filteredResults.length === 0 && !isSearching ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h4 className="text-lg font-medium text-white mb-2">No videos found</h4>
                <p className="text-white/60">Try different keywords or check your search terms.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResults.map((video, index) => (
                    <div
                      key={`${video.id.videoId}-${index}`}
                      className="group cursor-pointer bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:bg-white/10 hover:border-yellow-400/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-yellow-400/20 relative"
                    >
                      {/* Thumbnail */}
                      <div 
                        className="relative aspect-video bg-gray-800 cursor-pointer"
                        onClick={() => handleVideoClick(video)}
                      >
                        <img
                          src={getBestThumbnail(video.snippet.thumbnails)}
                          alt={video.snippet.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Duration overlay */}
                        {video.contentDetails?.duration && (
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                            {formatDuration(video.contentDetails.duration)}
                          </div>
                        )}
                        
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-yellow-400 text-black rounded-full p-3">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="p-4">
                        {/* Channel Avatar and Title Row */}
                        <div className="flex items-start space-x-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex-shrink-0 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {video.snippet.channelTitle.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 
                              className="font-medium text-white line-clamp-2 group-hover:text-yellow-400 transition-colors cursor-pointer"
                              onClick={() => handleVideoClick(video)}
                            >
                              {video.snippet.title}
                            </h4>
                          </div>
                          
                          {/* More options icon */}
                          <button className="text-white/60 hover:text-white transition-colors p-1">
                            <FaEllipsisV className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Channel Name */}
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="text-sm text-white/80">
                            {video.snippet.channelTitle}
                          </p>
                          <FaCheck className="w-3 h-3 text-blue-400" />
                        </div>
                        
                        {/* Views and Date - Left Side */}
                        <div className="flex items-center text-xs text-white/60 mb-3">
                          <span>
                            {video.statistics?.viewCount && formatViewCount(video.statistics.viewCount)}
                          </span>
                          <span className="mx-2">•</span>
                          <span>
                            {formatPublishDate(video.snippet.publishedAt)}
                          </span>
                        </div>
                        
                        {/* Guitar Pick Icon - Bottom Right */}
                        <div className="absolute bottom-2 right-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleVideoFavoriteToggle(video, isVideoFavorited(video))
                            }}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            {isVideoFavorited(video) ? (
                              <TbGuitarPickFilled className="w-8 h-8 text-[#8dc641]" />
                            ) : (
                              <TbGuitarPick className="w-8 h-8 text-[#8dc641]" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {nextPageToken && (
                  <div className="text-center mt-8 mb-12">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="bg-yellow-400 text-black px-8 py-3 rounded-xl font-medium hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors relative group"
                      title="This button click will be included in daily search totals"
                    >
                      {isLoadingMore ? 'Loading...' : 'LOAD MORE'}
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 shadow-lg">
                        This button click will be included in daily search totals
                      </div>
                    </button>
                  </div>
                )}
              </>
              )}
            </div>
          )
        })()}

        {/* Initial State - Before Search */}
        {!hasSearched && (
          <div className="flex flex-col items-center justify-center h-full text-center text-white">
            <div className="text-6xl mb-6">🎸</div>
            <h1 className="text-4xl font-bold mb-4">Search for Videos</h1>
            <p className="text-xl text-white/60 mb-8">Find the perfect content to learn from</p>
            <div className="text-lg text-white/40">
              Type your search above and press Enter or click the search button
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      
      {/* Support Modal */}
      <SupportModal 
        isOpen={showSupportModal} 
        onClose={() => setShowSupportModal(false)} 
      />

      {/* Menu Modal */}
      <MenuModal
        isOpen={showMenuModal}
        onClose={() => setShowMenuModal(false)}
        onSupportClick={() => setShowSupportModal(true)}
      />
    </div>
  )
}