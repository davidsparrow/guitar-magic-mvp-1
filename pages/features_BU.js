// pages/features.js - Dedicated Features Page
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Features() {
  const { isAuthenticated, user, profile, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showFeatureModal, setShowFeatureModal] = useState(null) // 'loops', 'resume', 'chords', 'tabs', 'scrambled-brain', 'lightbulb-brain', 'sloth', 'cheetah'
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle feature hotspot clicks
  const handleFeatureClick = (feature) => {
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
    <>
      <Head>
        <title>Features - GuitarTube</title>
        <meta name="description" content="Discover GuitarTube's powerful features: video flipping, custom loops, auto-generated chords and tabs, and more." />
      </Head>
      
      <div className="relative min-h-screen bg-black text-white">
        {/* Header with Logo and Navigation */}
        <header className="relative z-10 p-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <img 
                src="/images/gt_logoM_wide_on_black.png" 
                alt="GuitarTube Logo" 
                className="h-8 w-auto"
              />
              <button
                onClick={() => router.push('/')}
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                ← Back to Home
              </button>
            </div>
            
            {/* Auth Button */}
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-bold"
            >
              {isAuthenticated ? 'Dashboard' : 'Sign In'}
            </button>
          </div>
        </header>

        {/* Main Features Content */}
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">GuitarTube Features</h1>
            <p className="text-gray-400 text-lg">Discover what makes learning guitar faster and easier</p>
          </div>

          {/* Features Overview Image with Hotspots */}
          <div className="bg-black rounded-2xl shadow-2xl p-8 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Interactive Features Overview</h2>
              <p className="text-gray-400">Click on the colored areas to learn more about each feature</p>
            </div>
            
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
              
              {/* Interactive Hotspot Areas */}
              {/* Custom Loops Hotspot (Pink Infinity) */}
              <button
                onClick={() => handleFeatureClick('loops')}
                className="absolute bottom-[25%] right-[34.5%] w-[12%] h-[20%] hover:bg-pink-500/20 transition-colors rounded-lg border border-pink-500/50"
                title="Custom Loops"
              />

              {/* Cheetah Hotspot (Speed) */}
              <button
                onClick={() => handleFeatureClick('cheetah')}
                className="absolute bottom-[14%] right-[49%] w-[13%] h-[23%] hover:bg-orange-500/20 transition-colors rounded-lg border border-orange-500/50"
                title="Wayyyy faster"
              />

              {/* Lightbulb Hotspot (Solution) */}
              <button
                onClick={() => handleFeatureClick('lightbulb-brain')}
                className="absolute bottom-[14%] right-[64%] w-[13%] h-[23%] hover:bg-yellow-500/20 transition-colors rounded-lg border border-yellow-500/50"
                title="Lightbulb session"
              />

              {/* Stringbrain Hotspot (Problem) */}
              <button
                onClick={() => handleFeatureClick('sloth')}
                className="absolute bottom-[47%] right-[49%] w-[13%] h-[23%] hover:bg-red-500/20 transition-colors rounded-lg border border-red-500/50"
                title="Sad. But cute!"
              />

              {/* Scrambled Brain Hotspot (Problem) */}
              <button
                onClick={() => handleFeatureClick('scrambled-brain')}
                className="absolute bottom-[47%] right-[64%] w-[13%] h-[23%] hover:bg-orange-500/20 transition-colors rounded-lg border border-orange-500/50"
                title="Brain fog"
              />

              {/* Login Resume Hotspot (Green Power Button) */}
              <button
                onClick={() => handleFeatureClick('resume')}
                className="absolute bottom-[5%] right-[34.5%] w-[12%] h-[20%] hover:bg-green-500/20 transition-colors rounded-lg border border-green-500/50"
                title="Login & Resume"
              />

              {/* Auto-gen Chords Hotspot (Light Blue Guitar Chord Diagram) */}
              <button
                onClick={() => handleFeatureClick('chords')}
                className="absolute bottom-[25%] right-[4.5%] w-[12%] h-[20%] hover:bg-blue-500/20 transition-colors rounded-lg border border-blue-500/50"
                title="Auto-gen Chords"
              />

              {/* Auto-gen Tabs Hotspot (Green Guitar Tablature) */}
              <button
                onClick={() => handleFeatureClick('tabs')}
                className="absolute bottom-[5%] right-[4.5%] w-[12%] h-[20%] hover:bg-green-500/20 transition-colors rounded-lg border border-green-500/50"
                title="Auto-gen Tabs"
              />
              
              {/* Custom Captions Hotspot */}
              <button
                onClick={() => handleFeatureClick('captions')}
                className="absolute bottom-[25%] right-[20%] w-[12%] h-[20%] hover:bg-purple-500/20 transition-colors rounded-lg border border-purple-500/50"
                title="Custom Captions"
              />

              {/* Chord Diagrams Hotspot */}
              <button
                onClick={() => handleFeatureClick('chord-diagrams')}
                className="absolute bottom-[5%] right-[20%] w-[12%] h-[20%] hover:bg-orange-500/20 transition-colors rounded-lg border border-orange-500/50"
                title="Select Chord Diagrams"
              />
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Custom Loops Card */}
            <div className="bg-black border border-pink-500/30 rounded-xl p-6 hover:border-pink-500/60 transition-colors cursor-pointer" onClick={() => handleFeatureClick('loops')}>
              <div className="text-center mb-4">
                <div className="text-4xl text-pink-400 mb-2">∞</div>
                <h3 className="text-xl font-bold">Custom Loops</h3>
              </div>
              <p className="text-gray-400 text-sm">Create precise practice loops for mastering difficult sections</p>
            </div>

            {/* Login Resume Card */}
            <div className="bg-black border border-green-500/30 rounded-xl p-6 hover:border-green-500/60 transition-colors cursor-pointer" onClick={() => handleFeatureClick('resume')}>
              <div className="text-center mb-4">
                <div className="text-4xl text-green-400 mb-2">⏻</div>
                <h3 className="text-xl font-bold">Login & Resume</h3>
              </div>
              <p className="text-gray-400 text-sm">Never lose your place again with automatic session saving</p>
            </div>

            {/* Auto-gen Chords Card */}
            <div className="bg-black border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/60 transition-colors cursor-pointer" onClick={() => handleFeatureClick('chords')}>
              <div className="text-center mb-4">
                <div className="text-4xl text-blue-400 mb-2">🎸</div>
                <h3 className="text-xl font-bold">Auto-gen Chords</h3>
              </div>
              <p className="text-gray-400 text-sm">Automatically generate guitar chord diagrams for any song section</p>
            </div>

            {/* Auto-gen Tabs Card */}
            <div className="bg-black border border-green-500/30 rounded-xl p-6 hover:border-green-500/60 transition-colors cursor-pointer" onClick={() => handleFeatureClick('tabs')}>
              <div className="text-center mb-4">
                <div className="text-4xl text-green-400 mb-2">📝</div>
                <h3 className="text-xl font-bold">Auto-gen Tabs</h3>
              </div>
              <p className="text-gray-400 text-sm">Automatically generate guitar tablature for any song section</p>
            </div>

            {/* Video Flipping Problem Card */}
            <div className="bg-black border border-red-500/30 rounded-xl p-6 hover:border-red-500/60 transition-colors cursor-pointer" onClick={() => handleFeatureClick('scrambled-brain')}>
              <div className="text-center mb-4">
                <div className="text-4xl text-red-400 mb-2">🧠</div>
                <h3 className="text-xl font-bold">The Problem</h3>
              </div>
              <p className="text-gray-400 text-sm">Why learning guitar from videos is like mental gymnastics</p>
            </div>

            {/* Video Flipping Solution Card */}
            <div className="bg-black border border-yellow-500/30 rounded-xl p-6 hover:border-yellow-500/60 transition-colors cursor-pointer" onClick={() => handleFeatureClick('lightbulb-brain')}>
              <div className="text-center mb-4">
                <div className="text-4xl text-yellow-400 mb-2">💡</div>
                <h3 className="text-xl font-bold">The Solution</h3>
              </div>
              <p className="text-gray-400 text-sm">How GuitarTube flips videos so you don't have to think about it</p>
            </div>
          </div>
        </main>

        {/* Feature Detail Modals */}
        {/* Custom Loops Modal */}
        {showFeatureModal === 'loops' && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowFeatureModal(null)
              }
            }}
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

        {/* Login Resume Modal */}
        {showFeatureModal === 'resume' && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowFeatureModal(null)
              }
            }}
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

        {/* Auto-gen Chords Modal */}
        {showFeatureModal === 'chords' && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowFeatureModal(null)
              }
            }}
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
              </div>
            </div>
          </div>
        )}

        {/* Auto-gen Tabs Modal */}
        {showFeatureModal === 'tabs' && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowFeatureModal(null)
              }
            }}
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
              </div>
            </div>
          </div>
        )}

        {/* Scrambled Brain Modal */}
        {showFeatureModal === 'scrambled-brain' && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowFeatureModal(null)
              }
            }}
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
              </div>
            </div>
          </div>
        )}

        {/* Lightbulb Brain Modal */}
        {showFeatureModal === 'lightbulb-brain' && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowFeatureModal(null)
              }
            }}
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
              </div>
            </div>
          </div>
        )}

        {/* Sloth Modal */}
        {showFeatureModal === 'sloth' && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowFeatureModal(null)
              }
            }}
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
              </div>
            </div>
          </div>
        )}

        {/* Cheetah Modal */}
        {showFeatureModal === 'cheetah' && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowFeatureModal(null)
              }
            }}
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
              </div>
            </div>
          </div>
        )}

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
