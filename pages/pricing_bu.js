// pages/pricing.js - Dedicated Pricing Page
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Pricing() {
  const { isAuthenticated, user, profile, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isAnnualBilling, setIsAnnualBilling] = useState(true) // Default to annual billing
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])



  if (!mounted || (loading && !router.isReady)) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Pricing - GuitarTube</title>
        <meta name="description" content="Choose your GuitarTube plan - Freebird, Roadie, or Hero. Start learning guitar with our video tools." />
      </Head>
      
      <div className="relative min-h-screen bg-black text-white">
        {/* Header with Logo and Navigation */}
        <header className="relative z-10 p-4">
          <div className="flex items-center justify-between">
            {/* Logo - Clickable to go home */}
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/images/gt_logoM_wide_on_black.png" 
                  alt="GuitarTube Logo" 
                  className="h-8 w-auto"
                />
              </button>
            </div>
            
            {/* Auth Button */}
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-bold"
            >
              Sign In
            </button>
          </div>
        </header>

        {/* Main Pricing Content */}
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Pricing Table */}
          <div className="bg-black rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">Choose Your Plan</h1>
              <p className="text-gray-400 text-lg">Guitars. You can't buy just one.</p>
            </div>
            
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
              <div className="border border-gray-600 rounded-xl p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Freebird</h3>
                  <div className="text-gray-400 font-bold text-base mb-4">free</div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <span className="text-green-400 mr-3">✓</span>
                    <span>Flippin some vids</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-400 mr-3">✓</span>
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
                  <div>max daily watch time: <span className="text-white">90 Min.</span></div>
                </div>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="w-full mt-6 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Get Started Free
                </button>
              </div>

              {/* Roadie */}
              <div className="border border-yellow-500 rounded-xl p-6 relative">
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
                    <span>Login Resume</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-400 mr-3">✓</span>
                    <span>Captions</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-black mr-3">-</span>
                    <span className="text-black">-</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-black mr-3">-</span>
                    <span className="text-black">-</span>
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
              <div className="border border-green-500 rounded-xl p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Hero</h3>
                  <div className="text-green-400 font-bold text-base mb-4">
                    ${isAnnualBilling ? '15' : '19'}/mo.
                  </div>
                </div>
                <div className="space-y-3 text-sm">
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
        </main>



        {/* Auth Modal */}
        {showAuthModal && (
          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)} 
          />
        )}
      </div>
    </>
  )
}
