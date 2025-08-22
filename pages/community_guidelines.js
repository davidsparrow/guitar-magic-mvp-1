// pages/community_guidelines.js - Community Guidelines Page
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'
import { useRouter } from 'next/router'
import { GiGuitar } from "react-icons/gi"
import { FaHamburger } from "react-icons/fa"
import { IoMdPower } from "react-icons/io"
import { RiLogoutCircleRLine } from "react-icons/ri"

export default function CommunityGuidelines() {
  const { isAuthenticated, user, profile, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showRightMenuModal, setShowRightMenuModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle login/logout
  const handleAuthClick = async () => {
    if (isAuthenticated) {
      // User is logged in, sign them out
      try {
        await signOut()
        // Close any open modals
        setShowAuthModal(false)
        setShowRightMenuModal(false)
        setShowProfileModal(false)
        setShowPlanModal(false)
      } catch (error) {
        console.error('Sign out failed:', error)
      }
    } else {
      // User is not logged in, show auth modal
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
    <div className="relative min-h-screen" style={{ 
      fontFamily: 'Poppins, sans-serif'
    }}>
      {/* Full-Screen Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/dark_guitarPink.png')`,
          width: '100vw',
          height: '100vh'
        }}
      />
      
      {/* Header - Same as other pages */}
      <header className="relative z-10 px-4 md:px-6 py-3 md:py-4 bg-black/80 md:bg-transparent">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a 
            href="/?home=true" 
            className="hover:opacity-80 transition-opacity"
          >
            <img 
              src="/images/gt_logo_wide_on_black_450x90.png" 
              alt="GuitarTube Logo" 
              className="h-8 md:h-10 w-auto"
            />
          </a>
          
          {/* Right side buttons */}
          <div className="flex items-center space-x-1 md:space-x-2">
            {/* Login/Logout Icon */}
            <button 
              onClick={handleAuthClick}
              className="p-2 rounded-lg transition-colors duration-300 relative group text-white hover:bg-white/10"
              title={isAuthenticated ? "End of the Party" : "Start Me Up"}
            >
              {isAuthenticated ? (
                <RiLogoutCircleRLine className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
              ) : (
                <IoMdPower className="w-5 h-5 group-hover:text-green-400 transition-colors" />
              )}
            </button>
            
            {/* Menu Icon */}
            <button 
              onClick={() => setShowRightMenuModal(true)}
              className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors group relative"
              title="Yummy!"
            >
              <FaHamburger className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Community Guidelines */}
      <div className="relative px-6 pb-32" style={{ 
        minHeight: 'calc(100vh - 200px)',
        backgroundColor: 'transparent'
      }}>
        <div className="max-w-6xl mx-auto text-white px-6 md:px-36">
          <h1 className="text-5xl font-bold text-center mb-12 mt-8">Community Guidelines</h1>
          
          <div className="space-y-6">
            <div className="bg-gray-800/30 rounded-lg p-6">
              <p className="text-lg leading-relaxed mb-6">
                Welcome to GuitarTube! We're building a community of guitar enthusiasts who support and inspire each other. 
                To ensure everyone has a positive experience, please follow these guidelines:
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-800/30 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-yellow-300">Be Respectful</h2>
                <p className="text-lg leading-relaxed">
                  Treat all community members with kindness and respect. We welcome players of all skill levels, 
                  from beginners to advanced musicians. Remember that everyone was a beginner once.
                </p>
              </div>
              
              <div className="bg-gray-800/30 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-yellow-300">Share Constructively</h2>
                <p className="text-lg leading-relaxed">
                  When sharing feedback or advice, be constructive and encouraging. Focus on helping others improve 
                  rather than pointing out mistakes. Celebrate progress and effort.
                </p>
              </div>
              
              <div className="bg-gray-800/30 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-yellow-300">Respect Copyright</h2>
                <p className="text-lg leading-relaxed">
                  Only share content that you have the right to use. Respect the intellectual property of artists, 
                  songwriters, and content creators. When in doubt, seek permission or use royalty-free materials.
                </p>
              </div>
              
              <div className="bg-gray-800/30 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-yellow-300">Keep It Musical</h2>
                <p className="text-lg leading-relaxed">
                  This is a space for guitar-related content and discussions. While we encourage friendly conversation, 
                  please keep discussions focused on music, learning, and the guitar community.
                </p>
              </div>
              
              <div className="bg-gray-800/30 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-yellow-300">Report Issues</h2>
                <p className="text-lg leading-relaxed">
                  If you encounter content that violates these guidelines, please report it to our support team. 
                  We're committed to maintaining a safe and welcoming environment for all members.
                </p>
              </div>
            </div>
            
            <div className="bg-yellow-400/20 rounded-lg p-6 border border-yellow-400/30">
              <p className="text-yellow-300 text-center text-lg">
                <strong>Remember:</strong> The goal is to create a supportive community where guitarists can learn, 
                grow, and share their passion for music together.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Redesigned Footer - Sticky to Bottom with Padding */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm z-20">
        <div className="px-6 py-8">
          <div className="flex justify-center items-center space-x-4 text-white/60 text-xs" style={{ fontFamily: 'Futura, sans-serif' }}>
            <span>© 2025 GuitarTube</span>
            <a href="/pricing" className="hover:text-white transition-colors underline">pricing</a>
            <a href="/support" className="hover:text-white transition-colors underline">support</a>
            <a href="/terms" className="hover:text-white transition-colors underline">terms</a>
            <a href="/privacy" className="hover:text-white transition-colors underline">privacy</a>
          </div>
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
            className="w-[300px] h-full relative"
            style={{
              marginTop: '5px', // Position just below hamburger
              backgroundColor: 'rgba(255, 255, 255, 0.08)' // Ghost-white with 8% transparency
            }}
          >
            {/* Close Button - Same style as other modals */}
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
