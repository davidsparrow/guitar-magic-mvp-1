/**
 * 🎸 Chord Diagram Manager Component
 * 
 * Manages chord captions for the middle row in watch.js
 * Handles chord selection, timing, and display
 * 
 * Features:
 * - Chord selection (Root Note + Modifier)
 * - Time validation with helpful suggestions
 * - Responsive grid layout
 * - Video timeline synchronization
 */

import React, { useState, useEffect } from 'react'
import { 
  validateChordTimes, 
  isValidTimeFormat, 
  getTimeFormatSuggestion,
  ROOT_NOTES,
  CHORD_MODIFIERS,
  buildChordName,
  loadChordCaptions as loadChordsFromDB,
  createChordCaption as createChordInDB
} from '../utils/chordCaptionUtils'

/**
 * Chord Diagram Manager Component
 * 
 * @param {Object} props
 * @param {string} props.favoriteId - ID of the current favorite video
 * @param {number} props.videoDurationSeconds - Video duration in seconds
 * @param {number} props.currentTimeSeconds - Current video playback time
 * @param {boolean} props.isVisible - Whether this row is currently visible
 */
export default function ChordDiagramManager({ 
  favoriteId, 
  videoDurationSeconds = 0, 
  currentTimeSeconds = 0, 
  isVisible = true 
}) {
  // State for chord captions
  const [chords, setChords] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // State for adding new chords
  const [isAddingChord, setIsAddingChord] = useState(false)
  const [newChord, setNewChord] = useState({
    chord_name: '',
    start_time: '',
    end_time: ''
  })
  
  // State for validation
  const [validationErrors, setValidationErrors] = useState([])
  
  // State for video timeline integration
  const [activeChords, setActiveChords] = useState([])
  
  // Load chord captions when component mounts or favoriteId changes
  useEffect(() => {
    if (favoriteId && isVisible) {
      loadChordCaptions()
    }
  }, [favoriteId, isVisible])
  
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
  
  /**
   * Load chord captions from database
   */
  const loadChordCaptions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Use real database function
      const result = await loadChordsFromDB(favoriteId)
      
      if (result.success) {
        setChords(result.data || [])
      } else {
        setError(result.error || 'Failed to load chord captions')
      }
      
    } catch (err) {
      console.error('❌ Error loading chord captions:', err)
      setError('Failed to load chord captions')
    } finally {
      setIsLoading(false)
    }
  }
  
  /**
   * Handle chord name selection
   */
  const handleChordSelection = (rootNote, modifier) => {
    const chordName = buildChordName(rootNote, modifier)
    setNewChord(prev => ({ ...prev, chord_name: chordName }))
  }
  
  /**
   * Handle time input changes with validation
   */
  const handleTimeChange = (field, value) => {
    setNewChord(prev => ({ ...prev, [field]: value }))
    
    // Clear previous validation errors for this field
    setValidationErrors(prev => prev.filter(err => err.field !== field))
    
    // Validate the time format
    if (value && !isValidTimeFormat(value)) {
      const suggestion = getTimeFormatSuggestion(value)
      setValidationErrors(prev => [...prev, {
        field,
        message: suggestion,
        type: 'format'
      }])
    }
  }
  
  /**
   * Validate the complete chord before saving
   */
  const validateChord = () => {
    if (!newChord.chord_name) {
      setValidationErrors([{ field: 'chord_name', message: 'Please select a chord', type: 'required' }])
      return false
    }
    
    if (!newChord.start_time || !newChord.end_time) {
      setValidationErrors([{ field: 'timing', message: 'Please enter both start and end times', type: 'required' }])
      return false
    }
    
    // Use our validation utility
    const validation = validateChordTimes(newChord, videoDurationSeconds)
    
    if (!validation.isValid) {
      const errors = validation.failures.map(failure => ({
        field: 'timing',
        message: failure.reason,
        type: 'validation'
      }))
      setValidationErrors(errors)
      return false
    }
    
    return true
  }
  
  /**
   * Save the new chord caption
   */
  const handleSaveChord = async () => {
    if (!validateChord()) {
      return
    }
    
    try {
      // Use real database function
      const result = await createChordInDB(newChord, favoriteId, 'user-id-placeholder')
      
      if (result.success) {
        // Add new chord to local state
        setChords(prev => [...prev, result.data])
        
        // Reset form
        setNewChord({ chord_name: '', start_time: '', end_time: '' })
        setValidationErrors([])
        setIsAddingChord(false)
        
        console.log('✅ Chord saved successfully:', result.data)
      } else {
        setError(result.error || 'Failed to save chord caption')
      }
      
    } catch (err) {
      console.error('❌ Error saving chord:', err)
      setError('Failed to save chord caption')
    }
  }
  
  /**
   * Cancel adding new chord
   */
  const handleCancelChord = () => {
    setNewChord({ chord_name: '', start_time: '', end_time: '' })
    setValidationErrors([])
    setIsAddingChord(false)
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
      {/* Header */}
      <div className="chord-header">
        <h3 className="chord-title">🎸 Chord Captions</h3>
        <button 
          onClick={() => setIsAddingChord(true)}
          className="add-chord-btn"
          disabled={isAddingChord}
        >
          {isAddingChord ? 'Adding...' : '+ Add Chord'}
        </button>
      </div>
      
      {/* Add Chord Form */}
      {isAddingChord && (
        <div className="add-chord-form">
          <h4>Add New Chord</h4>
          
          {/* Chord Selection */}
          <div className="chord-selection">
            <label>Chord:</label>
            <div className="chord-dropdowns">
              <select 
                onChange={(e) => handleChordSelection(e.target.value, newChord.modifier)}
                value={newChord.rootNote || ''}
              >
                <option value="">Select Root Note</option>
                {ROOT_NOTES.map(note => (
                  <option key={note.value} value={note.value}>
                    {note.label}
                  </option>
                ))}
              </select>
              
              <select 
                onChange={(e) => handleChordSelection(newChord.rootNote, e.target.value)}
                value={newChord.modifier || ''}
              >
                <option value="">Major</option>
                {CHORD_MODIFIERS.filter(m => m.value !== '').map(mod => (
                  <option key={mod.value} value={mod.value}>
                    {mod.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Timing Inputs */}
          <div className="timing-inputs">
            <div className="time-input">
              <label>Start Time:</label>
              <input
                type="text"
                placeholder="1:30"
                value={newChord.start_time}
                onChange={(e) => handleTimeChange('start_time', e.target.value)}
                className={validationErrors.some(err => err.field === 'start_time') ? 'error' : ''}
              />
            </div>
            
            <div className="time-input">
              <label>End Time:</label>
              <input
                type="text"
                placeholder="2:15"
                value={newChord.end_time}
                onChange={(e) => handleTimeChange('end_time', e.target.value)}
                className={validationErrors.some(err => err.field === 'end_time') ? 'error' : ''}
              />
            </div>
          </div>
          
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="validation-errors">
              {validationErrors.map((error, index) => (
                <div key={index} className="error-message">
                  {error.message}
                </div>
              ))}
            </div>
          )}
          
          {/* Form Actions */}
          <div className="form-actions">
            <button onClick={handleSaveChord} className="save-btn">
              Save Chord
            </button>
            <button onClick={handleCancelChord} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Chord Display */}
      <div className="chord-display">
        {isLoading ? (
          <div className="loading">Loading chord captions...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : chords.length === 0 ? (
          <div className="no-chords">
            No chord captions yet. Click "Add Chord" to get started!
          </div>
        ) : (
          <>
            {/* Active Chords Section */}
            {activeChords.length > 0 && (
              <div className="active-chords-section">
                <h4 className="section-title">🎯 Currently Playing</h4>
                <div className="active-chord-grid">
                  {activeChords.map(chord => (
                    <div key={chord.id} className="chord-item active">
                      <div className="chord-name">{chord.chord_name}</div>
                      <div className="chord-timing">
                        {chord.start_time} - {chord.end_time}
                      </div>
                      <div className="active-indicator">▶️ Now Playing</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* All Chords Section */}
            <div className="all-chords-section">
              <h4 className="section-title">🎸 All Chord Captions</h4>
              <div className="chord-grid">
                {chords.map(chord => {
                  const isActive = activeChords.some(active => active.id === chord.id)
                  return (
                    <div 
                      key={chord.id} 
                      className={`chord-item ${isActive ? 'active' : ''}`}
                    >
                      <div className="chord-name">{chord.chord_name}</div>
                      <div className="chord-timing">
                        {chord.start_time} - {chord.end_time}
                      </div>
                      {isActive && (
                        <div className="active-indicator">▶️ Now Playing</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Video Time Display */}
            <div className="video-time-display">
              <small>
                Current Time: {formatTime(currentTimeSeconds)} | 
                Total Chords: {chords.length} | 
                Active: {activeChords.length}
              </small>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
