import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import { useRouter } from 'next/router'
import { checkFeatureAccess, incrementSearchUsage, saveSearch } from '../lib/supabase'
import { 
  searchVideos, 
  formatDuration, 
  formatViewCount, 
  formatPublishDate, 
  getBestThumbnail,
  validateSearchQuery,
  isApiConfigured 
} from '../lib/youtube'

export default function Search() {
  const { isAuthenticated, user, profile, loading, isPremium, signOut } = useAuth()
  const router = useRouter() // FIXED: removed extra ]
  
  // DEBUG: Check for infinite re-renders
  console.log('🔄 SEARCH PAGE RENDER:', Date.now())
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [nextPageToken, setNextPageToken] = useState(null)
  
  // Feature access
  const [hasLoopAccess, setHasLoopAccess] = useState(false)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)

  // DEBUG: Watch auth state changes (ONLY ONE NEEDED)
  useEffect(() => {
    console.log('🔍 AUTH STATE CHANGE:', {
      isAuthenticated,
      loading,
      user: user ? 'exists' : 'null',
      profile: profile ? 'exists' : 'null',
      timestamp: new Date().toISOString()
    })
  }, [isAuthenticated, loading, user, profile])

  // Redirect non-authenticated users
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/')
      return
    }
    // Check feature access for authenticated users
    if (user && !loading) {
      checkFeatureAccess(user.id, 'custom_loops').then(setHasLoopAccess)
    }
  }, [isAuthenticated, loading, user, router])

  // Check if YouTube API is configured
  useEffect(() => {
    if (!isApiConfigured()) {
      setSearchError('YouTube API is not configured. Please add your API key to environment variables.')
    }
  }, [])

  const testLogout = async () => {
  console.log('🧪 SEARCH PAGE: Testing logout...')
  try {
    const result = await signOut()
    console.log('🧪 SEARCH PAGE: Logout result:', result)
  } catch (error) {
    console.error('🧪 SEARCH PAGE: Logout error:', error)
  }
}

  const handleSearch = async (query = searchQuery, pageToken = null) => {
    if (!query?.trim()) return
    
    // Validate search query
    const validation = validateSearchQuery(query)
    if (!validation.valid) {
      setSearchError(validation.error)
      return
    }

    setIsSearching(true)
    setSearchError('')

    try {
      // Check if user can make more searches
      const canSearch = await incrementSearchUsage(user.id)
      if (!canSearch && !isPremium) {
        setSearchError('Daily search limit reached. Upgrade to Premium for unlimited searches!')
        setIsSearching(false)
        return
      }

      // Perform YouTube search
      const results = await searchVideos(query.trim(), {
        maxResults: 12,
        pageToken: pageToken
      })

      // Update results
      if (pageToken) {
        // Pagination - append to existing results
        setSearchResults(prev => [...prev, ...results.videos])
      } else {
        // New search - replace results
        setSearchResults(results.videos)
        setCurrentPage(1)
        setTotalResults(results.totalResults)
      }

      setNextPageToken(results.nextPageToken)
      setHasSearched(true)

      // Save search to database
      await saveSearch(user.id, query.trim(), results.videos.length)

    } catch (error) {
      console.error('Search error:', error)
      setSearchError(error.message || 'Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleLoadMore = () => {
    if (nextPageToken && !isSearching) {
      handleSearch(searchQuery, nextPageToken)
    }
  }

 
 const handleVideoSelect = (video) => {
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
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleTagClick = (tag) => {
    setSearchQuery(tag)
    handleSearch(tag)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-gray-600">
            Search for YouTube videos and experience them like never before.
          </p>
          
          {/* Usage Stats */}
          <div className="mt-4 flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Plan:</span>
              <span className={`font-medium ${isPremium ? 'text-yellow-600' : 'text-blue-600'}`}>
                {isPremium ? '✨ Premium' : 'Free'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Daily Searches:</span>
              <span className="font-medium text-blue-600">
                {profile?.daily_searches_used || 0} / {isPremium ? '∞' : '20'}
              </span>
            </div>
          </div>
        </div>

        {/* Feature Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">🔄</span>
              <h3 className="font-semibold text-gray-900">Video Flipping</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">Flip videos vertically and horizontally</p>
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              ✓ Available
            </span>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">🔁</span>
              <h3 className="font-semibold text-gray-900">Custom Loops</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">Create precise loop points</p>
            {hasLoopAccess ? (
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                ✓ Available
              </span>
            ) : (
              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                ⭐ Premium Only
              </span>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">📚</span>
              <h3 className="font-semibold text-gray-900">Search History</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">Access your saved searches</p>
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              ✓ Available ({isPremium ? 'Unlimited' : 'Last 5'})
            </span>
          </div>
        </div>

        {/* Search Interface */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Search YouTube Videos
            </h2>
            <p className="text-gray-600">
              Find videos to flip, loop, and enjoy with our custom controls
            </p>
          </div>

          <button 
  onClick={testLogout}
  style={{
    position: 'fixed', 
    top: '100px', 
    right: '10px', 
    background: 'red', 
    color: 'white', 
    padding: '10px',
    zIndex: 9999,
    border: 'none',
    borderRadius: '5px'
  }}
>
  🧪 TEST LOGOUT FROM SEARCH
</button>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search for videos... (e.g., 'funny cats', 'guitar tutorial')"
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSearching}
              />
              <button
                onClick={() => handleSearch()}
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Popular searches */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <span className="text-sm text-gray-500">Popular searches:</span>
              {['music videos', 'tutorials', 'comedy', 'gaming', 'nature'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  disabled={isSearching}
                  className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 px-3 py-1 rounded-full text-sm transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Search Error */}
            {searchError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
                {searchError}
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Search Results
                {totalResults > 0 && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({totalResults.toLocaleString()} videos found)
                  </span>
                )}
              </h3>
            </div>

            {searchResults.length === 0 && !isSearching ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No videos found</h4>
                <p className="text-gray-600">Try different keywords or check your search terms.</p>
              </div>
            ) : (
              <>
                {/* Video Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.map((video) => (
                    <div
                      key={video.id.videoId}
                      onClick={() => handleVideoSelect(video)}
                      className="group cursor-pointer bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-gray-100">
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
                          <div className="bg-red-600 text-white rounded-full p-3">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                          {video.snippet.title}
                        </h4>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {video.snippet.channelTitle}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            {video.statistics?.viewCount && formatViewCount(video.statistics.viewCount)}
                          </span>
                          <span>
                            {formatPublishDate(video.snippet.publishedAt)}
                          </span>
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
                      disabled={isSearching}
                      className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSearching ? 'Loading...' : 'Load More Videos'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Upgrade Prompt for Free Users */}
        {!isPremium && (
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-3">
              🚀 Unlock Premium Features
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Get unlimited searches, custom loop controls, and advanced video features. Perfect for creators, learners, and entertainment enthusiasts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Upgrade to Premium - $9/month
              </button>
              <button className="text-white border border-white/30 px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}