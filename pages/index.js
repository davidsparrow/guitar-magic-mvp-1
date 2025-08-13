// pages/index.js - Homepage Using Your Actual Images
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'
import { useRouter } from 'next/router'
import { LuBrain } from "react-icons/lu"
import { FaHamburger } from "react-icons/fa"
import { FaRegCreditCard } from "react-icons/fa"
import { IoMdPower } from "react-icons/io"
import { RiLogoutCircleRLine } from "react-icons/ri"
export default function Home() {
  const { isAuthenticated, user, profile, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showWhatModal, setShowWhatModal] = useState(false)
  const [showFeatureModal, setShowFeatureModal] = useState(null) // 'loops' or 'resume'
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [isAnnualBilling, setIsAnnualBilling] = useState(true) // Default to annual billing
  const [mounted, setMounted] = useState(false)
  const [showRightMenuModal, setShowRightMenuModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showCaptionsModal, setShowCaptionsModal] = useState(false)
  const [showChordDiagramsModal, setShowChordDiagramsModal] = useState(false)
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
    
    // Handle new modal types
    if (feature === 'captions') {
      setShowCaptionsModal(true)
    } else if (feature === 'chord-diagrams') {
      setShowChordDiagramsModal(true)
    } else {
      // Handle existing feature modals
      setShowFeatureModal(feature)
    }
  }

  // Handle login/logout
  const handleAuthClick = async () => {
    if (isAuthenticated) {
      // User is logged in, sign them out
      try {
        await signOut()
        // Close any open modals
        setShowAuthModal(false)
        setShowPricingModal(false)
        setShowWhatModal(false)
        setShowFeatureModal(null)
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
          {/* Right side buttons */}
          <div className="flex items-center space-x-2">
            {/* Brain Icon Button - Now in right flex container */}
            <button
              onClick={() => setShowWhatModal(true)}
              className="p-2 rounded-lg transition-colors duration-300 relative group text-white hover:bg-white/10"
              title="Guitar Wha?"
            >
              <LuBrain className="w-6 h-6 group-hover:text-yellow-400 transition-colors" />
            </button>
            
            {/* Login/Logout Icon */}
            <button 
              onClick={handleAuthClick}
              className="p-2 rounded-lg transition-colors duration-300 relative group text-white hover:bg-white/10"
              title={isAuthenticated ? "End of the Party" : "Start Me Up"}
            >
              {isAuthenticated ? (
                <RiLogoutCircleRLine className="w-6 h-6 group-hover:text-yellow-400 transition-colors" />
              ) : (
                <IoMdPower className="w-6 h-6 group-hover:text-green-400 transition-colors" />
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
              <FaHamburger className="w-6 h-6 group-hover:text-yellow-400 transition-colors" />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 shadow-lg">
                Yummy
              </div>
            </button>
          </div>
        </div>
      </header>
      {/* Main Content - Fixed Height, No Scroll */}
      <div className="relative z-10 flex flex-col items-center px-6" style={{ 
        height: 'calc(100vh - 140px)',
        backgroundColor: 'transparent'
      }}>
        {/* 1. Large Centered Logo - YOUR ACTUAL IMAGE */}
        <div className="mt-32 mb-8">
          <img 
            src="/images/gt_logoM_PlayButton.png" 
            alt="GuitarTube" 
            className="mx-auto mb-2 h-48 w-auto"
          />
          <p className="text-center text-white font-medium text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Press fast-forward on Video Guitar Learning
          </p>
        </div>
        
        {/* 2. Stay Free Button - Moved to Bottom */}
        <div className="mt-auto mb-4">
          {/* Stay Free - Now Clickable Button with Shiny Effect */}
          <button
            onClick={() => setShowPricingModal(true)}
            className="relative text-green-400 font-bold text-2xl hover:text-green-300 transition-all duration-500 transform hover:scale-105 overflow-hidden group px-6 py-2 rounded-full"
            title="No credit card required to Join, only to Cancel. Fair right?"
          >
            <span className="relative z-10 bg-gradient-to-r from-green-400 via-emerald-300 to-green-400 bg-clip-text text-transparent animate-shine">
              STAY FREE
            </span>
            <img 
              src="/images/no_credit_card2.png" 
              alt="No Credit Card" 
              className="inline-block ml-3 -mt-0.5 w-7 h-7"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-emerald-300/40 to-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm rounded-full"></div>
          </button>
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
                onError={(e) => {
                  console.error('Image failed to load:', e.target.src);
                  e.target.style.display = 'none';
                }}
              />
              {/* Invisible Hotspot Areas Positioned Over Your Image */}
              {/* Custom Loops Hotspot (Pink Infinity) - Moved 12px left */}
              <button
                onClick={() => handleFeatureClick('loops')}
                className="absolute bottom-[25%] right-[34.5%] w-[12%] h-[20%] hover:bg-pink-500/20 transition-colors rounded-lg"
                title="Custom Loops"
              />

              {/* Cheetah Hotspot (Duplicated from Custom Loops, moved 30px left, 5px down) */}
                                  <button
                      onClick={() => handleFeatureClick('cheetah')}
                      className="absolute bottom-[14%] right-[49%] w-[13%] h-[23%] hover:bg-orange-500/20 transition-colors rounded-lg"
                      title="Wayyyy faster"
                    />

              {/* Lightbulb Hotspot (Duplicated from Cheetah, moved 10px left) */}
                                  <button
                      onClick={() => handleFeatureClick('lightbulb-brain')}
                      className="absolute bottom-[14%] right-[64%] w-[13%] h-[23%] hover:bg-yellow-500/20 transition-colors rounded-lg"
                      title="Lightbulb session"
                    />

                              {/* Stringbrain Hotspot (Duplicated from Cheetah, moved 20px up) */}
                <button
                  onClick={() => handleFeatureClick('sloth')}
                  className="absolute bottom-[47%] right-[49%] w-[13%] h-[23%] hover:bg-red-500/20 transition-colors rounded-lg"
                  title="Sad. But cute!"
                />

                {/* Sloth Hotspot (Duplicated from Lightbulb, moved 20px up) */}
                <button
                  onClick={() => handleFeatureClick('scrambled-brain')}
                  className="absolute bottom-[47%] right-[64%] w-[13%] h-[23%] hover:bg-orange-500/20 transition-colors rounded-lg"
                  title="Brain fog"
                />
              {/* Login Resume Hotspot (Green Power Button) - Moved 12px left */}
              <button
                onClick={() => handleFeatureClick('resume')}
                className="absolute bottom-[5%] right-[34.5%] w-[12%] h-[20%] hover:bg-green-500/20 transition-colors rounded-lg"
                title="Login & Resume"
              />
              {/* Auto-gen Chords Hotspot (Light Blue Guitar Chord Diagram) - New Feature */}
              <button
                onClick={() => handleFeatureClick('chords')}
                className="absolute bottom-[25%] right-[4.5%] w-[12%] h-[20%] hover:bg-blue-500/20 transition-colors rounded-lg"
                title="Auto-gen Chords"
              />
              {/* Auto-gen Tabs Hotspot (Green Guitar Tablature) - New Feature */}
                              <button
                  onClick={() => handleFeatureClick('tabs')}
                  className="absolute bottom-[5%] right-[4.5%] w-[12%] h-[20%] hover:bg-green-500/20 transition-colors rounded-lg"
                  title="Auto-gen Tabs"
                />
                
                {/* Duplicate hotspots moved 36 pixels left */}
                <button
                  onClick={() => handleFeatureClick('captions')}
                  className="absolute bottom-[25%] right-[20%] w-[12%] h-[20%] hover:bg-purple-500/20 transition-colors rounded-lg"
                  title="Custom Captions"
                />
                <button
                  onClick={() => handleFeatureClick('chord-diagrams')}
                  className="absolute bottom-[5%] right-[20%] w-[12%] h-[20%] hover:bg-orange-500/20 transition-colors rounded-lg"
                  title="Select Chord Diagrams"
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
            {/* Logo in upper left corner */}
            <div className="absolute top-4 left-4 z-10">
              <img 
                src="/images/gt_logoM_wide_on_black.png" 
                alt="GuitarTube Logo" 
                className="h-7 w-auto"
              />
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => setShowPricingModal(false)}
              className="absolute top-4 right-4 z-10 text-gray-300 hover:text-white transition-colors text-2xl font-bold"
            >
              ×
            </button>
            {/* Pricing Table */}
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
                <p className="text-gray-400">Guitars. You can't buy just one.</p>
              </div>
              
              {/* Billing Toggle */}
              <div className="flex items-center justify-center mb-8 space-x-4 order-first md:order-none">
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
                {/* Groupie */}
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
                    Start Groupie
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
                      <span>Everything in Groupie</span>
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
          </div>
        </div>
      )}
      
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
      
      {/* Custom Captions Modal */}
      {showCaptionsModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCaptionsModal(false)
            }
          }}
        >
          <div className="bg-black rounded-2xl shadow-2xl max-w-md w-full relative text-white p-8">
            {/* Close Button */}
            <button
              onClick={() => setShowCaptionsModal(false)}
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors text-2xl font-bold"
            >
              ×
            </button>
            
            {/* Captions Content */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-4">Custom Captions</h2>
            </div>
            
            <div className="space-y-4 text-gray-300">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Create Your Own Captions</p>
                <p className="font-medium">Add personalized text overlays to your guitar videos with our easy-to-use caption editor.</p>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Features</p>
                <ul className="text-sm space-y-1">
                  <li>• Custom text and fonts</li>
                  <li>• Multiple caption styles</li>
                  <li>• Timing controls</li>
                  <li>• Color customization</li>
                </ul>
              </div>
              
              <div className="pt-4">
                <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                  Start Creating Captions
                </button>
                </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Select Chord Diagrams Modal */}
      {showChordDiagramsModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowChordDiagramsModal(false)
            }
          }}
        >
          <div className="bg-black rounded-2xl shadow-2xl max-w-md w-full relative text-white p-8">
            {/* Close Button */}
            <button
              onClick={() => setShowChordDiagramsModal(false)}
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors text-2xl font-bold"
            >
              ×
            </button>
            
            {/* Chord Diagrams Content */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-4">Select Chord Diagrams</h2>
            </div>
            
            <div className="space-y-4 text-gray-300">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Add Chords to your Captions!</p>
                <p className="font-medium">Selected chords appear to the left of the captions in the same start/stop time segment.</p>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Available Options</p>
                <ul className="text-sm space-y-1">
                  <li>• Open chords (C, G, D, A, E)</li>
                  <li>• Barre chords (F, B, Bb)</li>
                  <li>• Power chords</li>
                  <li>• Jazz chords</li>
                </ul>
              </div>
              
              <div className="pt-4">
                <button className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors">
                  Browse Chord Library
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}