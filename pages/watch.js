// pages/watch.js - Footer Controls Only, Centered Video
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/router'
import YouTube from 'react-youtube'

// React Icons
import { FaPlay, FaPause } from "react-icons/fa"
import { RiFlipHorizontal2Fill, RiFlipVertical2Fill } from "react-icons/ri"
import { IoVolumeHigh, IoVolumeMute } from "react-icons/io5"
import { HiOutlineArrowLeft } from "react-icons/hi2"

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
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
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

  // YouTube player event handlers
  const onPlayerReady = (event) => {
    playerRef.current = event.target
    setIsPlayerReady(true)
    setDuration(event.target.getDuration())
    setVolume(event.target.getVolume())

    // Start time tracking
    intervalRef.current = setInterval(() => {
      if (event.target && event.target.getCurrentTime) {
        const time = event.target.getCurrentTime()
        setCurrentTime(time)
        
        // Handle A-B looping
        if (isLooping && loopStart !== null && loopEnd !== null && time >= loopEnd) {
          event.target.seekTo(loopStart)
        }
      }
    }, 100)
  }

  const onPlayerStateChange = (event) => {
    setIsPlaying(event.data === 1)
  }

  const onPlayerError = (event) => {
    console.error('YouTube player error:', event.data)
  }

  // Control functions
  const handlePlayPause = () => {
    if (!playerRef.current) return
    
    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }

  const handleSeekTo = (seconds) => {
    if (!playerRef.current) return
    playerRef.current.seekTo(seconds)
  }

  const handleVolumeChange = (newVolume) => {
    if (!playerRef.current) return
    
    setVolume(newVolume)
    playerRef.current.setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (!playerRef.current) return
    
    if (isMuted) {
      playerRef.current.unMute()
      setIsMuted(false)
    } else {
      playerRef.current.mute()
      setIsMuted(true)
    }
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
    
    if (loopStart === null || loopEnd === null) {
      alert('Please set both loop start [A] and end [B] points first!')
      return
    }
    
    setIsLooping(!isLooping)
  }

  const clearLoop = () => {
    setLoopStart(null)
    setLoopEnd(null)
    setIsLooping(false)
  }

  const goBack = () => {
    router.back()
  }

  const goHome = () => {
    router.push('/search')
  }

  // Utility functions
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTimeMs = (seconds) => {
    const ms = Math.floor((seconds % 1) * 1000)
    return `${formatTime(seconds)}.${ms.toString().padStart(3, '0')}`
  }

  // YouTube player options
  const playerOpts = {
    height: '100%',
    width: '100%',
    playerVars: {
      controls: 0,           // Hide YouTube controls completely
      disablekb: 1,         // Disable keyboard controls
      fs: 0,                // Disable fullscreen button
      modestbranding: 1,    // Minimal YouTube branding
      rel: 0,               // No related videos at end
      showinfo: 0,          // No video info
      iv_load_policy: 3,    // No annotations
      cc_load_policy: 0,    // No captions by default
      playsinline: 1,       // Play inline on mobile
      autoplay: 0,          // Don't autoplay
      end: Math.floor(duration * 0.98), // End before suggested videos appear
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (!videoId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl mb-4">No Video Selected</h1>
          <button 
            onClick={goHome}
            className="bg-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Search
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-black/95 backdrop-blur-md p-4 flex items-center justify-between z-40 flex-shrink-0 border-b border-white/10">
        <div className="w-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">YV</span>
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              VideoFlip
            </h1>
          </div>

          {/* Video Title (center) */}
          <div className="text-center max-w-md mx-4">
            <h2 className="text-lg font-medium truncate text-white">
              {videoInfo.title}
            </h2>
            <p className="text-sm text-gray-400">
              {videoInfo.channelTitle}
            </p>
          </div>

          {/* Hamburger Menu */}
          <button 
            onClick={() => setShowMenu(true)}
            className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className="bg-white block h-0.5 w-6 rounded-full mb-1.5"></span>
              <span className="bg-white block h-0.5 w-6 rounded-full mb-1.5"></span>
              <span className="bg-white block h-0.5 w-6 rounded-full"></span>
            </div>
          </button>
        </div>
      </header>

      {/* Video Container - CENTERED PROPERLY */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {/* YouTube Player - Properly Centered */}
        <div 
          className="w-full h-full flex items-center justify-center p-4"
          style={{
            transform: `scale${isFlippedH ? 'X' : ''}(-1) scale${isFlippedV ? 'Y' : ''}(-1)`,
            transition: 'transform 0.3s ease'
          }}
        >
          <div 
            className="relative bg-black shadow-2xl"
            style={{ 
              width: 'min(100%, calc((100vh - 200px) * 16/9))', // Responsive width
              height: 'min(calc(100vw * 9/16), calc(100vh - 200px))', // Responsive height
              aspectRatio: '16/9'
            }}
          >
            <YouTube
              videoId={videoId}
              opts={playerOpts}
              onReady={onPlayerReady}
              onStateChange={onPlayerStateChange}
              onError={onPlayerError}
              className="w-full h-full"
              iframeClassName="w-full h-full rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Footer Controls - ALL CONTROLS MOVED HERE */}
      <footer className="bg-black/95 backdrop-blur-xl border-t border-white/20 p-6 flex-shrink-0">
        {/* Timeline Section */}
        <div className="mb-6">
          {/* Time Display */}
          <div className="flex items-center justify-between text-sm font-medium text-white/90 mb-3">
            <span className="font-mono text-blue-400">{formatTimeMs(currentTime)}</span>
            <span className="font-mono text-gray-400">{formatTime(duration)}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative group">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => handleSeekTo(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer 
                        group-hover:h-3 transition-all duration-200
                        [&::-webkit-slider-thumb]:appearance-none 
                        [&::-webkit-slider-thumb]:w-5 
                        [&::-webkit-slider-thumb]:h-5 
                        [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:bg-white 
                        [&::-webkit-slider-thumb]:shadow-xl
                        [&::-webkit-slider-thumb]:border-2
                        [&::-webkit-slider-thumb]:border-blue-500
                        [&::-webkit-slider-thumb]:transition-all
                        [&::-webkit-slider-thumb]:duration-200
                        group-hover:[&::-webkit-slider-thumb]:scale-125"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
            
            {/* Loop markers - Premium */}
            {isPremium && loopStart !== null && (
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 w-1.5 h-6 bg-yellow-400 rounded-full shadow-lg border border-yellow-300"
                style={{ left: `${(loopStart / duration) * 100}%` }}
              />
            )}
            {isPremium && loopEnd !== null && (
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 w-1.5 h-6 bg-yellow-400 rounded-full shadow-lg border border-yellow-300"
                style={{ left: `${(loopEnd / duration) * 100}%` }}
              />
            )}
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          {/* Left: Primary Controls */}
          <div className="flex items-center space-x-6">
            {/* Play/Pause */}
            <button 
              onClick={handlePlayPause}
              disabled={!isPlayerReady}
              className="p-4 hover:scale-110 transition-all duration-200 disabled:opacity-50 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20"
            >
              {isPlaying ? (
                <FaPause className="w-8 h-8 text-white drop-shadow-lg" />
              ) : (
                <FaPlay className="w-8 h-8 text-white drop-shadow-lg ml-1" />
              )}
            </button>

            {/* Volume Control */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={toggleMute}
                className="p-3 hover:scale-110 transition-all duration-200 hover:bg-white/10 rounded-lg"
              >
                {isMuted || volume === 0 ? (
                  <IoVolumeMute className="w-6 h-6 text-white drop-shadow-lg" />
                ) : (
                  <IoVolumeHigh className="w-6 h-6 text-white drop-shadow-lg" />
                )}
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">0</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                  className="w-24 h-1 bg-white/30 rounded-full appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none 
                            [&::-webkit-slider-thumb]:w-4 
                            [&::-webkit-slider-thumb]:h-4 
                            [&::-webkit-slider-thumb]:rounded-full 
                            [&::-webkit-slider-thumb]:bg-white 
                            [&::-webkit-slider-thumb]:shadow-lg"
                />
                <span className="text-xs text-gray-400">100</span>
              </div>
            </div>

            {/* Back Button */}
            <button 
              onClick={goBack}
              className="p-3 hover:scale-110 transition-all duration-200 hover:bg-white/10 rounded-lg flex items-center space-x-2"
            >
              <HiOutlineArrowLeft className="w-6 h-6 text-white drop-shadow-lg" />
              <span className="text-sm text-white">Back</span>
            </button>
          </div>

          {/* Center: Flip Controls */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleFlipH}
              className={`p-4 rounded-2xl transition-all duration-200 hover:scale-110 backdrop-blur-sm ${
                isFlippedH 
                  ? 'bg-blue-500 shadow-lg shadow-blue-500/25' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
              title="Flip Horizontal"
            >
              <RiFlipHorizontal2Fill className="w-6 h-6 text-white drop-shadow-lg" />
            </button>
            
            <button 
              onClick={toggleFlipV}
              className={`p-4 rounded-2xl transition-all duration-200 hover:scale-110 backdrop-blur-sm ${
                isFlippedV 
                  ? 'bg-blue-500 shadow-lg shadow-blue-500/25' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
              title="Flip Vertical"
            >
              <RiFlipVertical2Fill className="w-6 h-6 text-white drop-shadow-lg" />
            </button>
          </div>

          {/* Right: Premium Loop Controls */}
          <div className="flex items-center space-x-3">
            {isPremium ? (
              <>
                <button 
                  onClick={() => setLoopPoint('start')}
                  className={`px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105 backdrop-blur-sm ${
                    loopStart !== null 
                      ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/25' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  title="Set Loop Start"
                >
                  [A
                </button>
                <button 
                  onClick={() => setLoopPoint('end')}
                  className={`px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105 backdrop-blur-sm ${
                    loopEnd !== null 
                      ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/25' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  title="Set Loop End"
                >
                  B]
                </button>
                <button 
                  onClick={toggleLoop}
                  disabled={loopStart === null || loopEnd === null}
                  className={`px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm ${
                    isLooping 
                      ? 'bg-green-500 shadow-lg shadow-green-500/25 text-white' 
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                  title="Toggle Loop"
                >
                  🔁 {isLooping ? 'ON' : 'OFF'}
                </button>
                <button 
                  onClick={clearLoop}
                  className="px-4 py-3 text-sm font-medium rounded-xl bg-white/20 text-white hover:bg-red-500 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
                  title="Clear Loop"
                >
                  ✕
                </button>
              </>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                <span className="text-sm text-white/70">Loop controls: </span>
                <span className="text-sm text-yellow-400 font-medium">Premium Only</span>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Hamburger Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex">
          <div className="bg-gray-900/90 backdrop-blur-xl w-80 h-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold text-white">Menu</h2>
                <button 
                  onClick={() => setShowMenu(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 text-white"
                >
                  ✕
                </button>
              </div>
              
              <nav className="space-y-2">
                <button 
                  onClick={goBack}
                  className="w-full text-left py-3 px-4 hover:bg-white/10 rounded-xl transition-all duration-200 text-white flex items-center space-x-3"
                >
                  <HiOutlineArrowLeft className="w-5 h-5" />
                  <span>Back to Search</span>
                </button>
                <button 
                  onClick={goHome}
                  className="w-full text-left py-3 px-4 hover:bg-white/10 rounded-xl transition-all duration-200 text-white flex items-center space-x-3"
                >
                  <span>🏠</span>
                  <span>Search Videos</span>
                </button>
                <button className="w-full text-left py-3 px-4 hover:bg-white/10 rounded-xl transition-all duration-200 text-white flex items-center space-x-3">
                  <span>⚙️</span>
                  <span>Settings</span>
                </button>
                <button className="w-full text-left py-3 px-4 hover:bg-white/10 rounded-xl transition-all duration-200 text-white flex items-center space-x-3">
                  <span>📜</span>
                  <span>About</span>
                </button>
                {!isPremium && (
                  <button className="w-full text-left py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl transition-all duration-200 text-black font-medium flex items-center space-x-3">
                    <span>⭐</span>
                    <span>Upgrade to Premium</span>
                  </button>
                )}
              </nav>
            </div>
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