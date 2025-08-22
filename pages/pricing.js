// pages/index.js - Homepage Using Your Actual Images
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'
import SupportModal from '../components/SupportModal'
import MenuModal from '../components/MenuModal'
import { useRouter } from 'next/router'
import { LuBrain } from "react-icons/lu"
import { FaHamburger } from "react-icons/fa"
import { FaRegCreditCard } from "react-icons/fa"
import { IoMdPower } from "react-icons/io"
import { RiLogoutCircleRLine } from "react-icons/ri"
import { FaTimes, FaSearch } from "react-icons/fa"
import { GiChickenOven, GiGuitar } from "react-icons/gi"
import { BsFillSpeakerFill } from "react-icons/bs"
import { loadStripe } from '@stripe/stripe-js'
export default function Home() {
  const { isAuthenticated, user, profile, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isAnnualBilling, setIsAnnualBilling] = useState(true) // Default to annual billing
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const [showMenuModal, setShowMenuModal] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const searchInputRef = useRef(null)
  const router = useRouter()
  
  // Stripe initialization
  const [stripe, setStripe] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
    
    // Initialize Stripe
    const initStripe = async () => {
      const stripeInstance = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
      setStripe(stripeInstance)
    }
    
    if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      initStripe()
    }
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
        setShowMenuModal(false)
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

  // Handle Stripe checkout
  const handleCheckout = async (plan) => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    if (!stripe) {
      console.error('Stripe not initialized')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: plan,
          billingCycle: isAnnualBilling ? 'annual' : 'monthly',
          userEmail: user.email,
          userId: user.id
        }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        // Handle errors (like duplicate subscription)
        if (data.message === 'You already have an active subscription') {
          alert(`You already have an active ${data.currentPlan} subscription.`)
        } else {
          alert('Failed to create checkout session. Please try again.')
        }
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
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
      width: '100vw',
      overflow: 'hidden'
    }}>
      {/* Full-Screen Background - NEW DARK IMAGE */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden md:block"
        style={{
          backgroundImage: `url('/images/gt_splashBG_dark.png')`,
          width: '100%',
          height: '100%',
          minWidth: '100vw',
          minHeight: '100vh',
        }}
      />
            {/* Responsive Header - Mobile optimized, transparent on desktop */}
      <header className="relative z-10 px-4 md:px-6 py-3 md:py-4 bg-black/80 md:bg-transparent">
        <div className="flex justify-between items-center">
          {/* Logo - Upper Left - NEW WIDE LOGO */}
          <a 
            href="/?home=true" 
            className="hover:opacity-80 transition-opacity"
          >
            <img 
              src="/images/gt_logo_wide_on_black_450x90.png" 
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
              <LuBrain className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
            </button>
            
            {/* Login/Logout Icon */}
            <button 
              onClick={handleAuthClick}
              className="p-[7px] rounded-lg transition-colors duration-300 relative group text-white hover:bg-white/10"
              title={isAuthenticated ? "End of the Party" : "Start Me Up"}
            >
              {isAuthenticated ? (
                <RiLogoutCircleRLine className="w-[21.5px] h-[21.5px] group-hover:text-yellow-400 transition-colors" />
              ) : (
                <IoMdPower className="w-[21.5px] h-[21.5px] group-hover:text-green-400 transition-colors" />
              )}
            </button>
            {/* Menu Icon */}
            <button 
              onClick={() => setShowMenuModal(true)}
              className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors group relative"
              title="Yummy"
            >
              <FaHamburger className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
            </button>
          </div>
        </div>
      </header>
      {/* Main Content - Pricing */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6" style={{ 
        height: 'calc(100vh - 100px)',
        backgroundColor: 'transparent'
      }}>
        <div className="max-w-4xl w-full rounded-2xl p-8 text-white overflow-y-auto max-h-full" style={{ 
          fontFamily: 'Poppins, sans-serif',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0, 0, 0, 0.3) transparent'
        }}>
          <h1 className="text-2xl md:text-4xl font-bold text-center mb-2 text-yellow-400">Choose Your Plan</h1>
          <p className="text-gray-400 text-base md:text-lg text-center mb-11">Subscriptions are like Guitars. New ones all the time.</p>
          
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
          <div className="flex flex-col md:grid md:grid-cols-3 gap-6 space-y-5 md:space-y-0">
            {/* Freebird */}
            <div className="border border-white/60 rounded-xl p-6 relative bg-black/75">
              
              {/* No Credit Card Pill - Bottom Edge Overlap */}
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                No credit card
              </div>
              <div className="mb-6">
                <div className="flex items-start space-x-3 mb-2">
                  <GiChickenOven className="w-10 h-10 text-yellow-400 flex-shrink-0 -mt-1" />
                  <div>
                    <h3 className="text-2xl font-bold text-left">Freebird</h3>
                    <div className="text-gray-400 font-bold text-base">free</div>
                  </div>
                </div>
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
                className="w-full mt-6 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
              >
                <span>STAY FREE</span>
                <img 
                  src="/images/no_credit_card2.png" 
                  alt="No Credit Card" 
                  className="w-5 h-5"
                />
              </button>
            </div>

            {/* Roadie */}
            <div className="border border-yellow-500 rounded-xl p-6 relative bg-black">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                POPULAR
              </div>
              
              {/* 30-day Trial Pill - Bottom Edge Overlap */}
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                30-day Free Trial
              </div>
              <div className="mb-6">
                <div className="flex items-start space-x-3 mb-2">
                  <BsFillSpeakerFill className="w-10 h-10 text-yellow-400 flex-shrink-0 mt-0" />
                  <div>
                    <h3 className="text-2xl font-bold text-left">Roadie</h3>
                    <div className="text-yellow-400 font-bold text-base">
                      ${isAnnualBilling ? '8' : '10'}/mo.
                    </div>
                  </div>
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
                onClick={() => handleCheckout('roadie')}
                disabled={isLoading}
                className="w-full mt-6 bg-yellow-500 text-black py-3 rounded-lg hover:bg-yellow-400 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'STAY CHEAP'
                )}
              </button>
            </div>

            {/* Hero */}
            <div className="border border-green-500 rounded-xl p-6 relative bg-black/75">
              {/* 30-day Trial Pill - Bottom Edge Overlap */}
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                30-day Free Trial
              </div>
              <div className="mb-6">
                <div className="flex items-start space-x-3 mb-2">
                  <GiGuitar className="w-10 h-10 text-green-400 flex-shrink-0 mt-0" />
                  <div>
                    <h3 className="text-2xl font-bold text-left">Hero</h3>
                    <div className="text-green-400 font-bold text-base">
                      ${isAnnualBilling ? '16' : '19'}/mo.
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>Everything in Roadie</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>Captioned Chord Diagrams</span>
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
                onClick={() => handleCheckout('hero')}
                disabled={isLoading}
                className="w-full mt-6 bg-green-500 text-black py-3 rounded-lg hover:bg-green-400 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'GO BROKE'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Footer - Fixed at Bottom */}
      <footer className="relative z-6 px-3 py-3 bg-black/70 md:bg-transparent">
        <div className="flex justify-center items-center space-x-4 text-white/60 text-xs md:-mt-5" style={{ fontFamily: 'Futura, sans-serif' }}>
          <span>© 2025 GuitarTube</span>
          <a href="/pricing" className="hover:text-white transition-colors underline">pricing</a>
          <button onClick={() => setShowSupportModal(true)} className="hover:text-white transition-colors underline bg-transparent border-none text-white/60 cursor-pointer">support</button>
          <a href="/terms" className="hover:text-white transition-colors underline">terms</a>
          <a href="/privacy" className="hover:text-white transition-colors underline">privacy</a>
        </div>
      </footer>
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      
      {/* Support Modal */}
      <SupportModal 
        isOpen={showSupportModal} 
        onClose={() => setShowSupportModal(false)} 
      />
      {/* Menu Modal */}
      <MenuModal
        isOpen={showMenuModal}
        onClose={() => setShowMenuModal(false)}
        showSupportModal={showSupportModal}
        setShowSupportModal={setShowSupportModal}
      />
      

      

    </div>
  )
}