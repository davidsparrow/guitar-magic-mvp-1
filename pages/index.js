// pages/index.js - Fixed Homepage with Smart Navigation
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'
import { useRouter } from 'next/router'

export default function Home() {
  const { isAuthenticated, user, profile, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Smart redirect logic - only redirect on direct page loads
  useEffect(() => {
    if (mounted && isAuthenticated && !loading && router.isReady) {
      // Check if user came via logo click or direct navigation
      const urlParams = new URLSearchParams(window.location.search)
      const isIntentionalHomeVisit = urlParams.get('home') === 'true'
      const referrer = document.referrer
      const isDirectNavigation = !referrer || !referrer.includes(window.location.origin)
      
      // Only redirect if it's a direct navigation (typed URL) and not intentional
      if (isDirectNavigation && !isIntentionalHomeVisit) {
        router.replace('/search')
      }
    }
  }, [mounted, isAuthenticated, loading, router])

  // Don't render auth-dependent content until mounted
  if (!mounted || (loading && !router.isReady)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">YV</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VideoFlip
              </h1>
            </div>

            {/* Dynamic content based on authentication */}
            {isAuthenticated ? (
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
                </h2>
                <p className="text-xl text-gray-600 mb-6">
                  Ready to flip some videos and create amazing loops?
                </p>
                <a
                  href="/search"
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg inline-block"
                >
                  Go to Video Search 🚀
                </a>
              </div>
            ) : (
              <>
                {/* Hero Text for non-authenticated users */}
                <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
                  Transform Your
                  <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    YouTube Experience
                  </span>
                </h2>

                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Flip videos, create custom loops, and enjoy YouTube like never before. 
                  Perfect for learning, entertainment, and creative exploration.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Get Started Free
                  </button>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 border-2 border-gray-200"
                  >
                    See Features
                  </button>
                </div>
              </>
            )}

            {/* Features Preview */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl">🔄</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Video Flipping</h3>
                <p className="text-gray-600">Flip videos vertically, horizontally, or both for unique viewing experiences.</p>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl">🔁</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Custom Loops</h3>
                <p className="text-gray-600">
                  Create precise loop points for practice, study, or entertainment.
                  <span className="block text-sm text-yellow-600 font-medium mt-1">Premium Feature</span>
                </p>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Clean Interface</h3>
                <p className="text-gray-600">Distraction-free design focused entirely on your video content.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section - Only show for non-authenticated users */}
        {!isAuthenticated && (
          <div className="bg-white/30 backdrop-blur-sm py-20">
            <div className="max-w-4xl mx-auto px-4">
              <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Choose Your Plan
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Free Plan */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
                  <div className="text-center">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">Free</h4>
                    <p className="text-4xl font-bold text-gray-900 mb-6">
                      $0<span className="text-lg text-gray-500">/month</span>
                    </p>
                    
                    <ul className="space-y-3 mb-8 text-left">
                      <li className="flex items-center">
                        <span className="text-green-500 mr-3">✓</span>
                        Video search & playback
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-3">✓</span>
                        Basic flip controls
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-3">✓</span>
                        20 searches per day
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-3">✓</span>
                        Last 5 search history
                      </li>
                    </ul>
                    
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Get Started
                    </button>
                  </div>
                </div>

                {/* Premium Plan */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 shadow-xl border-2 border-blue-500 relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                  
                  <div className="text-center text-white">
                    <h4 className="text-2xl font-bold mb-2">Premium</h4>
                    <p className="text-4xl font-bold mb-6">
                      $9<span className="text-lg opacity-80">/month</span>
                    </p>
                    
                    <ul className="space-y-3 mb-8 text-left">
                      <li className="flex items-center">
                        <span className="text-green-300 mr-3">✓</span>
                        Everything in Free
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-300 mr-3">✓</span>
                        Custom loop timeline
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-300 mr-3">✓</span>
                        Save custom loops
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-300 mr-3">✓</span>
                        Unlimited searches
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-300 mr-3">✓</span>
                        Full search history
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-300 mr-3">✓</span>
                        No ads
                      </li>
                    </ul>
                    
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Start Premium
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  )
}