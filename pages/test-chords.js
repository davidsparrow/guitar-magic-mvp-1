/**
 * 🧪 Test Page for Chord Diagram Manager Component
 * 
 * This page allows testing of:
 * - Chord creation and validation
 * - Responsive grid layout
 * - Video timeline integration
 * - Database operations (mock)
 */

import { useState } from 'react'
import Head from 'next/head'
import ChordDiagramManager from '../components/ChordDiagramManager'

export default function TestChords() {
  // Mock video state for testing
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(300) // 5 minutes
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Mock favorite ID for testing
  const mockFavoriteId = 'test-favorite-123'
  
  // Mock user ID for testing
  const mockUserId = 'test-user-456'
  
  // Video controls for testing
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      // Start video simulation
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= videoDuration) {
            clearInterval(interval)
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }
  }
  
  const handleSeek = (time) => {
    setCurrentTime(time)
  }
  
  const handleReset = () => {
    setCurrentTime(0)
    setIsPlaying(false)
  }
  
  return (
    <>
      <Head>
        <title>Test Chords - GuitarMagic</title>
        <meta name="description" content="Test page for Chord Diagram Manager component" />
      </Head>
      
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <header className="bg-gray-800 p-6 border-b border-gray-700">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-center">🧪 Chord Diagram Manager Test</h1>
            <p className="text-center text-gray-300 mt-2">
              Test the responsive chord grid layout and functionality
            </p>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="max-w-7xl mx-auto p-6">
          {/* Video Controls Section */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">🎬 Video Controls (Mock)</h2>
            <div className="flex flex-wrap gap-4 items-center">
              <button
                onClick={handlePlayPause}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isPlaying 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>
              
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                🔄 Reset
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Seek:</span>
                <button
                  onClick={() => handleSeek(30)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                >
                  0:30
                </button>
                <button
                  onClick={() => handleSeek(60)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                >
                  1:00
                </button>
                <button
                  onClick={() => handleSeek(120)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                >
                  2:00
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Current Time:</span>
                <span className="font-mono bg-gray-700 px-2 py-1 rounded">
                  {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Duration:</span>
                <span className="font-mono bg-gray-700 px-2 py-1 rounded">
                  {Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentTime / videoDuration) * 100}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Component Test Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🎸 Chord Diagram Manager Component</h2>
            
            {/* Responsive Test Info */}
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">📱 Responsive Layout Test</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Mobile Vertical:</strong><br />
                  • Min: 4 cells (360px total)<br />
                  • Cell width: 90px min
                </div>
                <div>
                  <strong>Tablet:</strong><br />
                  • Target: 6-7 cells<br />
                  • Cell width: 90px min
                </div>
                <div>
                  <strong>Desktop:</strong><br />
                  • Max: 8-9 cells (810px total)<br />
                  • Cell width: 90px min
                </div>
              </div>
              <p className="text-gray-300 mt-2">
                <strong>Test:</strong> Resize your browser window to see the responsive behavior!
              </p>
            </div>
            
            {/* Component Under Test */}
            <ChordDiagramManager
              favoriteId={mockFavoriteId}
              videoDurationSeconds={videoDuration}
              currentTimeSeconds={currentTime}
              isVisible={true}
            />
          </div>
          
          {/* Test Instructions */}
          <div className="bg-gray-800 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">📋 Test Instructions</h2>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-2">
                <span className="text-green-400">1.</span>
                <span>Click <strong>"+ Add Chord"</strong> to test chord creation</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">2.</span>
                <span>Test <strong>time validation</strong> by entering invalid times like "1:60" or "60:00"</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">3.</span>
                <span>Use <strong>video controls</strong> to test timeline integration</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">4.</span>
                <span>Resize browser to test <strong>responsive grid layout</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">5.</span>
                <span>Verify <strong>active chord highlighting</strong> during playback</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
