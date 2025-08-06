// pages/watch.js - Option A: Large Video + Footer Controls
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/router'

export default function Watch() {
  const { isAuthenticated, user, profile, loading, isPremium } = useAuth()
  const router = useRouter()
  const { v: videoId, title, channel } = router.query
  const playerRef = useRef(null)
  const intervalRef = useRef(null)
  
  // Video states
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  
  // Flip states
  const [isFlippedH, setIsFlippedH] = useState(false)
  const [isFlippedV, setIsFlippedV] = useState(false)
  
  // Loop states (Premium feature)
  const [loopStart, setLoopStart] = useState(null)
  const [loopEnd, setLoopEnd] = useState(null)
  const [isLooping, setIsLooping] = useState(false)
  
  // UI states
  const [showMenu, setShowMenu] = useState(false)
  
  // Video info
  const [videoInfo, setVideoInfo] = useState({
    title: 'Loading...',
    channelTitle: 'Loading...'
  })

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initializePlayer()
      return
    }

    // Load YouTube API script
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

    // Set up global callback
    window.onYouTubeIframeAPIReady = () => {
      initializePlayer()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [videoId])

  // Initialize YouTube player
  const initializePlayer = () => {
    if (!videoId || !playerRef.current) return

    const player = new window.YT.Player(playerRef.current, {
      width: '100%',
      height: '100%',
      videoId: videoId,
      playerVars: {
        // ENABLE YouTube's native controls (removed controls=0)
        controls: 1,           // Show YouTube controls
        modestbranding: 1,     // Minimal branding
        rel: 0,               // Don't show related videos
        fs: 1,                // Allow fullscreen
        cc_load_policy: 0,    // Don't auto-show captions
        iv_load_policy: 3,    // Hide annotations
        origin: window.location.origin
      },
      events: {
        onReady: (event) => {
          setIsPlayerReady(true)
          setDuration(event.target.getDuration())
          
          // Start time tracking
          intervalRef.current = setInterval(() => {
            if (event.target && event.target.getCurrentTime) {
              const time = event.target.getCurrentTime()
              setCurrentTime(time)
              
              // Handle looping
              if (isLooping && loopStart !== null && loopEnd !== null && time >= loopEnd) {
                event.target.seekTo(loopStart)
              }
            }
          }, 100) // Check every 100ms for smooth looping
        },
        onStateChange: (event) => {
          // Update play state
          setIsPlaying(event.data === 1) // 1 = playing
        }
      }
    })

    // Store player reference globally so controls can access it
    window.currentPlayer = player
  }

  // Load video info from URL params or localStorage
  useEffect(() => {
    if (title && channel) {
      setVideoInfo({
        title: decodeURIComponent(title),
        channelTitle: decodeURIComponent(channel)
      })
    } else {
      const savedVideo = localStorage.getItem('currentVideo')
      if (savedVideo) {
        try {
          const parsed = JSON.parse(savedVideo)
          setVideoInfo({
            title: parsed.title || 'Video',
            channelTitle: parsed.channelTitle || 'Channel'
          })
        } catch (e) {
          console.error('Error parsing saved video data:', e)
        }
      }
    }
  }, [title, channel])

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/')
      return
    }
  }, [isAuthenticated, loading, router])

  // Control functions that work with YouTube API
  const handlePlayPause = () => {
    if (!window.currentPlayer) return
    
    if (isPlaying) {
      window.currentPlayer.pauseVideo()
    } else {
      window.currentPlayer.playVideo()
    }
  }

  const handleSeekTo = (seconds) => {
    if (!window.currentPlayer) return
    window.currentPlayer.seekTo(seconds)
  }

  const toggleFlipH = () => {
    setIsFlippedH(!isFlippedH)
  }

  const toggleFlipV = () => {
    setIsFlippedV(!isFlippedV)
  }

  const setLoopPoint = (type) => {
    if (!isPremium) {
      alert('Loop controls are a Premium feature!')
      return
    }
    
    if (type === 'start') {
      setLoopStart(currentTime)
    } else {
      setLoopEnd(currentTime)
    }
  }

  const clearLoop = () => {
    setLoopStart(null)
    setLoopEnd(null)
    setIsLooping(false)
  }

  const toggleLoop = () => {
    if (!isPremium) {
      alert('Loop controls are a Premium feature!')
      return
    }
    
    if (loopStart === null || loopEnd === null) {
      alert('Please set both loop start [A] and end [B] points first!')
      return
    }
    
    setIsLooping(!isLooping)
  }

  const goBack = () => {
    router.back()
  }

  const goHome = () => {
    router.push('/search')
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTimeMs = (seconds) => {
    const ms = Math.floor((seconds % 1) * 1000)
    return `${formatTime(seconds)}.${ms.toString().padStart(3, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  if (!videoId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl mb-4">No Video Selected</h1>
          <button 
            onClick={goHome}
            className="bg-blue-600 px-6 py-3 rounded-lg font-medium"
          >
            Go to Search
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-black/90 p-4 flex items-center justify-between z-40 flex-shrink-0">
        {/* Hidden Banner Zone (collapsed by default) */}
        <div className="hidden w-full h-0 overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
          {/* Future banner content goes here */}
          <div className="flex items-center justify-center h-full">
            <p className="text-white font-medium">Banner Message Here</p>
          </div>
        </div>
        
        {/* Main Header Row */}
        <div className="w-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">YV</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VideoFlip
            </h1>
          </div>

          {/* Video Title (center) */}
          <div className="text-center max-w-md mx-4">
            <h2 className="text-lg font-medium truncate">
              {videoInfo.title}
            </h2>
            <p className="text-sm text-gray-400">
              {videoInfo.channelTitle}
            </p>
          </div>

          {/* Hamburger Menu */}
          <button 
            onClick={() => setShowMenu(true)}
            className="p-3 hover:bg-white/20 rounded-lg transition-colors"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className="bg-white block h-0.5 w-6 rounded-sm mb-1"></span>
              <span className="bg-white block h-0.5 w-6 rounded-sm mb-1"></span>
              <span className="bg-white block h-0.5 w-6 rounded-sm"></span>
            </div>
          </button>
        </div>
      </header>

      {/* Video Container - Takes up most of screen */}
      <div className="flex-1 flex items-center justify-center bg-black p-4">
        <div 
          className="w-full h-full max-w-7xl max-h-full"
          style={{
            transform: `scale${isFlippedH ? 'X' : ''}(-1) scale${isFlippedV ? 'Y' : ''}(-1)`,
          }}
        >
          {/* YouTube Player */}
          <div 
            ref={playerRef}
            className="w-full h-full min-h-[400px] bg-gray-900"
            style={{ aspectRatio: '16/9' }}
          />
        </div>
      </div>

      {/* Footer Controls */}
      <footer className="bg-gray-900 p-6 flex-shrink-0">
        {/* Timeline */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>{formatTimeMs(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => handleSeekTo(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`
              }}
            />
            
            {/* Loop markers */}
            {isPremium && loopStart !== null && (
              <div 
                className="absolute top-0 w-1 h-2 bg-yellow-400 pointer-events-none"
                style={{ left: `${(loopStart / duration) * 100}%` }}
              />
            )}
            {isPremium && loopEnd !== null && (
              <div 
                className="absolute top-0 w-1 h-2 bg-yellow-400 pointer-events-none"
                style={{ left: `${(loopEnd / duration) * 100}%` }}
              />
            )}
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          {/* Left: Playback Controls */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={handlePlayPause}
              disabled={!isPlayerReady}
              className="p-3 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
            >
              {isPlaying ? (
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="w-1.5 h-4 bg-white mr-1"></div>
                  <div className="w-1.5 h-4 bg-white"></div>
                </div>
              ) : (
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
                </div>
              )}
            </button>

            <button 
              onClick={goBack}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors text-sm"
            >
              ← Back
            </button>
          </div>

          {/* Center: Flip Controls */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleFlipH}
              className={`p-3 rounded-lg transition-colors ${
                isFlippedH ? 'bg-blue-600' : 'hover:bg-white/20'
              }`}
              title="Flip Horizontal"
            >
              <span className="text-lg">🔄</span>
            </button>
            
            <button 
              onClick={toggleFlipV}
              className={`p-3 rounded-lg transition-colors ${
                isFlippedV ? 'bg-blue-600' : 'hover:bg-white/20'
              }`}
              title="Flip Vertical"
            >
              <span className="text-lg">🔃</span>
            </button>
          </div>

          {/* Right: Loop Controls (Premium) */}
          <div className="flex items-center space-x-2">
            {isPremium ? (
              <>
                <button 
                  onClick={() => setLoopPoint('start')}
                  className={`px-3 py-2 text-sm rounded transition-colors ${
                    loopStart !== null ? 'bg-yellow-600' : 'hover:bg-white/20'
                  }`}
                  title="Set Loop Start"
                >
                  [A
                </button>
                <button 
                  onClick={() => setLoopPoint('end')}
                  className={`px-3 py-2 text-sm rounded transition-colors ${
                    loopEnd !== null ? 'bg-yellow-600' : 'hover:bg-white/20'
                  }`}
                  title="Set Loop End"
                >
                  B]
                </button>
                <button 
                  onClick={toggleLoop}
                  disabled={loopStart === null || loopEnd === null}
                  className={`px-3 py-2 text-sm rounded transition-colors disabled:opacity-50 ${
                    isLooping ? 'bg-green-600' : 'hover:bg-white/20'
                  }`}
                  title="Toggle Loop"
                >
                  🔁 {isLooping ? 'ON' : 'OFF'}
                </button>
                <button 
                  onClick={clearLoop}
                  className="px-3 py-2 text-sm hover:bg-white/20 rounded transition-colors"
                  title="Clear Loop"
                >
                  ✕
                </button>
              </>
            ) : (
              <div className="text-sm text-gray-400">
                Loop controls: 
                <span className="text-yellow-400 ml-1">Premium Only</span>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Hamburger Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/90 z-50 flex">
          <div className="bg-gray-900 w-80 h-full p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">Menu</h2>
              <button 
                onClick={() => setShowMenu(false)}
                className="text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <nav className="space-y-4">
              <button 
                onClick={goBack}
                className="w-full text-left py-3 px-4 hover:bg-gray-800 rounded-lg transition-colors"
              >
                ← Back to Search
              </button>
              <button 
                onClick={goHome}
                className="w-full text-left py-3 px-4 hover:bg-gray-800 rounded-lg transition-colors"
              >
                🏠 Search Videos
              </button>
              <button className="w-full text-left py-3 px-4 hover:bg-gray-800 rounded-lg transition-colors">
                ⚙️ Settings
              </button>
              <button className="w-full text-left py-3 px-4 hover:bg-gray-800 rounded-lg transition-colors">
                📜 About
              </button>
              {!isPremium && (
                <button className="w-full text-left py-3 px-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors">
                  ⭐ Upgrade to Premium
                </button>
              )}
            </nav>
          </div>
          <div 
            className="flex-1"
            onClick={() => setShowMenu(false)}
          ></div>
        </div>
      )}
    </div>
  )
}