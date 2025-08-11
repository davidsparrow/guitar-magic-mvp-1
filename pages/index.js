// pages/index.js - Homepage Using Your Actual Images
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'
import { useRouter } from 'next/router'

export default function Home() {
  const { isAuthenticated, user, profile, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showWhatModal, setShowWhatModal] = useState(false)
  const [showFeatureModal, setShowFeatureModal] = useState(null) // 'loops' or 'resume'
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [mounted, setMounted] = useState(false)
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

  // Close modals when clicking outside
  const handleModalBackdropClick = (e, closeFunction) => {
    if (e.target === e.currentTarget) {
      closeFunction()
    }
  }

  // Handle feature hotspot clicks
  const handleFeatureClick = (feature) => {
    setShowWhatModal(false)
    setShowFeatureModal(feature)
  }

  if (!mounted || (loading && !router.isReady)) {
    return (
      <div 
        className="bg-black flex items-center justify-center overflow-hidden" 
        style={{ 
          height: '100vh', 
          width: '100vw', 
          margin: 0, 
          padding: 0 
        }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div 
      className="relative overflow-hidden" 
      style={{ 
        height: '100vh', 
        width: '100vw', 
        margin: 0, 
        padding: 0, 
        position: 'relative',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }}
    >
      {/* Full-Screen Background - NEW DARK IMAGE */}
      <div 
        className="absolute bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/gt_splashBG_dark.png')`,
          minHeight: '100vh',
          minWidth: '100vw',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh'
        }}
      />

      {/* Transparent Header */}
      <header className="relative z-10 px-4 py-4">
        <div className="flex justify-between items-center max-w-full">
          {/* Logo - Upper Left - NEW WIDE LOGO */}
          <a 
            href="/?home=true" 
            className="hover:opacity-80 transition-opacity"
          >
            <img 
              src="/images/gt_logoM_wide_on_black.png" 
              alt="VideoFlip Logo" 
              className="h-10 w-auto"
            />
          </a>

          {/* Menu Icon */}
          <button 
            onClick={() => setShowPricingModal(true)}
            className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content - Fixed Height, No Scroll */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4" style={{ height: 'calc(100vh - 140px)' }}>
        
        {/* 1. Large Centered Tall Logo - YOUR ACTUAL IMAGE */}
        <div className="mb-8">
          <img 
            src="/images/gt_logo_tall_on_black.png" 
            alt="VideoFlip" 
            className="mx-auto mb-6 h-48 w-auto"
          />
        </div>

        {/* 2. "Guitar Wha?" Pill Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowWhatModal(true)}
            className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
          >
            Guitar wha? 🎸
          </button>
        </div>

        {/* 3. Stay Free Button + No Credit Card - Centered Vertically */}
        <div className="flex flex-col items-center space-y-3">
          {/* Stay Free - Now Clickable Button */}
          <button
            onClick={() => setShowPricingModal(true)}
            className="text-green-400 font-bold text-xl hover:text-green-300 transition-colors"
          >
            STAY FREE
          </button>
          
          {/* No Credit Card - Centered Below */}
          <div className="flex items-center space-x-2 text-white/70">
            <img 
              src="/images/no_credit_card.png" 
              alt="No Credit Card" 
              className="w-8 h-6"
            />
            <span>no credit card</span>
          </div>
        </div>

      </div>

      {/* Footer - Fixed at Bottom */}
      <footer className="relative z-10 px-4 py-6">
        <div className="flex justify-center items-center space-x-8 text-white/60 text-sm">
          <span>© 2025 VideoFlip</span>
          <a href="/terms" className="hover:text-white transition-colors underline">terms</a>
          <a href="/privacy" className="hover:text-white transition-colors underline">privacy</a>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* "Guitar Wha?" Modal - YOUR ACTUAL IMAGE with Hotspots */}
      {showWhatModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => handleModalBackdropClick(e, () => setShowWhatModal(false))}
        >
          <div className="bg-black rounded-2xl shadow-2xl max-w-5xl w-full relative">
            {/* Close Button */}
            <button
              onClick={() => setShowWhatModal(false)}
              className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white transition-colors bg-black/50 rounded-full p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content - YOUR ACTUAL IMAGE */}
            <div className="relative">
              <img 
                src="/images/webUiExample__HomePage_modalWHAT.png" 
                alt="Features Overview" 
                className="w-full rounded-2xl"
              />
              
              {/* Invisible Hotspot Areas Positioned Over Your Image */}
              
              {/* Custom Loops Hotspot (Pink Infinity) - Bottom Right Area */}
              <button
                onClick={() => handleFeatureClick('loops')}
                className="absolute bottom-[15%] right-[15%] w-[12%] h-[25%] hover:bg-pink-500/20 transition-colors rounded-lg"
                title="Custom Loops"
              />

              {/* Login Resume Hotspot (Green Power Button) - Bottom Far Right */}
              <button
                onClick={() => handleFeatureClick('resume')}
                className="absolute bottom-[15%] right-[2%] w-[12%] h-[25%] hover:bg-green-500/20 transition-colors rounded-lg"
                title="Login & Resume"
              />
            </div>
          </div>
        </div>
      )}

      {/* Feature Detail Modal (Custom Loops) */}
      {showFeatureModal === 'loops' && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => handleModalBackdropClick(e, () => setShowFeatureModal(null))}
        >
          <div className="bg-black rounded-2xl shadow-2xl max-w-2xl w-full relative text-white p-8">
            {/* Close Button */}
            <button
              onClick={() => setShowFeatureModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Feature Icon */}
            <div className="text-center mb-6">
              <div className="text-8xl text-pink-400 mb-4">∞</div>
              <h2 className="text-3xl font-bold">Custom Loops</h2>
            </div>

            {/* Feature Description */}
            <div className="space-y-4 text-gray-300">
              <p>
                Create precise practice loops for mastering difficult sections. Perfect for musicians who want to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Loop challenging guitar solos or chord progressions</li>
                <li>Practice difficult timing or rhythm sections</li>
                <li>Master complex fingerpicking patterns</li>
                <li>Perfect transitions between chords</li>
              </ul>
              <div className="bg-pink-900/30 p-4 rounded-lg border border-pink-500/30 mt-6">
                <p className="text-pink-300 text-sm">
                  <strong>Premium Feature:</strong> Custom loops require a subscription for unlimited use and saving capabilities.
                </p>
              </div>
              
              {/* Back to Overview Button */}
              <button
                onClick={() => {
                  setShowFeatureModal(null)
                  setShowWhatModal(true)
                }}
                className="mt-6 bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
              >
                ← Back to Overview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Detail Modal (Login Resume) */}
      {showFeatureModal === 'resume' && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => handleModalBackdropClick(e, () => setShowFeatureModal(null))}
        >
          <div className="bg-black rounded-2xl shadow-2xl max-w-2xl w-full relative text-white p-8">
            {/* Close Button */}
            <button
              onClick={() => setShowFeatureModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Feature Icon */}
            <div className="text-center mb-6">
              <div className="text-8xl text-green-400 mb-4">⏻</div>
              <h2 className="text-3xl font-bold">Login & Resume</h2>
            </div>

            {/* Feature Description */}
            <div className="space-y-4 text-gray-300">
              <p>
                Never lose your place again. Resume exactly where you left off with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Exact timeline position saved automatically</li>
                <li>Custom loop settings preserved</li>
                <li>Video flip preferences remembered</li>
                <li>Cross-device synchronization</li>
              </ul>
              <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30 mt-6">
                <p className="text-green-300 text-sm">
                  <strong>Premium Feature:</strong> Session resume is available for premium subscribers across all devices.
                </p>
              </div>
              
              {/* Back to Overview Button */}
              <button
                onClick={() => {
                  setShowFeatureModal(null)
                  setShowWhatModal(true)
                }}
                className="mt-6 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                ← Back to Overview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricingModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => handleModalBackdropClick(e, () => setShowPricingModal(false))}
        >
          <div className="bg-black rounded-2xl shadow-2xl max-w-4xl w-full relative text-white">
            {/* Close Button */}
            <button
              onClick={() => setShowPricingModal(false)}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Pricing Table */}
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
                <p className="text-gray-400">Start free, upgrade when you're ready</p>
              </div>

              {/* Pricing Tiers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Freebird */}
                <div className="border border-gray-600 rounded-xl p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">freebird</h3>
                    <div className="text-yellow-400 font-bold text-lg mb-4">zip</div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>flippin some vids</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>loopin some segments</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <span className="mr-3">✗</span>
                      <span>resume on login</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <span className="mr-3">✗</span>
                      <span>chords & captions</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <span className="mr-3">✗</span>
                      <span>tabs (coming soon)</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2 text-sm text-gray-400">
                    <div>max savie favies: <span className="text-white">0</span></div>
                    <div>max daily searches: <span className="text-white">20</span></div>
                    <div>max daily watch time: <span className="text-white">2 hrs.</span></div>
                  </div>

                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="w-full mt-6 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Get Started Free
                  </button>
                </div>

                {/* Groupie */}
                <div className="border border-yellow-500 rounded-xl p-6 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                    POPULAR
                  </div>
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">groupie</h3>
                    <div className="text-yellow-400 font-bold text-lg mb-4">8 bucks</div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>flippin some vids</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>loopin some segments</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <span className="mr-3">✗</span>
                      <span>resume on login</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>chords & captions</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>tabs (coming soon)</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2 text-sm text-gray-400">
                    <div>max savie favies: <span className="text-yellow-400">25</span></div>
                    <div>max daily searches: <span className="text-yellow-400">60</span></div>
                    <div>max daily watch time: <span className="text-yellow-400">3 hrs.</span></div>
                  </div>

                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="w-full mt-6 bg-yellow-500 text-black py-3 rounded-lg hover:bg-yellow-400 transition-colors font-bold"
                  >
                    Start Groupie
                  </button>
                </div>

                {/* Wonderwall */}
                <div className="border border-green-500 rounded-xl p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">wonderwall</h3>
                    <div className="text-green-400 font-bold text-lg mb-4">15 bucks</div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>flippin some vids</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>loopin some segments</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>resume on login</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>chords & captions</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>tabs (coming soon)</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2 text-sm text-gray-400">
                    <div>max savie favies: <span className="text-green-400">UNLIMITED</span></div>
                    <div>max daily searches: <span className="text-green-400">UNLIMITED</span></div>
                    <div>max daily watch time: <span className="text-green-400">8 hrs.</span></div>
                  </div>

                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="w-full mt-6 bg-green-500 text-black py-3 rounded-lg hover:bg-green-400 transition-colors font-bold"
                  >
                    Go Wonderwall
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}