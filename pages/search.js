// pages/search.js - Search Page with YouTube API Integration
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'
import { useRouter } from 'next/router'
import { FaHamburger, FaSearch, FaTimes, FaEllipsisV, FaCheck } from "react-icons/fa"
import { IoMdPower } from "react-icons/io"
import { RiLogoutCircleRLine } from "react-icons/ri"
import { TbGuitarPick, TbGuitarPickFilled } from "react-icons/tb"
import { searchVideos, formatDuration, formatViewCount, formatPublishDate, getBestThumbnail } from '../lib/youtube'

export default function Search() {
  const { isAuthenticated, user, profile, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showRightMenuModal, setShowRightMenuModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const searchInputRef = useRef(null)
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

  // Handle login/logout
  const handleAuthClick = async () => {
    if (isAuthenticated) {
      try {
        await signOut()
        setShowAuthModal(false)
        setShowRightMenuModal(false)
        setShowProfileModal(false)
        setShowPlanModal(false)
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

  // Handle search button click
  const handleSearchClick = () => {
    handleSearch()
  }

  // Handle enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setHasSearched(false)
    setNextPageToken(null)
    setSearchError('')
    if (searchInputRef.current) {
      searchInputRef.current.focus()
      searchInputRef.current.setSelectionRange(0, 0)
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
    // Here you would filter results to show only favorites
    // For now, just toggle the state
  }

  // Handle video favorite toggle
  const handleVideoFavoriteToggle = (video, isFavorited) => {
    if (isFavorited) {
      // Remove from favorites
      setUserFavorites(prev => prev.filter(fav => fav.id.videoId !== video.id.videoId))
      // Here you would also call your backend to remove from favorites
    } else {
      // Add to favorites
      setUserFavorites(prev => [...prev, video])
      // Here you would also call your backend to add to favorites
    }
  }

  // Check if video is favorited
  const isVideoFavorited = (video) => {
    return userFavorites.some(fav => fav.id.videoId === video.id.videoId)
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
      
      {/* Header */}
      <header className="relative z-10 px-6 py-4" style={{ backgroundColor: 'transparent' }}>
        <div className="flex justify-between items-center">
          {/* Logo and Favorites Icon - Upper Left */}
          <div className="flex items-center space-x-4">
            <a 
              href="/?home=true" 
              className="hover:opacity-80 transition-opacity"
            >
              <img 
                src="/images/gt_logoM_PlayButton.png" 
                alt="VideoFlip Logo" 
                className="h-10 w-auto"
              />
            </a>
            
            {/* Favorites Icon */}
            <button
              onClick={handleFavoritesToggle}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                showFavoritesOnly 
                  ? 'bg-[#8dc641]/20 border border-[#8dc641]/30' 
                  : 'hover:bg-white/10'
              }`}
              title={showFavoritesOnly ? "Show All Videos" : "Show Favorites Only"}
            >
              <TbGuitarPickFilled className={`w-8 h-8 ${
                showFavoritesOnly ? 'text-[#8dc641]' : 'text-[#8dc641]'
              }`} />
            </button>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="how to play guitar"
                className="w-96 px-4 py-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 border border-white/20 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all"
                style={{ borderRadius: '77px' }}
                ref={searchInputRef}
              />
              
              {/* Clear button */}
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-11 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white hover:scale-110 transition-all duration-200 p-1 rounded-full hover:bg-white/10"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              )}
              
              {/* Vertical separator line */}
              {searchQuery && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2 w-px h-4 bg-white/30"></div>
              )}
              
              {/* Search button */}
              <button
                onClick={handleSearchClick}
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-105"
              >
                <FaSearch className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative group">
              <select
                value={sortOrder}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-4 py-2 appearance-none cursor-pointer hover:border-yellow-400 hover:bg-white/15 transition-all duration-200 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 text-sm"
                title="Sort affects new searches only"
                style={{ borderRadius: '77px' }}
              >
                <option value="relevance" className="bg-black text-white">Relevance</option>
                <option value="date" className="bg-black text-white">Date</option>
                <option value="rating" className="bg-black text-white">Rating</option>
                <option value="title" className="bg-black text-white">Title</option>
                <option value="viewCount" className="bg-black text-white">Views</option>
              </select>
              
              {/* Custom dropdown arrow */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 shadow-lg">
                Sort affects new searches only
              </div>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-2 ml-4">
            {/* Login/Logout Icon */}
            <button 
              onClick={handleAuthClick}
              className="p-2 rounded-lg transition-all duration-200 relative group text-white hover:bg-white/10 hover:scale-105"
              title={isAuthenticated ? "End of the Party" : "Start Me Up"}
            >
              {isAuthenticated ? (
                <RiLogoutCircleRLine className="w-6 h-6 group-hover:text-yellow-400 transition-colors" />
              ) : (
                <IoMdPower className="w-6 h-6 group-hover:text-green-400 transition-colors" />
              )}
            </button>
            
            {/* Menu Icon */}
            <button 
              onClick={() => setShowRightMenuModal(true)}
              className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors group"
            >
              <FaHamburger className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Video Grid */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-6" style={{ 
        height: 'calc(100vh - 140px)',
        backgroundColor: 'transparent'
      }}>
        {/* Search Error */}
        {searchError && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-center">
            {searchError}
          </div>
        )}

        {/* Video Grid */}
        {hasSearched && (
          <div className="mt-6">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {showFavoritesOnly ? 'Favorites' : 'Search Results'}
                {searchResults.length > 0 && (
                  <span className="text-lg font-normal text-white/60 ml-2">
                    ({searchResults.length} videos)
                  </span>
                )}
              </h2>
            </div>

            {/* Video Cards Grid */}
            {searchResults.length === 0 && !isSearching ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h4 className="text-lg font-medium text-white mb-2">No videos found</h4>
                <p className="text-white/60">Try different keywords or check your search terms.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map((video, index) => (
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
                  <div className="text-center mt-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="bg-yellow-400 text-black px-8 py-3 rounded-xl font-medium hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoadingMore ? 'Loading...' : 'LOAD MORE'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

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

      {/* Right-Side Menu Modal */}
      {showRightMenuModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRightMenuModal(false)
            }
          }}
        >
          <div 
            className="w-[300px] h-full relative"
            style={{
              marginTop: '5px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowRightMenuModal(false)}
              className="absolute top-3 right-9 text-white hover:text-yellow-400 transition-colors text-2xl font-bold"
            >
              ×
            </button>
            
            {/* Menu Content */}
            <div className="p-6 pt-16">
              <div className="text-white text-center space-y-8">
                {/* TOP OF MENU */}
                <div className="space-y-4">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="block w-full text-white hover:text-yellow-400 transition-colors text-lg font-semibold"
                  >
                    PROFILE
                  </button>
                  
                  <button
                    onClick={() => setShowPlanModal(true)}
                    className="block w-full text-white hover:text-yellow-400 transition-colors text-lg font-semibold"
                  >
                    PLAN DEETS
                  </button>
                </div>
                
                {/* BOTTOM OF MENU */}
                <div className="space-y-4 mt-auto">
                  <a 
                    href="mailto:support@guitartube.net"
                    className="block w-full text-white hover:text-yellow-400 transition-colors text-lg font-semibold"
                  >
                    SUPPORT
                  </a>
                  
                  <a 
                    href="/terms"
                    className="block w-full text-white hover:text-yellow-400 transition-colors text-lg font-semibold"
                  >
                    TERMS
                  </a>
                  
                  <a 
                    href="/privacy"
                    className="block w-full text-white hover:text-yellow-400 transition-colors text-lg font-semibold"
                  >
                    PRIVACY
                  </a>
                  
                  <a 
                    href="/community_guidelines"
                    className="block w-full text-white hover:text-yellow-400 transition-colors text-lg font-semibold"
                  >
                    COMMUNITY GUIDELINES
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowProfileModal(false)
            }
          }}
        >
          <div className="bg-black rounded-2xl shadow-2xl max-w-md w-full relative text-white p-8">
            {/* Close Button */}
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors text-2xl font-bold"
            >
              ×
            </button>
            
            {/* Profile Content */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-4">Profile</h2>
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            
            <div className="space-y-4 text-gray-300">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Name</p>
                <p className="font-medium">{profile?.full_name || user?.email?.split('@')[0] || 'User'}</p>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Email</p>
                <p className="font-medium">{user?.email || 'No email'}</p>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Subscription</p>
                <p className="font-medium capitalize">{profile?.subscription_tier || 'Free'}</p>
              </div>
              
              <div className="pt-4">
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Plan Modal */}
      {showPlanModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPlanModal(false)
            }
          }}
        >
          <div className="bg-black rounded-2xl shadow-2xl max-w-md w-full relative text-white p-8">
            {/* Close Button */}
            <button
              onClick={() => setShowPlanModal(false)}
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors text-2xl font-bold"
            >
              ×
            </button>
            
            {/* Plan Content */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-4">Plan Details</h2>
            </div>
            
            <div className="space-y-4 text-gray-300">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Current Plan</p>
                <p className="font-medium capitalize text-xl">{profile?.subscription_tier || 'Free'}</p>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Billing Cycle</p>
                <p className="font-medium">Monthly</p>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Amount</p>
                <p className="font-medium text-xl">
                  ${profile?.subscription_tier === 'hero' ? '19' : 
                    profile?.subscription_tier === 'roadie' ? '10' : '0'}/mo
                </p>
              </div>
              
              <div className="pt-4 space-y-3">
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Change Credit Card
                </button>
                
                {profile?.subscription_tier !== 'hero' && (
                  <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                    UPGRADE
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}