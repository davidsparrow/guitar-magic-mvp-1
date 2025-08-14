// pages/watch.js - Watch Page with YouTube Video Player
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'
import { useRouter } from 'next/router'
import { FaHamburger, FaSearch, FaTimes } from "react-icons/fa"
import { IoMdPower } from "react-icons/io"
import { RiLogoutCircleRLine } from "react-icons/ri"
import { TbGuitarPickFilled } from "react-icons/tb"
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
  
  // Control strip states
  const [showControlStrips, setShowControlStrips] = useState(false)
  const [controlStripsHeight, setControlStripsHeight] = useState(0)
  const [videoFrameHeight, setVideoFrameHeight] = useState('auto')

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
    if (mounted && window.YT && videoId) {
      window.onYouTubeIframeAPIReady = () => {
        const newPlayer = new window.YT.Player('youtube-player', {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            controls: 1,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            origin: window.location.origin
          },
          events: {
            onReady: handleVideoReady,
            onError: handleVideoError
          }
        })
        setPlayer(newPlayer)
      }
      
      if (window.YT.Player) {
        window.onYouTubeIframeAPIReady()
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
  }

  const handleVideoError = (error) => {
    console.error('Video error:', error)
    // Handle video loading errors
  }

  // Handle spacebar for play/pause
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' && player && isVideoReady) {
        e.preventDefault()
        const playerState = player.getPlayerState()
        if (playerState === 1) { // Playing
          player.pauseVideo()
        } else { // Paused or other states
          player.playVideo()
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [player, isVideoReady])

  // Handle control strips toggle
  const handleControlStripsToggle = () => {
    setShowControlStrips(!showControlStrips)
  }

  // Calculate video frame height based on control strips visibility
  useEffect(() => {
    if (showControlStrips) {
      // When control strips are visible, video frame height adjusts
      setVideoFrameHeight('calc(100vh - 140px - 128px)') // 128px = control strips height
      setControlStripsHeight(128)
    } else {
      // When control strips are hidden, video frame frame takes full height
      setVideoFrameHeight('calc(100vh - 140px)')
      setControlStripsHeight(0)
    }
  }, [showControlStrips])

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

      {/* Main Content Area - Theatre Mode Layout */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-6 hide-scrollbar" style={{ height: videoFrameHeight, backgroundColor: 'transparent' }}>
        {/* Video Player Container - Edge-to-Edge Width */}
        <div className="w-full max-w-none -mt-6">
          {/* YouTube Video Player - Theatre Mode */}
          {videoId && (
            <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-2xl">
              {/* Video Container - Maintains edge-to-edge width */}
              <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                <div id="youtube-player" className="w-full h-full" />
              </div>
            </div>
          )}
          
          {/* Control Strips Toggle Button */}
          <div className="mt-6 flex justify-center items-center space-x-4">
            {/* View All Strips Eye Icon - Only visible when control strips are active */}
            {showControlStrips && (
              <button
                className="p-3 rounded-lg transition-all duration-300 bg-white/10 border border-white/20 text-white hover:bg-white/20"
                title="View All Strips"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
              </button>
            )}
            
            {/* Main Control Strips Toggle Button */}
            <button
              onClick={handleControlStripsToggle}
              className={`p-3 rounded-lg transition-all duration-300 ${
                showControlStrips 
                  ? 'bg-[#8dc641]/20 border border-[#8dc641]/30 text-[#8dc641]' 
                  : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
              }`}
              title={showControlStrips ? "Hide Control Strips" : "Show Control Strips"}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
              </svg>
            </button>
          </div>

          {/* Control Strips Area */}
          {showControlStrips && (
            <div 
              className="mt-4 transition-all duration-300 ease-in-out"
              style={{ height: `${controlStripsHeight}px` }}
            >
              <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                <div className="text-center text-white/60">
                  <p className="text-lg font-medium">Control Strips Area</p>
                  <p className="text-sm">Phase 2: Individual strip management coming next</p>
                  <div className="mt-2 flex justify-center space-x-4">
                    <div className="w-16 h-8 bg-white/10 rounded border border-white/20 flex items-center justify-center text-xs">
                      Captions
                    </div>
                    <div className="w-16 h-8 bg-white/10 rounded border border-white/20 flex items-center justify-center text-xs">
                      Loops
                    </div>
                    <div className="w-16 h-8 bg-white/10 rounded border border-white/20 flex items-center justify-center text-xs">
                      Chords
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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