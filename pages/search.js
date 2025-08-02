search.js

// pages/search.js (Protected Search Page)
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import { useRouter } from 'next/router'
import { checkFeatureAccess } from '../lib/supabase'

export default function Search() {
  const { isAuthenticated, user, profile, loading, isPremium } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [hasLoopAccess, setHasLoopAccess] = useState(false)

  // Redirect non-authenticated users
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/')
      return
    }

    // Check feature access for authenticated users
    if (user && !loading) {
      checkFeatureAccess(user.id, 'custom_loops').then(setHasLoopAccess)
    }
  }, [isAuthenticated, loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-gray-600">
            Search for YouTube videos and experience them like never before.
          </p>
          
          {/* Usage Stats */}
          <div className="mt-4 flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Plan:</span>
              <span className={`font-medium ${isPremium ? 'text-yellow-600' : 'text-blue-600'}`}>
                {isPremium ? '✨ Premium' : 'Free'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Daily Searches:</span>
              <span className="font-medium text-blue-600">
                {profile?.daily_searches_used || 0} / {isPremium ? '∞' : '20'}
              </span>
            </div>
          </div>
        </div>

        {/* Feature Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">🔄</span>
              <h3 className="font-semibold text-gray-900">Video Flipping</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">Flip videos vertically and horizontally</p>
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              ✓ Available
            </span>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">🔁</span>
              <h3 className="font-semibold text-gray-900">Custom Loops</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">Create precise loop points</p>
            {hasLoopAccess ? (
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                ✓ Available
              </span>
            ) : (
              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                ⭐ Premium Only
              </span>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">📚</span>
              <h3 className="font-semibold text-gray-900">Search History</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">Access your saved searches</p>
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              ✓ Available ({isPremium ? 'Unlimited' : 'Last 5'})
            </span>
          </div>
        </div>

        {/* Search Interface */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Search YouTube Videos
            </h2>
            <p className="text-gray-600">
              Find videos to flip, loop, and enjoy with our custom controls
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for videos... (e.g., 'funny cats', 'guitar tutorial')"
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => alert('Search functionality coming soon!')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <span className="text-sm text-gray-500">Popular searches:</span>
              {['music videos', 'tutorials', 'comedy', 'gaming', 'nature'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Upgrade Prompt for Free Users */}
        {!isPremium && (
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-3">
              🚀 Unlock Premium Features
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Get unlimited searches, custom loop controls, and advanced video features. Perfect for creators, learners, and entertainment enthusiasts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Upgrade to Premium - $9/month
              </button>
              <button className="text-white border border-white/30 px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}