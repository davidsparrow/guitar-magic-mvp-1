// pages/watch.js - Complete Fixed Video Player Page
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/router'

export default function Watch() {
  const { isAuthenticated, user, profile, loading, isPremium } = useAuth()
  const router = useRouter()
  const { v: videoId, title, channel } = router.query
  
  // Video states
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  
  // Flip states
  const [isFlippedH, setIsFlippedH] = useState(false)
  const [isFlippedV, setIsFlippedV] = useState(false)
  
  // Loop states (Premium feature)
  const [loopStart, setLoopStart] = useState(null)
  const [loopEnd, setLoopEnd] = useState(null)
  const [isLooping, setIsLooping] = useState(false)
  
  // UI states
  const [showControls, setShowControls] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  
  // Video info
  const [videoInfo, setVideoInfo] = useState({
    title: 'Loading...',
    channelTitle: 'Loading...'
  })

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

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => setShowControls(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showControls])

  // Show controls on mouse move
  const handleMouseMove = () => {
    setShowControls(true)
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    // TODO: Connect to YouTube player
  }

  const handleSeek = (time) => {
    setCurrentTime(time)
    // TODO: Connect to YouTube player
  }

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    // TODO: Connect to YouTube player
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    // TODO: Connect to YouTube player
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

  const toggleLoop = () => {
    if (!isPremium) {
      alert('Loop controls are a Premium feature!')
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
    <div 
      className="min-h-screen bg-black text-white relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
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

      {/* Video Container */}
      <div className="relative w-full h-screen flex items-center justify-center">
        {/* YouTube Player Placeholder */}
        <div 
          className="relative max-w-full max-h-full bg-gray-900 flex items-center justify-center aspect-video"
          style={{
            transform: `scale${isFlippedH ? 'X' : ''}(-1) scale${isFlippedV ? 'Y' : ''}(-1)`,
          }}
        >
          {/* YouTube Embed */}
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=1`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full min-w-[320px] min-h-[180px] max-w-[1920px] max-h-[1080px]"
          ></iframe>
        </div>
      </div>

      {/* Controls Overlay */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 pointer-events-auto">
          <div className="flex items-center justify-between">
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
            
            <div className="text-center max-w-md">
              <h1 className="text-lg font-medium truncate">
                {videoInfo.title}
              </h1>
              <p className="text-sm text-gray-300">
                {videoInfo.channelTitle}
              </p>
            </div>
            
            <div className="w-12"></div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-auto">
          {/* Progress Bar Placeholder */}
          <div className="mb-4">
            <div className="relative h-2 bg-white/20 rounded-full">
              <div 
                className="absolute h-full bg-red-600 rounded-full"
                style={{ width: `${(currentTime / Math.max(duration, 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={handlePlayPause}
                className="p-4 hover:bg-white/20 rounded-full transition-colors"
              >
                {isPlaying ? (
                  <div className="w-8 h-8 flex items-center justify-center">
                    <div className="w-2 h-6 bg-white mr-1"></div>
                    <div className="w-2 h-6 bg-white"></div>
                  </div>
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                  </div>
                )}
              </button>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={toggleMute}
                  className="p-3 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {isMuted ? '🔇' : '🔊'}
                </button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-20 accent-red-600"
                />
              </div>

              <div className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Center Controls - Flip & Loop */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleFlipH}
                className={`p-3 rounded-lg transition-colors ${
                  isFlippedH ? 'bg-blue-600' : 'hover:bg-white/20'
                }`}
                title="Flip Horizontal"
              >
                🔄
              </button>
              
              <button 
                onClick={toggleFlipV}
                className={`p-3 rounded-lg transition-colors ${
                  isFlippedV ? 'bg-blue-600' : 'hover:bg-white/20'
                }`}
                title="Flip Vertical"
              >
                🔃
              </button>

              {/* Premium Loop Controls */}
              {isPremium && (
                <div className="flex items-center space-x-1 border-l border-white/20 pl-2">
                  <button 
                    onClick={() => setLoopPoint('start')}
                    className="p-2 text-sm hover:bg-white/20 rounded transition-colors"
                    title="Set Loop Start"
                  >
                    [A
                  </button>
                  <button 
                    onClick={() => setLoopPoint('end')}
                    className="p-2 text-sm hover:bg-white/20 rounded transition-colors"
                    title="Set Loop End"
                  >
                    B]
                  </button>
                  <button 
                    onClick={toggleLoop}
                    className={`p-2 text-sm rounded transition-colors ${
                      isLooping ? 'bg-yellow-600' : 'hover:bg-white/20'
                    }`}
                    title="Toggle Loop"
                  >
                    🔁
                  </button>
                </div>
              )}
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={goBack}
                className="p-3 hover:bg-white/20 rounded-lg transition-colors"
                title="Back to Search"
              >
                ←
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}