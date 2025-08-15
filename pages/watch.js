// pages/watch.js - Watch Page with YouTube Video Player
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'
import { useRouter } from 'next/router'
import { FaHamburger, FaSearch, FaTimes, FaRegEye, FaRegEdit } from "react-icons/fa"
import { IoMdPower } from "react-icons/io"
import { RiLogoutCircleRLine } from "react-icons/ri"
import { TbGuitarPickFilled } from "react-icons/tb"
import { MdFlipCameraAndroid } from "react-icons/md"
import { ImLoop } from "react-icons/im"
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

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load YouTube API script
  useEffect(() => {
    if (mounted && !window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }
  }, [mounted])

  // Initialize YouTube player when API is ready
  useEffect(() => {
    if (mounted && videoId) {
      const initPlayer = () => {
        if (window.YT && window.YT.Player) {
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
              onReady: handleVideoReady,
              onError: handleVideoError
            }
          })
          
          // Wait a bit for the player to fully initialize before setting it
          setTimeout(() => {
            setPlayer(newPlayer)
          }, 100)
        }
      }

      // Check if API is already loaded
      if (window.YT && window.YT.Player) {
        initPlayer()
      } else {
        // Wait for API to be ready
        window.onYouTubeIframeAPIReady = initPlayer
      }
    }
  }, [mounted, videoId])

  // Load video from URL parameters when page loads
  useEffect(() => {
    if (mounted && router.isReady) {
      const { v, title, channel } = router.query
      if (v && typeof v === 'string') {
        setVideoId(v)
        setVideoTitle(title ? decodeURIComponent(title) : '')
        setVideoChannel(channel ? decodeURIComponent(channel) : '')
        setIsVideoReady(true)
      } else {
        // No video ID provided, redirect to home
        router.push('/')
      }
    }
  }, [mounted, router.isReady, router.query, router])

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
  const handleVideoReady = () => {
    setIsVideoReady(true)
    console.log('🎥 YouTube player ready and methods available')
  }

  const handleVideoError = (error) => {
    console.error('Video error:', error)
    // Handle video loading errors
  }

  // Handle keyboard shortcuts for video control
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Spacebar for play/pause
      if (e.code === 'Space' && isPlayerReady()) {
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
    return player && 
           player.getPlayerState && 
           typeof player.getPlayerState === 'function' &&
           player.playVideo && 
           typeof player.playVideo === 'function' &&
           player.pauseVideo && 
           typeof player.pauseVideo === 'function'
  }

  // Handle control strips toggle - SIMPLIFIED
  const handleControlStripsToggle = () => {
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

  // Video flip handler - cycles through 3 states
  const handleFlipVideo = () => {
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
        <div className="fixed bottom-16 left-0 right-0 z-40 h-64 bg-transparent">
          {/* Control Strips Container - Dynamic positioning from bottom */}
          <div className="h-full relative">
            
            {/* Row 1: Text Captions - 20% height, positioned from bottom */}
            {showRow1 && (
              <div className={`absolute left-0 right-0 flex border-2 border-white rounded-t-lg overflow-hidden h-[20%] transition-all duration-300 ${
                showRow2 && showRow3 ? 'bottom-[80%]' : 
                showRow2 ? 'bottom-[40%]' : 
                showRow3 ? 'bottom-[40%]' : 'bottom-0'
              }`}>
              {/* Left Column - Main Content (93% width) */}
              <div className="w-[93%] p-2 bg-transparent border-r-2 border-white flex items-center">
                <span className="text-white text-sm font-medium">Text Captions</span>
              </div>
              {/* Right Column - Hide Button (7% width) */}
              <div className="w-[7%] p-2 bg-transparent flex flex-col items-center justify-center space-y-2">
                <button 
                  onClick={() => handleRowToggle(1)}
                  className="hover:opacity-70 transition-opacity cursor-pointer"
                  title="Hide this row"
                >
                  <FaRegEye className="w-5 h-5 text-white" />
                </button>
                <button 
                  className="hover:opacity-70 transition-opacity cursor-pointer"
                  title="Edit this row"
                >
                  <FaRegEdit className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            )}

            {/* Row 2: Chords Captions - 40% height, positioned from bottom */}
            {showRow2 && (
              <div className={`absolute left-0 right-0 flex border-l-2 border-r-2 border-white overflow-hidden h-[40%] transition-all duration-300 ${
                showRow3 ? 'bottom-[40%]' : 'bottom-0'
              }`}>
              {/* Left Column - Main Content (93% width) */}
              <div className="w-[93%] p-2 bg-transparent border-r-2 border-white flex items-center">
                <span className="text-white text-sm font-medium">Chords Captions</span>
              </div>
              {/* Right Column - Hide Button (7% width) */}
              <div className="w-[7%] p-2 bg-transparent flex flex-col items-center justify-center space-y-2">
                <button 
                  onClick={() => handleRowToggle(2)}
                  className="hover:opacity-70 transition-opacity cursor-pointer"
                  title="Hide this row"
                >
                  <FaRegEye className="w-5 h-5 text-white" />
                </button>
                <button 
                  className="hover:opacity-70 transition-opacity cursor-pointer"
                  title="Edit this row"
                >
                  <FaRegEdit className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            )}

            {/* Row 3: Auto-Gen - 40% height, always at bottom */}
            {showRow3 && (
              <div className="absolute bottom-0 left-0 right-0 flex border-2 border-white rounded-b-lg overflow-hidden h-[40%] transition-all duration-300">
              {/* Left Column - Main Content (93% width) */}
              <div className="w-[93%] p-2 bg-transparent border-r-2 border-white flex items-center">
                <span className="text-white text-sm font-medium">Auto-Gen</span>
              </div>
              {/* Right Column - Hide Button (7% width) */}
              <div className="w-[7%] p-2 bg-transparent flex flex-col items-center justify-center space-y-2">
                <button 
                  onClick={() => handleRowToggle(3)}
                  className="hover:opacity-70 transition-opacity cursor-pointer"
                  title="Hide this row"
                >
                  <FaRegEye className="w-5 h-5 text-white" />
                </button>
                <button 
                  className="hover:opacity-70 transition-opacity cursor-pointer"
                  title="Edit this row"
                >
                  <FaRegEdit className="w-5 h-5 text-white" />
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
          <div className="flex items-center justify-start space-x-3">
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

            {/* Loop Segment Button */}
            <button
              onClick={handleLoopClick}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                isLoopActive 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={isLoopActive ? "Stop loop" : "Configure loop segment"}
            >
              <ImLoop className="w-5 h-5" />
            </button>

            {/* Loop Time Display (Read-only, clickable) */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLoopTimesClick}
                className={`text-sm font-mono transition-colors cursor-pointer hover:opacity-80 ${
                  isLoopActive ? 'text-blue-400' : 'text-gray-300'
                }`}
                title="Click to edit loop times"
              >
                {loopStartTime} to {loopEndTime}
              </button>
            </div>
          </div>

          {/* Middle Column - Center-justified content with 3 essential icons */}
          <div className="flex items-center justify-center space-x-4">
            {/* View All Strips Eye Icon - Only visible when control strips are active */}
            {showControlStrips && (
              <button 
                onClick={handleShowAllRows}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors" 
                title="Show All Control Strips"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
              </button>
            )}
            
            {/* Control Strips Toggle Button */}
            <button
              onClick={handleControlStripsToggle}
              className={`p-1 rounded-lg transition-colors ${
                showControlStrips 
                  ? 'bg-[#8dc641]/20 border border-[#8dc641]/30 text-[#8dc641]' 
                  : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
              }`}
              title={showControlStrips ? "Hide Control Strips" : "Show Control Strips"}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
              </svg>
            </button>
            
            {/* Guitar Pick Favorites */}
            <button className="p-2 text-[#8dc641] hover:bg-white/10 rounded-lg transition-colors" title="Show Favorites Only">
              <TbGuitarPickFilled className="w-6 h-6" />
            </button>
          </div>

          {/* Right Column - Right-justified content */}
          <div className="flex items-center justify-end">
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