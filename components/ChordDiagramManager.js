/**
 * 🎸 Chord Diagram Manager Component
 * 
 * DISPLAY ONLY - No controls or editing
 * Shows chord captions in a responsive grid layout
 * All management is handled by ChordCaptionModal.js
 * 
 * Features:
 * - Responsive chord grid (4-9 cells visible)
 * - Video timeline synchronization
 * - Active chord highlighting
 * - Fits perfectly in Row 2 (38% height)
 */

import React, { useState, useEffect } from 'react'

/**
 * Chord Diagram Manager Component (Display Only)
 * 
 * @param {Object} props
 * @param {string} props.favoriteId - ID of the current favorite video
 * @param {number} props.videoDurationSeconds - Video duration in seconds
 * @param {number} props.currentTimeSeconds - Current video playback time
 * @param {boolean} props.isVisible - Whether this row is currently visible
 * @param {Array} props.chords - Array of chord captions to display
 */
export default function ChordDiagramManager({ 
  favoriteId, 
  videoDurationSeconds = 0, 
  currentTimeSeconds = 0, 
  isVisible = true,
  chords = []
}) {
  // State for active chords (video timeline integration)
  const [activeChords, setActiveChords] = useState([])
  
  // Update active chords when current time or chords change
  useEffect(() => {
    if (chords.length > 0 && currentTimeSeconds >= 0) {
      updateActiveChords()
    }
  }, [currentTimeSeconds, chords])
  
  /**
   * Update which chords are currently active based on video time
   */
  const updateActiveChords = () => {
    const active = chords.filter(chord => {
      const startSeconds = parseTimeToSeconds(chord.start_time)
      const endSeconds = parseTimeToSeconds(chord.end_time)
      return currentTimeSeconds >= startSeconds && currentTimeSeconds <= endSeconds
    }).sort((a, b) => a.display_order - b.display_order)
    
    setActiveChords(active)
  }
  
  /**
   * Parse time string to seconds (helper function)
   */
  const parseTimeToSeconds = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return 0
    
    const parts = timeString.split(':').map(Number)
    
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]
    }
    
    return 0
  }
  
  // Don't render if not visible
  if (!isVisible) {
    return null
  }
  
  // Helper to format time (e.g., 1:30 -> 1:30)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  return (
    <div className="chord-diagram-manager">
      {/* Responsive Chord Grid - ONLY CONTENT */}
      <div 
        className="chord-grid"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          minHeight: '90px',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}
      >
        {chords.length === 0 ? (
          /* Empty State */
          <div className="empty-state" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '90px',
            color: '#9ca3af',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎸</div>
              <div>No chord captions yet</div>
              <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
                Use the + button to add chords
              </div>
            </div>
          </div>
        ) : (
          /* Chord Grid */
          chords.map(chord => {
            const isActive = activeChords.some(active => active.id === chord.id)
            return (
              <div 
                key={chord.id} 
                className={`chord-item ${isActive ? 'active' : ''}`}
                style={{
                  minWidth: '90px',
                  maxWidth: '120px',
                  height: '90px',
                  padding: '8px',
                  backgroundColor: isActive ? '#4ade80' : '#6b7280',
                  border: `2px solid ${isActive ? '#22c55e' : '#4b5563'}`,
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer'
                }}
              >
                <div className="chord-name" style={{ fontSize: '18px', marginBottom: '4px' }}>
                  {chord.chord_name}
                </div>
                <div className="chord-timing" style={{ fontSize: '12px', opacity: 0.9 }}>
                  {chord.start_time} - {chord.end_time}
                </div>
                {isActive && (
                  <div className="active-indicator" style={{ fontSize: '10px', marginTop: '4px' }}>
                    ▶️ Now Playing
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
      
      {/* Responsive CSS Styles */}
      <style jsx>{`
        .chord-diagram-manager {
          width: 100%;
          height: 100%;
          max-width: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .chord-grid {
          width: 100%;
          height: 100%;
        }
        
        .empty-state {
          width: 100%;
          height: 100%;
        }
        
        /* Responsive breakpoints */
        @media (max-width: 767px) {
          .chord-grid {
            justify-content: flex-start;
            min-width: 360px; /* 4 cells × 90px */
          }
        }
        
        @media (min-width: 768px) and (max-width: 1023px) {
          .chord-grid {
            justify-content: center;
            max-width: 630px; /* 7 cells × 90px */
          }
        }
        
        @media (min-width: 1024px) {
          .chord-grid {
            justify-content: center;
            max-width: 810px; /* 9 cells × 90px */
          }
        }
      `}</style>
    </div>
  )
}
