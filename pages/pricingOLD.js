// pages/index.js - Homepage Using Your Actual Images
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'
import { useRouter } from 'next/router'
import { LuBrain } from "react-icons/lu"
import { FaHamburger } from "react-icons/fa"
import { FaRegCreditCard } from "react-icons/fa"
import { IoMdPower } from "react-icons/io"
import { RiLogoutCircleRLine } from "react-icons/ri"
import { FaTimes, FaSearch } from "react-icons/fa"
export default function Home() {
  const { isAuthenticated, user, profile, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isAnnualBilling, setIsAnnualBilling] = useState(true) // Default to annual billing
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const [showRightMenuModal, setShowRightMenuModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const searchInputRef = useRef(null)
  const router = useRouter()
  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])
  // Smart redirect logic for authenticated users
  useEffect(() => {
    if (mounted && isAuthenticated && !loading && router.isReady) {
      const urlParams = new URLSearchParams(window.location.search)
      const isIntentionalHomeVisit = urlParams.get('home') === 'true'
      const referrer = document.referrer
      const isDirectNavigation = !referrer || !referrer.includes(window.location.origin)
      if (isDirectNavigation && !isIntentionalHomeVisit) {
        router.replace('/search')
      }
    }
  }, [mounted, isAuthenticated, loading, router])

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

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('')
    if (searchInputRef.current) {
      searchInputRef.current.focus()
      searchInputRef.current.setSelectionRange(0, 0)
    }
  }

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) return
    // Navigate to search page with query
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
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
      {/* Full-Screen Background - NEW DARK IMAGE */}
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
      {/* Responsive Header - Mobile optimized, transparent on desktop */}
      <header className="relative z-10 px-4 md:px-6 py-3 md:py-4 md:bg-transparent" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
        <div className="flex justify-between items-center">
          {/* Logo - Upper Left - NEW WIDE LOGO */}
          <a 
            href="/?home=true" 
            className="hover:opacity-80 transition-opacity"
          >
            <img 
              src="/images/gt_logoM_wide_on_black.png" 
              alt="VideoFlip Logo" 
              className="h-8 md:h-10 w-auto" // Mobile: h-8, Desktop: h-10
            />
          </a>
          {/* Right side buttons */}
          <div className="flex items-center space-x-1 md:space-x-2"> {/* Mobile: space-x-1, Desktop: space-x-2 */}
            {/* Brain Icon Button - Now in right flex container */}
            <button
              onClick={() => router.push('/features')}
              className="p-2 rounded-lg transition-colors duration-300 relative group text-white hover:bg-white/10"
              title="GuitarTube Features"
            >
              <LuBrain className="w-5 h-5 md:w-6 md:h-6 group-hover:text-yellow-400 transition-colors" />
            </button>
            
            {/* Login/Logout Icon */}
            <button 
              onClick={handleAuthClick}
              className="p-2 rounded-lg transition-colors duration-300 relative group text-white hover:bg-white/10"
              title={isAuthenticated ? "End of the Party" : "Start Me Up"}
            >
              {isAuthenticated ? (
                <RiLogoutCircleRLine className="w-5 h-5 md:w-6 md:h-6 group-hover:text-yellow-400 transition-colors" />
              ) : (
                <IoMdPower className="w-5 h-5 md:w-6 md:h-6 group-hover:text-green-400 transition-colors" />
              )}
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 shadow-lg">
                {isAuthenticated ? "End of the Party" : "Start Me Up"}
              </div>
            </button>
            {/* Menu Icon */}
            <button 
              onClick={() => setShowRightMenuModal(true)}
              className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors group relative"
              title="Yummy"
            >
              <FaHamburger className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 shadow-lg">
                Yummy
              </div>
            </button>
          </div>
        </div>
      </header>
      {/* Main Content - Pricing */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6" style={{ 
        height: 'calc(100vh - 140px)',
        backgroundColor: 'transparent'
      }}>
        <div className="max-w-4xl w-full rounded-2xl p-8 text-white overflow-y-auto max-h-full">
          <h1 className="text-4xl font-bold text-center mb-2 text-yellow-400">Choose Your Plan</h1>
          <p className="text-gray-400 text-lg text-center mb-11">Subscriptions are like Guitars. New ones all the time.</p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8 space-x-4">
            <span className={`text-sm font-medium ${isAnnualBilling ? 'text-gray-500' : 'text-orange-400'}`}>
              Billed Monthly
            </span>
            <button
              onClick={() => setIsAnnualBilling(!isAnnualBilling)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isAnnualBilling ? 'bg-blue-600' : 'bg-orange-500'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnualBilling ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${!isAnnualBilling ? 'text-gray-500' : 'text-blue-400'}`}>
              Billed Annually
            </span>
          </div>
          
          {/* Pricing Tiers */}
          <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
            {/* Freebird */}
            <div className="border border-white/60 rounded-xl p-6 bg-black/75">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Freebird</h3>
                <div className="text-gray-400 font-bold text-base mb-4">free</div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>Flippin some vids</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <span className="mr-3">✗</span>
                  <span>Loopin some segments</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <span className="mr-3">✗</span>
                  <span>Login Resume</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <span className="mr-3">✗</span>
                  <span>Captions & Chords</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <span className="mr-3">✗</span>
                  <span>Tabs (coming soon)</span>
                </div>
              </div>
              <div className="mt-6 space-y-2 text-sm text-gray-400">
                <div>max faves: <span className="text-white">0</span></div>
                <div>max daily searches: <span className="text-white">12</span></div>
                <div>max daily watch time: <span className="text-white">1 Hr.</span></div>
              </div>
              <button 
                onClick={() => setShowAuthModal(true)}
                className="w-full mt-6 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Get Started Free
              </button>
            </div>

            {/* Roadie */}
            <div className="border border-yellow-500 rounded-xl p-6 relative bg-black">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                POPULAR
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Roadie</h3>
                <div className="text-yellow-400 font-bold text-base mb-4">
                  ${isAnnualBilling ? '8' : '10'}/mo.
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>Everything in Freebird</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>Loopin some segments</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>Login Resume</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>Custom 2-Line Captions</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <span className="mr-3">✗</span>
                  <span>Captioned Chord Diagrams</span>
                </div>
              </div>
              <div className="mt-6 space-y-2 text-sm text-gray-400">
                <div>max faves: <span className="text-yellow-400">12</span></div>
                <div>max daily searches: <span className="text-yellow-400">36</span></div>
                <div>max daily watch time: <span className="text-yellow-400">3 Hrs.</span></div>
              </div>
              <button 
                onClick={() => setShowAuthModal(true)}
                className="w-full mt-6 bg-yellow-500 text-black py-3 rounded-lg hover:bg-yellow-400 transition-colors font-bold"
              >
                Start Roadie
              </button>
            </div>

            {/* Hero */}
            <div className="border border-green-500 rounded-xl p-6 bg-black/75">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Hero</h3>
                <div className="text-green-400 font-bold text-base mb-4">
                  ${isAnnualBilling ? '16' : '18'}/mo.
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>Captioned Chord Diagrams</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>Everything in Roadie</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>Auto-Gen Chord Diagrams</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>Auto-Gen Tabs</span>
                </div>
                <div className="flex items-center">
                  <span className="text-black mr-3">-</span>
                  <span className="text-black">-</span>
                </div>
              </div>
              <div className="mt-6 space-y-2 text-sm text-gray-400">
                <div>max faves: <span className="text-green-400">UNLIMITED</span></div>
                <div>max daily searches: <span className="text-green-400">UNLIMITED</span></div>
                <div>max daily watch time: <span className="text-green-400">8 Hrs.</span></div>
              </div>
              <button 
                onClick={() => setShowAuthModal(true)}
                className="w-full mt-6 bg-green-500 text-black py-3 rounded-lg hover:bg-green-400 transition-colors font-bold"
              >
                Go Hero
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Footer - Fixed at Bottom */}
      <footer className="relative z-10 px-6 py-6" style={{ backgroundColor: 'transparent' }}>
        <div className="flex justify-center items-center space-x-4 text-white/60 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
                <p className="font-medium">{isAnnualBilling ? 'Annual' : 'Monthly'}</p>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Amount</p>
                <p className="font-medium text-xl">
                  ${profile?.subscription_tier === 'premium' ? (isAnnualBilling ? '15' : '19') : 
                    profile?.subscription_tier === 'groupie' ? (isAnnualBilling ? '8' : '10') : '0'}/mo
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