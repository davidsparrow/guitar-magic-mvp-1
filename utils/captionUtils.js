/**
 * Caption Management Utility Functions
 * Pure functions for caption operations - no state dependencies
 */

/**
 * Converts time string (MM:SS or HH:MM:SS) to seconds
 * @param {string} timeString - Time in format "MM:SS" or "HH:MM:SS"
 * @returns {number} Time in seconds
 */
export const parseTimeToSeconds = (timeString) => {
  if (!timeString) return 0
  const parts = timeString.split(':')
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1])
  } else if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
  }
  return 0
}

/**
 * Converts seconds to formatted time string (MM:SS or HH:MM:SS)
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatSecondsToTime = (seconds) => {
  if (seconds < 0) seconds = 0
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
}

/**
 * Alias for parseTimeToSeconds - consolidates duplicate functions
 * @param {string} timeStr - Time string to convert
 * @returns {number} Time in seconds
 */
export const timeToSeconds = (timeStr) => {
  // Add validation and logging for debugging
  if (!timeStr || typeof timeStr !== 'string') {
    console.warn('⚠️ timeToSeconds called with invalid value:', timeStr)
    return 0
  }
  return parseTimeToSeconds(timeStr)
}

/**
 * Assigns sequential serial numbers to captions based on start time
 * @param {Array} captionsArray - Array of caption objects
 * @returns {Array} Captions with assigned serial numbers
 */
export const assignSerialNumbersToCaptions = (captionsArray) => {
  if (!captionsArray || captionsArray.length === 0) return captionsArray
  
  const sortedCaptions = [...captionsArray].sort((a, b) => {
    const timeA = parseTimeToSeconds(a.startTime)
    const timeB = parseTimeToSeconds(b.startTime)
    return timeA - timeB
  })
  
  return sortedCaptions.map((caption, index) => ({
    ...caption,
    serial_number: index + 1
  }))
}

/**
 * Auto-resolves caption conflicts by adjusting start/stop times
 * @param {Array} captionsArray - Array of caption objects
 * @returns {Array} Captions with conflicts resolved
 */
export const autoResolveCaptionConflicts = (captionsArray) => {
  if (!captionsArray || captionsArray.length < 2) return captionsArray
  
  const sortedCaptions = [...captionsArray].sort((a, b) => {
    const timeA = parseTimeToSeconds(a.startTime)
    const timeB = parseTimeToSeconds(b.startTime)
    return timeA - timeB
  })
  
  let conflictsResolved = []
  let hasChanges = false
  
  for (let i = 0; i < sortedCaptions.length - 1; i++) {
    const currentCaption = sortedCaptions[i]
    const nextCaption = sortedCaptions[i + 1]
    
    const currentEndTime = parseTimeToSeconds(currentCaption.endTime)
    const nextStartTime = parseTimeToSeconds(nextCaption.startTime)
    
    // Check if there's an overlap or gap
    if (nextStartTime < currentEndTime) {
      // Conflict detected - adjust next caption's start time
      const oldStartTime = nextCaption.startTime
      const newStartTime = formatSecondsToTime(currentEndTime)
      
      // Update the next caption
      const updatedNextCaption = {
        ...nextCaption,
        startTime: newStartTime
      }
      
      // Replace in the array
      sortedCaptions[i + 1] = updatedNextCaption
      
      // Track the conflict resolution
      conflictsResolved.push({
        serialNumber: nextCaption.serial_number || i + 2,
        oldStartTime: oldStartTime,
        newStartTime: newStartTime,
        conflictingCaption: currentCaption.serial_number || i + 1
      })
      
      hasChanges = true
    }
  }
  
  return hasChanges ? sortedCaptions : captionsArray
}
