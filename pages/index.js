// pages/index.js - Simple Homepage Design Following Exact Layout
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Full-Screen Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(88, 28, 135, 0.85), rgba(168, 85, 247, 0.85)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><pattern id="guitar" patternUnits="userSpaceOnUse" width="100" height="100"><rect width="100" height="100" fill="%23451a3a"/><circle cx="50" cy="50" r="1" fill="%23f59e0b" opacity="0.3"/></pattern></defs><rect width="1200" height="800" fill="url(%23guitar)"/></svg>')`
        }}
      />

      {/* Transparent Header */}
      <header className="relative z-10 px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo - Upper Left */}
          <a 
            href="/?home=true" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 via-green-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-b-[10px] border-b-white border-r-[6px] border-r-transparent ml-1"></div>
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">VideoFlip</span>
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

      {/* Main Content - Only 3 Elements */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6 -mt-20">
        
        {/* 1. Large Centered Tall Logo */}
        <div className="mb-8">
          <div className="flex flex-col items-center">
            {/* Large Logo Icon */}
            <div className="w-24 h-24 mb-6 bg-gradient-to-br from-yellow-400 via-green-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-b-[20px] border-b-white border-r-[12px] border-r-transparent ml-2"></div>
            </div>
            
            {/* Brand Name */}
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-2 tracking-tight">
              VideoFlip
            </h1>
          </div>
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

        {/* 3. Stay Free + No Credit Card */}
        <div className="flex items-center justify-center space-x-3">
          <div className="text-green-400 font-bold text-xl">
            STAY FREE
          </div>
          <div className="flex items-center space-x-2 text-white/70">
            <span>no credit card</span>
            {/* No Credit Card Icon Placeholder */}
            <div className="w-8 h-6 bg-red-500 rounded border border-white/20 flex items-center justify-center relative">
              <div className="w-1 h-3 bg-white rounded"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 border-2 border-red-500 bg-white rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6">
        <div className="flex justify-center items-center space-x-8 text-white/60 text-sm">
          <span>© 2025 VideoFlip</span>
          <button 
            onClick={() => setShowPricingModal(true)}
            className="hover:text-white transition-colors underline"
          >
            pricing
          </button>
          <a href="/terms" className="hover:text-white transition-colors underline">terms</a>
          <a href="/privacy" className="hover:text-white transition-colors underline">privacy</a>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* "Guitar Wha?" Modal with Hotspots */}
      {showWhatModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => handleModalBackdropClick(e, () => setShowWhatModal(false))}
        >
          <div className="bg-black rounded-2xl shadow-2xl max-w-4xl w-full relative">
            {/* Close Button */}
            <button
              onClick={() => setShowWhatModal(false)}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content - Recreation of webUiExample__HomePage_modalWHAT.png */}
            <div className="p-8 text-white">
              {/* Top Row */}
              <div className="flex justify-between items-start mb-8">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-4">lesson orientation</h3>
                  <div className="w-64 h-36 bg-gray-800 rounded-lg border-2 border-white flex items-center justify-center relative">
                    <div className="text-4xl">🎸</div>
                    <div className="absolute bottom-2 left-2 w-8 h-6 bg-red-600 rounded flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[3px] border-l-transparent border-b-[5px] border-b-white border-r-[3px] border-r-transparent ml-0.5"></div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-bold mb-4">your brain</h3>
                  <div className="text-6xl">🧠</div>
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-bold mb-4">your progress</h3>
                  <div className="text-6xl">😊</div>
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-bold mb-4">and...</h3>
                  <div className="text-4xl text-gray-500">zip -.001</div>
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-bold mb-4">plus...</h3>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="w-64 h-36 bg-gray-800 rounded-lg border-2 border-white flex items-center justify-center relative">
                    <div className="text-4xl">🎸</div>
                    <div className="absolute bottom-2 left-2 w-8 h-6 bg-gradient-to-br from-yellow-400 via-green-400 to-orange-500 rounded flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[3px] border-l-transparent border-b-[5px] border-b-white border-r-[3px] border-r-transparent ml-0.5"></div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-6xl text-yellow-400">💡</div>
                </div>

                <div className="text-center">
                  <div className="text-6xl text-orange-400">🐆</div>
                </div>

                {/* Custom Loops Hotspot */}
                <button
                  onClick={() => handleFeatureClick('loops')}
                  className="text-center hover:scale-105 transition-transform"
                >
                  <div className="text-6xl text-pink-400">∞</div>
                  <div className="text-pink-400 font-bold mt-2">custom loops</div>
                </button>

                {/* Login Resume Hotspot */}
                <button
                  onClick={() => handleFeatureClick('resume')}
                  className="text-center hover:scale-105 transition-transform"
                >
                  <div className="text-6xl text-green-400">⏻</div>
                  <div className="text-green-400 font-bold mt-2">login - resume</div>
                </button>
              </div>
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