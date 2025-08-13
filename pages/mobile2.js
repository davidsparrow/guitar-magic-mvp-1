// pages/mobile2.js - Simple Mobile Test Page
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'
import { useRouter } from 'next/router'
import { FaHamburger } from "react-icons/fa"
import { IoMdPower } from "react-icons/io"
import { RiLogoutCircleRLine } from "react-icons/ri"
import { LuBrain } from "react-icons/lu"

export default function Mobile2() {
  const { isAuthenticated, user, profile, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showRightMenuModal, setShowRightMenuModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (!mounted || (loading && !router.isReady)) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen w-screen overflow-hidden"
      style={{ 
        backgroundImage: `url('/images/gt_splashBG_dark.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#1a1a1a',
        margin: 0,
        padding: 0,
        maxWidth: '100vw'
      }}
    >
      {/* Header */}
      <header className="px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a href="/?home=true" className="hover:opacity-80 transition-opacity">
            <img 
              src="/images/gt_logoM_wide_on_white.png" 
              alt="GuitarTube Logo" 
              className="h-8 w-auto"
            />
          </a>
          
          {/* Right side buttons */}
          <div className="flex items-center space-x-1">
            {/* Brain Icon */}
            <button
              onClick={() => router.push('/features')}
              className="p-2 rounded-lg transition-colors duration-300 text-white hover:bg-white/10"
              title="GuitarTube Features"
            >
              <LuBrain className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
            </button>
            
            {/* Login/Logout Icon */}
            <button 
              onClick={handleAuthClick}
              className="p-2 rounded-lg transition-colors duration-300 text-white hover:bg-white/10"
              title={isAuthenticated ? "End of the Party" : "Start Me Up"}
            >
              {isAuthenticated ? (
                <RiLogoutCircleRLine className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
              ) : (
                <IoMdPower className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
              )}
            </button>
            
            {/* Menu Icon */}
            <button 
              onClick={() => setShowRightMenuModal(true)}
              className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Menu"
            >
              <FaHamburger className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - EMPTY for testing background */}
      <div className="flex-1 min-h-screen">
        {/* This area is intentionally empty to test background visibility */}
      </div>

      {/* Footer */}
      <footer className="px-4 py-4">
        <div className="flex justify-center items-center space-x-3 text-white/60 text-xs">
          <span>© 2025 GuitarTube</span>
          <a href="/terms" className="hover:text-white transition-colors underline">terms</a>
          <a href="/privacy" className="hover:text-white transition-colors underline">privacy</a>
        </div>
      </footer>

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
            className="w-full max-w-[280px] h-full relative"
            style={{
              marginTop: '5px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowRightMenuModal(false)}
              className="absolute top-3 right-4 text-white hover:text-yellow-400 transition-colors text-2xl font-bold"
            >
              ×
            </button>
            
            {/* Menu Content */}
            <div className="p-4 pt-16">
              <div className="text-white text-center space-y-6">
                <div className="space-y-3">
                  <button className="block w-full text-white hover:text-yellow-400 transition-colors text-base font-semibold">
                    PROFILE
                  </button>
                  <button className="block w-full text-white hover:text-yellow-400 transition-colors text-base font-semibold">
                    PLAN DEETS
                  </button>
                </div>
                
                <div className="space-y-3 mt-auto">
                  <a href="mailto:support@guitartube.net" className="block w-full text-white hover:text-yellow-400 transition-colors text-base font-semibold">
                    SUPPORT
                  </a>
                  <a href="/terms" className="block w-full text-white hover:text-yellow-400 transition-colors text-base font-semibold">
                    TERMS
                  </a>
                  <a href="/privacy" className="block w-full text-white hover:text-yellow-400 transition-colors text-base font-semibold">
                    PRIVACY
                  </a>
                  <a href="/community_guidelines" className="block w-full text-white hover:text-yellow-400 transition-colors text-base font-semibold">
                    COMMUNITY GUIDELINES
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
