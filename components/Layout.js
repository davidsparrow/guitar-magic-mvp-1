// components/Layout.js - Enhanced Layout with Clickable Logo
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const Layout = ({ children }) => {
  const { 
    user, 
    profile, 
    loading, 
    isAuthenticated, 
    isPremium, 
    signOut,
    userName,
    userEmail 
  } = useAuth()
  
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

const handleSignOut = async () => {
  console.log('🚪 LOGOUT: Starting logout process')
  setIsSigningOut(true)
  try {
    const result = await signOut()
    console.log('🚪 LOGOUT: Result:', result)
    if (result.error) {
      console.error('🚪 LOGOUT: Error occurred:', result.error)
      alert('Logout failed: ' + result.error.message)
    }
  } catch (error) {
    console.error('🚪 LOGOUT: Exception:', error)
    alert('Logout error: ' + error.message)
  } finally {
    setIsSigningOut(false)
  }
}

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo - Clickable Home Link */}
          <a 
            href="/" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">YV</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VideoFlip
            </h1>
          </a>

          {/* Auth Status & User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isPremium ? (
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent font-medium">
                          ✨ Premium
                        </span>
                      ) : (
                        'Free Plan'
                      )}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* User Menu Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="User menu"
                  >
                    <div className="w-6 h-6 flex flex-col justify-center items-center">
                      <span className={`bg-gray-600 block h-0.5 w-6 rounded-sm transition-all duration-300 ${showUserMenu ? 'rotate-45 translate-y-1' : ''}`}></span>
                      <span className={`bg-gray-600 block h-0.5 w-6 rounded-sm my-0.5 transition-all duration-300 ${showUserMenu ? 'opacity-0' : ''}`}></span>
                      <span className={`bg-gray-600 block h-0.5 w-6 rounded-sm transition-all duration-300 ${showUserMenu ? '-rotate-45 -translate-y-1' : ''}`}></span>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute top-12 right-0 bg-white rounded-xl shadow-lg border border-gray-200 py-2 w-64 z-50">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{userName}</p>
                        <p className="text-xs text-gray-500">{userEmail}</p>
                        <div className="flex items-center mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isPremium 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isPremium ? '✨ Premium Member' : 'Free Plan'}
                          </span>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <a 
                          href="/" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          🏠 Home
                        </a>
                        <a 
                          href="/search" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          🔍 Search Videos
                        </a>
                        {isPremium && (
                          <a 
                            href="#" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            🔁 My Loops
                          </a>
                        )}
                        
                        <div className="border-t border-gray-100 my-1"></div>
                        
                        <a 
                          href="#" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          ⚙️ Settings
                        </a>
                        {!isPremium && (
                          <a 
                            href="#" 
                            className="block px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 font-medium transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            ⭐ Upgrade to Premium
                          </a>
                        )}
                        <a 
                          href="#" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          📜 Terms & Privacy
                        </a>
                        
                        <div className="border-t border-gray-100 my-1"></div>
                        
                        <button
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          {isSigningOut ? '🔄 Signing Out...' : '🚪 Sign Out'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-600">
                Not signed in
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Background Click to Close Menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </div>
  )
}

export default Layout