// pages/index.js - Homepage Using Your Actual Images
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'
import { useRouter } from 'next/router'
import { GiGuitar } from "react-icons/gi"
import { FaHamburger } from "react-icons/fa"
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
      {/* Transparent Header */}
      <header className="relative z-10 px-6 py-4" style={{ backgroundColor: 'transparent' }}>
        <div className="flex justify-between items-center">
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
            <FaHamburger className="w-6 h-6" />
          </button>
        </div>
      </header>
      {/* Main Content - Fixed Height, No Scroll */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6" style={{ 
        height: 'calc(100vh - 140px)',
        backgroundColor: 'transparent'
      }}>
        {/* 1. Large Centered Logo - YOUR ACTUAL IMAGE */}
        <div className="mb-8">
          <img 
            src="/images/gt_logoM_PlayButton.png" 
            alt="GuitarTube" 
            className="mx-auto mb-2 h-48 w-auto"
          />
          <p className="text-center text-white font-medium text-base uppercase" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Press Fast-Fwd on your Guitar Mastery
          </p>
        </div>
        {/* 2. "Guitar Wha?" Pill Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowWhatModal(true)}
            className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
          >
            <span>Guitar Wha?</span>
            <GiGuitar className="text-white text-xl" />
          </button>
        </div>
        {/* 3. Stay Free Button + No Credit Card - Centered Vertically */}
        <div className="flex flex-col items-center space-y-2">
          {/* Stay Free - Now Clickable Button with Shiny Effect */}
          <button
            onClick={() => setShowPricingModal(true)}
            className="relative text-green-400 font-bold text-2xl hover:text-green-300 transition-all duration-500 transform hover:scale-105 overflow-hidden group px-6 py-2 rounded-full"
          >
            <span className="relative z-10 bg-gradient-to-r from-green-400 via-emerald-300 to-green-400 bg-clip-text text-transparent animate-shine">
              STAY FREE
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-emerald-300/40 to-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm rounded-full"></div>
          </button>
          {/* No Credit Card - Centered Below, Smaller and Closer */}
          <div className="flex items-center space-x-2 text-white/70 -mt-1">
            <img 
              src="/images/no_credit_card.png" 
              alt="No Credit Card" 
              className="w-6 h-4"
            />
            <span className="text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>no credit card</span>
          </div>
        </div>
      </div>
      {/* Footer - Fixed at Bottom */}
      <footer className="relative z-10 px-6 py-6" style={{ backgroundColor: 'transparent' }}>
        <div className="flex justify-center items-center space-x-8 text-white/60 text-sm">
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
              className="absolute top-4 right-4 z-20 text-gray-300 hover:text-white transition-colors bg-black/50 rounded-full p-2 text-2xl font-bold"
            >
              ×
            </button>
            {/* Modal Content - YOUR ACTUAL IMAGE */}
            <div className="relative">
              <img 
                src="/images/webUiExample__HomePage_modalWHAT.png" 
                alt="Features Overview" 
                className="w-full rounded-2xl"
              />
              {/* Invisible Hotspot Areas Positioned Over Your Image */}
              {/* Custom Loops Hotspot (Pink Infinity) - Now Stacked Above Login Resume */}
              <button
                onClick={() => handleFeatureClick('loops')}
                className="absolute bottom-[25%] right-[25%] w-[12%] h-[20%] hover:bg-pink-500/20 transition-colors rounded-lg"
                title="Custom Loops"
              />

              {/* Cheetah Hotspot (Duplicated from Custom Loops, moved 30px left, 5px down) */}
              <button
                onClick={() => handleFeatureClick('cheetah')}
                className="absolute bottom-[14%] right-[41%] w-[15%] h-[23%] hover:bg-orange-500/20 transition-colors rounded-lg"
                title="Cheetah"
              />

              {/* Lightbulb Hotspot (Duplicated from Cheetah, moved 10px left) */}
              <button
                onClick={() => handleFeatureClick('lightbulb-brain')}
                className="absolute bottom-[14%] right-[58%] w-[15%] h-[23%] hover:bg-yellow-500/20 transition-colors rounded-lg"
                title="Lightbulb Brain"
              />

              {/* Stringbrain Hotspot (Duplicated from Cheetah, moved 20px up) */}
              <button
                onClick={() => handleFeatureClick('sloth')}
                className="absolute bottom-[47%] right-[41%] w-[15%] h-[23%] hover:bg-red-500/20 transition-colors rounded-lg"
                title="Sloth"
              />

              {/* Sloth Hotspot (Duplicated from Lightbulb, moved 20px up) */}
              <button
                onClick={() => handleFeatureClick('scrambled-brain')}
                className="absolute bottom-[47%] right-[58%] w-[15%] h-[23%] hover:bg-orange-500/20 transition-colors rounded-lg"
                title="Stringbrain"
              />
              {/* Login Resume Hotspot (Green Power Button) - Now Stacked Below Custom Loops */}
              <button
                onClick={() => handleFeatureClick('resume')}
                className="absolute bottom-[5%] right-[25%] w-[12%] h-[20%] hover:bg-green-500/20 transition-colors rounded-lg"
                title="Login & Resume"
              />
              {/* Auto-gen Chords Hotspot (Light Blue Guitar Chord Diagram) - New Feature */}
              <button
                onClick={() => handleFeatureClick('chords')}
                className="absolute bottom-[25%] right-[7%] w-[12%] h-[20%] hover:bg-blue-500/20 transition-colors rounded-lg"
                title="Auto-gen Chords"
              />
              {/* Auto-gen Tabs Hotspot (Green Guitar Tablature) - New Feature */}
              <button
                onClick={() => handleFeatureClick('tabs')}
                className="absolute bottom-[5%] right-[7%] w-[12%] h-[20%] hover:bg-green-500/20 transition-colors rounded-lg"
                title="Auto-gen Tabs"
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
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors text-2xl font-bold"
            >
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
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors text-2xl font-bold"
            >
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
      {/* Feature Detail Modal (Auto-gen Chords) */}
      {showFeatureModal === 'chords' && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => handleModalBackdropClick(e, () => setShowFeatureModal(null))}
        >
          <div className="bg-black rounded-2xl shadow-2xl max-w-2xl w-full relative text-white p-8">
            {/* Close Button */}
            <button
              onClick={() => setShowFeatureModal(null)}
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors text-2xl font-bold"
            >
            </button>
            {/* Feature Icon */}
            <div className="text-center mb-6">
              <div className="text-8xl text-blue-400 mb-4">🎸</div>
              <h2 className="text-3xl font-bold">Auto-gen Chords</h2>
            </div>
            {/* Feature Description */}
            <div className="space-y-4 text-gray-300">
              <p>
                Automatically generate guitar chord diagrams for any song section. Perfect for musicians who want to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>See chord fingerings in real-time</li>
                <li>Learn proper chord transitions</li>
                <li>Understand chord progressions</li>
                <li>Practice with visual chord guides</li>
              </ul>
              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30 mt-6">
                <p className="text-blue-300 text-sm">
                  <strong>Premium Feature:</strong> Auto-generated chords are available for premium subscribers with unlimited access.
                </p>
              </div>
              {/* Back to Overview Button */}
              <button
                onClick={() => {
                  setShowFeatureModal(null)
                  setShowWhatModal(true)
                }}
                className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                ← Back to Overview
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Feature Detail Modal (Auto-gen Tabs) */}
      {showFeatureModal === 'tabs' && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => handleModalBackdropClick(e, () => setShowFeatureModal(null))}
        >
          <div className="bg-black rounded-2xl shadow-2xl max-w-2xl w-full relative text-white p-8">
            {/* Close Button */}
            <button
              onClick={() => setShowFeatureModal(null)}
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors text-2xl font-bold"
            >
              ×
            </button>
            {/* Feature Icon */}
            <div className="text-center mb-6">
              <div className="text-8xl text-green-400 mb-4">📝</div>
              <h2 className="text-3xl font-bold">Auto-gen Tabs</h2>
            </div>
            {/* Feature Description */}
            <div className="space-y-4 text-gray-300">
              <p>
                Automatically generate guitar tablature for any song section. Perfect for musicians who want to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>See exact finger positions and strings</li>
                <li>Learn complex guitar solos note-by-note</li>
                <li>Practice with precise tablature</li>
                <li>Master difficult guitar techniques</li>
              </ul>
              <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30 mt-6">
                <p className="text-green-300 text-sm">
                  <strong>Premium Feature:</strong> Auto-generated tabs are available for premium subscribers with unlimited access.
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
      {/* Feature Detail Modal (Scrambled Brain) */}
      {showFeatureModal === 'scrambled-brain' && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => handleModalBackdropClick(e, () => setShowFeatureModal(null))}
        >
          <div className="bg-black rounded-2xl shadow-2xl max-w-2xl w-full relative text-white p-8">
            {/* Close Button */}
            <button
              onClick={() => setShowFeatureModal(null)}
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors text-2xl font-bold"
            >
              ×
            </button>
            {/* Feature Icon */}
            <div className="text-center mb-6">
              <div className="text-8xl text-red-400 mb-4">🧠</div>
              <h2 className="text-3xl font-bold">Why Video Flipping is Hard</h2>
            </div>
            {/* Feature Description */}
            <div className="space-y-4 text-gray-300">
              <p>
                Ever tried learning guitar from a video and felt like your brain was doing mental gymnastics? Here's why:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Guitar players in videos face you (upright)</li>
                <li>But when you play guitar, you see the fretboard from above</li>
                <li>Your brain has to flip the image TWICE to understand it</li>
                <li>It's like trying to read a book through a mirror while standing on your head!</li>
              </ul>
              <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/30 mt-6">
                <p className="text-red-300 text-sm">
                  <strong>The Problem:</strong> Learning new chords and fingerings is hard enough without this mental flip-flopping!
                </p>
              </div>
              {/* Back to Overview Button */}
              <button
                onClick={() => {
                  setShowFeatureModal(null)
                  setShowWhatModal(true)
                }}
                className="mt-6 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                ← Back to Overview
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Feature Detail Modal (Lightbulb Brain) */}
      {showFeatureModal === 'lightbulb-brain' && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => handleModalBackdropClick(e, () => setShowFeatureModal(null))}
        >
          <div className="bg-black rounded-2xl shadow-2xl max-w-2xl w-full relative text-white p-8">
            {/* Close Button */}
            <button
              onClick={() => setShowFeatureModal(null)}
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors text-2xl font-bold"
            >
              ×
            </button>
            {/* Feature Icon */}
            <div className="text-center mb-6">
              <div className="text-8xl text-yellow-400 mb-4">💡</div>
              <h2 className="text-3xl font-bold">How We Fix It</h2>
            </div>
            {/* Feature Description */}
            <div className="space-y-4 text-gray-300">
              <p>
                GuitarTube flips the video for you, so you see the fretboard exactly like you do when playing:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>No more mental gymnastics or brain flipping</li>
                <li>See fingers and frets from your perspective</li>
                <li>Works for any fretted instrument (guitar, bass, ukulele, etc.)</li>
                <li>Your brain can focus on learning, not spatial reasoning</li>
              </ul>
              <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-500/30 mt-6">
                <p className="text-yellow-300 text-sm">
                  <strong>The Solution:</strong> We do the flipping so you don't have to think about it!
                </p>
              </div>
              {/* Back to Overview Button */}
              <button
                onClick={() => {
                  setShowFeatureModal(null)
                  setShowWhatModal(true)
                }}
                className="mt-6 bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-bold"
              >
                ← Back to Overview
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Feature Detail Modal (Sloth) */}
      {showFeatureModal === 'sloth' && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => handleModalBackdropClick(e, () => setShowFeatureModal(null))}
        >
          <div className="bg-black rounded-2xl shadow-2xl max-w-2xl w-full relative text-white p-8">
            {/* Close Button */}
            <button
              onClick={() => setShowFeatureModal(null)}
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors text-2xl font-bold"
            >
              ×
            </button>
            {/* Feature Icon */}
            <div className="text-center mb-6">
              <div className="text-8xl text-orange-400 mb-4">🦥</div>
              <h2 className="text-3xl font-bold">Before GuitarTube</h2>
            </div>
            {/* Feature Description */}
            <div className="space-y-4 text-gray-300">
              <p>
                Learning guitar without GuitarTube is like watching a sloth try to win a marathon - painfully slow and kinda hilarious:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Sloths move at 0.15 mph (slower than a snail!)</li>
                <li>They sleep 15-20 hours per day (sound familiar?)</li>
                <li>It takes them 30 days to digest one leaf</li>
                <li>They're so slow, algae grows on their fur!</li>
              </ul>
              <div className="bg-orange-900/30 p-4 rounded-lg border border-orange-500/30 mt-6">
                <p className="text-red-300 text-sm">
                  <strong>The Reality:</strong> Without proper video flipping, learning guitar feels this slow - you're basically a musical sloth! 🦥
                </p>
              </div>
              {/* Back to Overview Button */}
              <button
                onClick={() => {
                  setShowFeatureModal(null)
                  setShowWhatModal(true)
                }}
                className="mt-6 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                ← Back to Overview
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Feature Detail Modal (Cheetah) */}
      {showFeatureModal === 'cheetah' && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => handleModalBackdropClick(e, () => setShowFeatureModal(null))}
        >
          <div className="bg-black rounded-2xl shadow-2xl max-w-2xl w-full relative text-white p-8">
            {/* Close Button */}
            <button
              onClick={() => setShowFeatureModal(null)}
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors text-2xl font-bold"
            >
              ×
            </button>
            {/* Feature Icon */}
            <div className="text-center mb-6">
              <div className="text-8xl text-orange-400 mb-4">🐆</div>
              <h2 className="text-3xl font-bold">After GuitarTube</h2>
            </div>
            {/* Feature Description */}
            <div className="space-y-4 text-gray-300">
              <p>
                With GuitarTube, you'll be learning guitar like a cheetah chasing its prey - lightning fast and unstoppable:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cheetahs can accelerate from 0 to 60 mph in just 3 seconds</li>
                <li>They can reach speeds up to 70 mph (faster than most cars!)</li>
                <li>They can change direction mid-sprint without losing speed</li>
                <li>They're the fastest land animals on Earth</li>
              </ul>
              <div className="bg-orange-900/30 p-4 rounded-lg border border-orange-500/30 mt-6">
                <p className="text-orange-300 text-sm">
                  <strong>The Result:</strong> With proper video flipping, you'll learn guitar at cheetah speed - fast, smooth, and efficient! 🐆
                </p>
              </div>
              {/* Back to Overview Button */}
              <button
                onClick={() => {
                  setShowFeatureModal(null)
                  setShowWhatModal(true)
                }}
                className="mt-6 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
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