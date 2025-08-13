// pages/terms.js - Terms of Use Page
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'
import { useRouter } from 'next/router'
import { GiGuitar } from "react-icons/gi"
import { FaHamburger } from "react-icons/fa"
import { IoMdPower } from "react-icons/io"
import { RiLogoutCircleRLine } from "react-icons/ri"

export default function TermsOfUse() {
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
              className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors group"
            >
              <FaHamburger className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Terms of Use */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6" style={{ 
        height: 'calc(100vh - 140px)',
        backgroundColor: 'transparent'
      }}>
        <div className="max-w-4xl w-full bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white overflow-y-auto max-h-full">
          <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">Terms of Use</h1>
          
          <div className="space-y-6 text-lg leading-relaxed">
            <p className="text-center text-yellow-300 font-semibold">
              <strong>Effective Date: January 1, 2025</strong>
            </p>
            
            <p>
              Welcome to GuitarTube, a video learning platform that provides tools for musicians and content creators. 
              These Terms of Use ("Terms") govern your access to and use of our website, services, and applications 
              (collectively, the "Service").
            </p>
            
            <div className="bg-yellow-400/20 p-4 rounded-lg border border-yellow-400/30">
              <p className="text-yellow-300 text-center font-semibold">
                <strong>By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, then you may not access the Service.</strong>
              </p>
            </div>
            
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-yellow-300 mb-4">1. DEFINITIONS</h2>
                <ul className="space-y-2 ml-6">
                  <li><strong>"Service"</strong> refers to GuitarTube website, mobile applications, and all related features</li>
                  <li><strong>"User"</strong> refers to any individual who accesses or uses our Service</li>
                  <li><strong>"Creator"</strong> refers to Users who upload or create content on our platform</li>
                  <li><strong>"Content"</strong> refers to any text, images, videos, audio, code, captions, chord charts, or other materials</li>
                  <li><strong>"User Content"</strong> refers to Content that Users submit, upload, or create using our Service</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold text-yellow-300 mb-4">2. ACCEPTANCE AND ELIGIBILITY</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold text-yellow-200 mb-2">2.1 Age Requirements</h3>
                    <p>You must be at least 13 years old to use this Service. Users between 13-17 must have parental consent.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-yellow-200 mb-2">2.2 Account Registration</h3>
                    <p>To access premium features, you must create an account with accurate information and maintain the security of your login credentials.</p>
                  </div>
                </div>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold text-yellow-300 mb-4">3. USER CONTENT AND INTELLECTUAL PROPERTY</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold text-yellow-200 mb-2">3.1 User Content Ownership</h3>
                    <p className="bg-green-400/20 p-3 rounded-lg border border-green-400/30">
                      <strong>You retain full ownership of all User Content you create, upload, or submit to our Service.</strong> This includes:
                    </p>
                    <ul className="ml-6 mt-2 space-y-1">
                      <li>• Custom video captions and annotations</li>
                      <li>• Chord charts and musical notations</li>
                      <li>• Comments, reviews, and ratings</li>
                      <li>• Practice session data and custom loops</li>
                      <li>• Any other content you generate using our tools</li>
                    </ul>
                  </div>
                </div>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold text-yellow-300 mb-4">4. THIRD-PARTY SERVICES AND DISCLAIMERS</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold text-yellow-200 mb-2">4.1 Third-Party Integrations</h3>
                    <p>Our Service integrates with various third-party platforms and APIs, including but not limited to:</p>
                    <ul className="ml-6 mt-2 space-y-1">
                      <li>• YouTube Data API and YouTube Player API</li>
                      <li>• Stripe payment processing</li>
                      <li>• Supabase database and authentication</li>
                      <li>• Ultimate Guitar content and chord databases</li>
                      <li>• UberChord API and chord libraries</li>
                      <li>• Amazon S3 and cloud hosting services</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-yellow-200 mb-2">4.2 LIMITATION OF LIABILITY FOR THIRD-PARTY SERVICES</h3>
                    <p className="bg-red-400/20 p-3 rounded-lg border border-red-400/30">
                      <strong>GuitarTube IS NOT RESPONSIBLE OR LIABLE for:</strong>
                    </p>
                    <ul className="ml-6 mt-2 space-y-1">
                      <li>• Service interruptions, downtime, or failures of third-party providers</li>
                      <li>• Data loss, corruption, or security breaches at third-party services</li>
                      <li>• Changes to third-party APIs, pricing, or terms of service</li>
                      <li>• Content accuracy, availability, or copyright issues from external sources</li>
                    </ul>
                  </div>
                </div>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold text-yellow-300 mb-4">5. CREATOR REVENUE SHARING PROGRAM</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold text-yellow-200 mb-2">5.1 Eligibility</h3>
                    <p>Creators may be eligible for revenue sharing based on:</p>
                    <ul className="ml-6 mt-2 space-y-1">
                      <li>• Monthly rankings by total watch time on their content</li>
                      <li>• Top 100 creator leaderboard placement</li>
                      <li>• Compliance with community guidelines and terms</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-yellow-200 mb-2">5.2 Revenue Distribution</h3>
                    <ul className="ml-6 mt-2 space-y-1">
                      <li>• <strong>10% of net platform revenue</strong> is distributed monthly to eligible creators</li>
                      <li>• Payouts are calculated based on proportional watch time and engagement</li>
                      <li>• Minimum payout threshold: $25 USD per month</li>
                      <li>• Payments processed through Stripe or other payment providers</li>
                    </ul>
                  </div>
                </div>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold text-yellow-300 mb-4">6. SUBSCRIPTION SERVICES AND BILLING</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold text-yellow-200 mb-2">6.1 Paid Subscriptions</h3>
                    <p>Premium features require paid subscriptions with the following tiers:</p>
                    <ul className="ml-6 mt-2 space-y-1">
                      <li>• <strong>Freebird</strong>: Free tier with limited features</li>
                      <li>• <strong>Groupie</strong>: $8/month with enhanced features</li>
                      <li>• <strong>Wonderwall</strong>: $15/month with unlimited access</li>
                    </ul>
                  </div>
                </div>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold text-yellow-300 mb-4">7. PROHIBITED USES</h2>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-yellow-200 mb-2">7.1 You may NOT use our Service to:</h3>
                  <ul className="ml-6 space-y-1">
                    <li>• Upload copyrighted content without permission</li>
                    <li>• Manipulate view counts, engagement metrics, or creator rankings</li>
                    <li>• Reverse engineer, scrape, or extract data from our platform</li>
                    <li>• Distribute malware, spam, or harmful content</li>
                    <li>• Harass, threaten, or abuse other users</li>
                    <li>• Violate any applicable laws or regulations</li>
                  </ul>
                </div>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold text-yellow-300 mb-4">8. LIMITATION OF LIABILITY</h2>
                <div className="space-y-3">
                  <div className="bg-red-400/20 p-3 rounded-lg border border-red-400/30">
                    <h3 className="text-xl font-semibold text-yellow-200 mb-2">8.1 DISCLAIMER OF WARRANTIES</h3>
                    <p><strong>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.</strong></p>
                  </div>
                  <div className="bg-red-400/20 p-3 rounded-lg border border-red-400/30">
                    <h3 className="text-xl font-semibold text-yellow-200 mb-2">8.2 MAXIMUM LIABILITY</h3>
                    <p><strong>Our total liability to you for any claims related to the Service shall not exceed $100 USD or the amount you paid us in the past 12 months, whichever is greater.</strong></p>
                  </div>
                </div>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold text-yellow-300 mb-4">9. CONTACT INFORMATION</h2>
                <p>For questions about these Terms, contact us at:</p>
                <ul className="ml-6 mt-2 space-y-1">
                  <li>• <strong>Email</strong>: legal@GuitarTube.com</li>
                  <li>• <strong>Support</strong>: support@GuitarTube.com</li>
                </ul>
              </section>
              
              <div className="mt-8 p-4 bg-yellow-400/20 rounded-lg border border-yellow-400/30">
                <p className="text-yellow-300 text-center font-semibold">
                  <strong>BY USING OUR SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF USE.</strong>
                </p>
                <p className="text-center text-yellow-300 mt-2">
                  Last Updated: January 1, 2025 • GuitarTube Terms of Use v2.0
                </p>
              </div>
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
