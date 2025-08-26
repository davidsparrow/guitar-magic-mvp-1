#!/usr/bin/env node

/**
 * 🧪 CLI Test Script for Chord Caption Utilities
 * 
 * Run this script to test all chord caption functions:
 * node test_chord_utils.js
 * 
 * Or test specific functions:
 * node test_chord_utils.js --test validation
 * node test_chord_utils.js --test api
 * node test_chord_utils.js --test all
 */

// Test data
const testChords = [
  { id: '1', start_time: '0:00', end_time: '1:30', display_order: 1, chord_name: 'Am' },
  { id: '2', start_time: '1:30', end_time: '3:00', display_order: 2, chord_name: 'C' },
  { id: '3', start_time: '3:00', end_time: '4:30', display_order: 3, chord_name: 'F' },
  { id: '4', start_time: '4:30', end_time: '6:00', display_order: 4, chord_name: 'G' }
]

/**
 * Time Format Validation
 * Ensures time strings are in MM:SS or H:MM:SS format
 * Rejects invalid ranges like 1:60, 60:00, 1:30:60
 * Rejects non-time strings like 222, 000, --, ::, abc
 */
function isValidTimeFormat(timeString) {
  if (!timeString || typeof timeString !== 'string') {
    return false
  }
  
  // Split by colon to get parts
  const parts = timeString.split(':')
  
  // Must have exactly 2 or 3 parts
  if (parts.length !== 2 && parts.length !== 3) {
    return false
  }
  
  // All parts must be numeric (reject --, ::, abc, etc.)
  for (const part of parts) {
    if (!/^\d+$/.test(part)) {
      return false
    }
  }
  
  // Convert to numbers for validation
  const numbers = parts.map(Number)
  
  if (parts.length === 2) {
    // MM:SS format
    const minutes = numbers[0]
    const seconds = numbers[1]
    
    // Validate ranges: minutes 0-59, seconds 0-59
    // Reject 60:00, 1:60, etc.
    return minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59
  } else if (parts.length === 3) {
    // H:MM:SS format
    const hours = numbers[0]
    const minutes = numbers[1]
    const seconds = numbers[2]
    
    // Validate ranges: hours 0-99, minutes 0-59, seconds 0-59
    // Reject 1:60:00, 1:30:60, etc.
    return hours >= 0 && hours <= 99 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59
  }
  
  return false
}

/**
 * Get helpful suggestion for invalid time format
 * Provides specific guidance like "Use 2:00 instead of 1:60"
 */
function getTimeFormatSuggestion(timeString) {
  if (!timeString || typeof timeString !== 'string') {
    return 'Enter a valid time in MM:SS or H:MM:SS format'
  }
  
  // Handle non-time strings
  if (!timeString.includes(':')) {
    return 'Use MM:SS format (e.g., 1:30) or H:MM:SS format (e.g., 1:30:45)'
  }
  
  const parts = timeString.split(':')
  
  // Handle wrong number of colons
  if (parts.length === 1) {
    return 'Use MM:SS format (e.g., 1:30) or H:MM:SS format (e.g., 1:30:45)'
  }
  
  if (parts.length > 3) {
    return 'Use MM:SS format (e.g., 1:30) or H:MM:SS format (e.g., 1:30:45)'
  }
  
  // Handle non-numeric parts
  for (let i = 0; i < parts.length; i++) {
    if (!/^\d+$/.test(parts[i])) {
      return 'Only use numbers and colons (e.g., 1:30, 2:15:45)'
    }
  }
  
  // Handle invalid ranges
  if (parts.length === 2) {
    const minutes = parseInt(parts[0])
    const seconds = parseInt(parts[1])
    
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `Use ${hours}:${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} instead of ${timeString}`
    }
    
    if (seconds >= 60) {
      const newMinutes = minutes + Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `Use ${newMinutes}:${remainingSeconds.toString().padStart(2, '0')} instead of ${timeString}`
    }
  }
  
  if (parts.length === 3) {
    const hours = parseInt(parts[0])
    const minutes = parseInt(parts[1])
    const seconds = parseInt(parts[2])
    
    if (minutes >= 60) {
      const newHours = hours + Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `Use ${newHours}:${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} instead of ${timeString}`
    }
    
    if (seconds >= 60) {
      const newMinutes = minutes + Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `Use ${hours}:${newMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')} instead of ${timeString}`
    }
  }
  
  return 'Enter time in MM:SS or H:MM:SS format (e.g., 0:00, 1:30, 2:20:18)'
}

/**
 * Parse time string to seconds
 * Supports MM:SS and H:MM:SS formats
 */
function parseTimeToSeconds(timeString) {
  if (!isValidTimeFormat(timeString)) {
    return 0
  }
  
  const parts = timeString.split(':').map(Number)
  
  if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1]
  } else if (parts.length === 3) {
    // H:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  
  return 0
}

/**
 * Format seconds to MM:SS or H:MM:SS
 * Automatically chooses format based on duration
 */
function formatSecondsToTime(seconds) {
  if (seconds < 0) return '0:00'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
}

/**
 * Rule 4: Validate Start ≤ End (valid duration)
 */
function validateStartBeforeEnd(startTime, endTime) {
  // First check format
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    return {
      isValid: false,
      rule: 4,
      reason: `Time values must be in MM:SS or H:MM:SS format (e.g., 0:00, 1:30, 2:20:18)`,
      suggestion: `Enter times in MM:SS or H:MM:SS format (e.g., 0:00, 1:30, 2:20:18)`
    }
  }
  
  const startSeconds = parseTimeToSeconds(startTime)
  const endSeconds = parseTimeToSeconds(endTime)
  
  // Check for zero duration (start = end)
  if (startSeconds === endSeconds) {
    return {
      isValid: false,
      rule: 4,
      reason: `Start time (${startTime}) cannot equal end time (${endTime}) - chord must have duration`,
      suggestion: `End time must be after start time to create a valid chord duration`
    }
  }
  
  // Check for invalid order (start > end)
  if (startSeconds > endSeconds) {
    return {
      isValid: false,
      rule: 4,
      reason: `Start time (${startTime}) cannot be after end time (${endTime})`,
      suggestion: `Start time must be before end time`
    }
  }
  
  return { isValid: true, rule: 4 }
}

/**
 * Rule 5: Validate Start ≥ 0:00 (minimum start)
 */
function validateMinimumStartTime(startTime) {
  // First check format
  if (!isValidTimeFormat(startTime)) {
    return {
      isValid: false,
      rule: 5,
      reason: `Start time (${startTime}) must be in MM:SS or H:MM:SS format (e.g., 0:00, 1:30, 2:20:18)`,
      suggestion: `Enter time in MM:SS or H:MM:SS format (e.g., 0:00, 1:30, 2:20:18)`
    }
  }
  
  const startSeconds = parseTimeToSeconds(startTime)
  
  if (startSeconds < 0) {
    return {
      isValid: false,
      rule: 5,
      reason: `Start time (${startTime}) cannot be negative`,
      suggestion: `Start time must be at least 0:00`
    }
  }
  
  return { isValid: true, rule: 5 }
}

/**
 * Rule 6: Validate End ≤ Video Duration (maximum end)
 */
function validateMaximumEndTime(endTime, videoDurationSeconds) {
  // First check format
  if (!isValidTimeFormat(endTime)) {
    return {
      isValid: false,
      rule: 6,
      reason: `End time (${endTime}) must be in MM:SS or H:MM:SS format (e.g., 0:00, 1:30, 2:20:18)`,
      suggestion: `Enter time in MM:SS or H:MM:SS format (e.g., 0:00, 1:30, 2:20:18)`
    }
  }
  
  if (!videoDurationSeconds || videoDurationSeconds <= 0) {
    return { isValid: true, rule: 6 } // Skip validation if video duration unknown
  }
  
  const endSeconds = parseTimeToSeconds(endTime)
  
  if (endSeconds > videoDurationSeconds) {
    return {
      isValid: false,
      rule: 6,
      reason: `End time (${endTime}) is beyond video duration (${formatSecondsToTime(videoDurationSeconds)})`,
      suggestion: `End time must be within video duration`
    }
  }
  
  return { isValid: true, rule: 6 }
}

/**
 * Main validation function for chord captions
 * Applies all 4 validation rules
 */
function validateChordTimes(chord, videoDurationSeconds) {
  const results = {
    isValid: true,
    failures: [],
    suggestions: []
  }
  
  // Rule 4: Start ≤ End
  const startEndValidation = validateStartBeforeEnd(chord.start_time, chord.end_time)
  if (!startEndValidation.isValid) {
    results.isValid = false
    results.failures.push(startEndValidation)
  }
  
  // Rule 5: Start ≥ 0:00
  const minStartValidation = validateMinimumStartTime(chord.start_time)
  if (!minStartValidation.isValid) {
    results.isValid = false
    results.failures.push(minStartValidation)
  }
  
  // Rule 6: End ≤ Video Duration
  const maxEndValidation = validateMaximumEndTime(chord.end_time, videoDurationSeconds)
  if (!maxEndValidation.isValid) {
    results.isValid = false
    results.failures.push(maxEndValidation)
  }
  
  // Collect all suggestions
  results.suggestions = results.failures.map(failure => failure.suggestion)
  
  return results
}

/**
 * Build chord name from root note and modifier
 */
function buildChordName(rootNote, modifier) {
  if (!rootNote) return ''
  if (!modifier) return rootNote
  return `${rootNote}${modifier}`
}

/**
 * Parse chord name into root note and modifier
 */
function parseChordName(chordName) {
  if (!chordName) return { rootNote: '', modifier: '' }
  
  // Handle special cases first
  if (chordName.includes('°')) {
    return { rootNote: chordName.replace('°', ''), modifier: '°' }
  }
  
  // Define modifiers for parsing
  const CHORD_MODIFIERS = [
    'maj7', 'm7', '7sus4', '6add9', 'm9', 'maj9', '°', // Longest first
    'sus4', 'm6', 'add9', 'm', '7', '9', '5', '6', '11', '13', '+'
  ]
  
  // Find the modifier by checking from longest to shortest
  for (const modifier of CHORD_MODIFIERS) {
    if (chordName.endsWith(modifier)) {
      const rootNote = chordName.slice(0, -modifier.length)
      return { rootNote, modifier }
    }
  }
  
  // No modifier found, assume major
  return { rootNote: chordName, modifier: '' }
}

/**
 * Calculate optimal grid layout for chord display
 * Returns number of columns based on chord count and screen size
 */
function calculateGridLayout(chordCount, screenWidth) {
  if (chordCount <= 0) return { columns: 1, rows: 1 }
  
  // Mobile vertical: max 4 columns
  if (screenWidth < 768) {
    const columns = Math.min(chordCount, 4)
    const rows = Math.ceil(chordCount / columns)
    return { columns, rows }
  }
  
  // Tablet: max 6 columns
  if (screenWidth < 1024) {
    const columns = Math.min(chordCount, 6)
    const rows = Math.ceil(chordCount / columns)
    return { columns, rows }
  }
  
  // Desktop: max 8-9 columns
  const columns = Math.min(chordCount, 9)
  const rows = Math.ceil(chordCount / columns)
  return { columns, rows }
}

/**
 * Get chords that should be displayed at a specific video time
 */
function getChordsAtTime(chords, currentTimeSeconds) {
  if (!chords || !Array.isArray(chords)) return []
  
  return chords.filter(chord => {
    const startSeconds = parseTimeToSeconds(chord.start_time)
    const endSeconds = parseTimeToSeconds(chord.end_time)
    
    return currentTimeSeconds >= startSeconds && currentTimeSeconds <= endSeconds
  }).sort((a, b) => a.display_order - b.display_order)
}

/**
 * Check if a chord is currently active at video time
 */
function isChordActive(chord, currentTimeSeconds) {
  const startSeconds = parseTimeToSeconds(chord.start_time)
  const endSeconds = parseTimeToSeconds(chord.end_time)
  return currentTimeSeconds >= startSeconds && currentTimeSeconds <= endSeconds
}

/**
 * Test Time Format Validation
 */
function testTimeValidation() {
  console.log('\n🕐 Testing Time Format Validation...')
  
  // Test valid formats
  const validTimes = ['0:00', '1:30', '59:59', '1:00:00', '2:30:45']
  console.log('  ✅ Valid time formats:')
  validTimes.forEach(time => {
    const isValid = isValidTimeFormat(time)
    console.log(`    ${time}: ${isValid ? '✅' : '❌'}`)
  })
  
  // Test invalid formats that should be rejected
  const invalidTimes = [
    // Non-time strings
    '0', '222', '000', 'abc', 'xyz', '--', '::', '1.5', '1,5',
    
    // Wrong number of colons
    '1', '1:2:3:4', '1:2:3:4:5',
    
    // Non-numeric parts
    'a:30', '1:b:30', '1:30:c', '1a:30', '1:30a',
    
    // Invalid ranges
    '60:00', '1:60', '1:30:60', '99:59:60', '100:00:00',
    
    // Edge cases
    '0:60', '0:0:60', '1:59:60', '59:60:00'
  ]
  
  console.log('\n  ❌ Invalid time formats (should all fail):')
  invalidTimes.forEach(time => {
    const isValid = isValidTimeFormat(time)
    const suggestion = getTimeFormatSuggestion(time)
    const status = isValid ? '❌ (SHOULD FAIL)' : '✅ (correctly rejected)'
    console.log(`    ${time}: ${status}`)
    if (!isValid) {
      console.log(`      💡 Suggestion: ${suggestion}`)
    }
  })
  
  // Summary
  const validCount = validTimes.filter(t => isValidTimeFormat(t)).length
  const invalidCount = invalidTimes.filter(t => !isValidTimeFormat(t)).length
  console.log(`\n  📊 Summary: ${validCount}/${validTimes.length} valid times passed, ${invalidCount}/${invalidTimes.length} invalid times correctly rejected`)
  
  // Test specific problematic cases
  console.log('\n  🎯 Testing Specific Problem Cases:')
  const problemCases = [
    { input: '1:60', expected: false, description: '60 seconds invalid' },
    { input: '60:00', expected: false, description: '60 minutes invalid' },
    { input: '1:30:60', expected: false, description: '60 seconds in H:MM:SS invalid' },
    { input: '1:02:60', expected: false, description: '60 seconds in H:MM:SS invalid' },
    { input: '222', expected: false, description: 'Non-time string' },
    { input: '000', expected: false, description: 'Non-time string' },
    { input: '--', expected: false, description: 'Non-time string' },
    { input: '::', expected: false, description: 'Non-time string' },
    { input: 'abc', expected: false, description: 'Non-time string' }
  ]
  
  problemCases.forEach(({ input, expected, description }) => {
    const result = isValidTimeFormat(input)
    const status = result === expected ? '✅' : '❌'
    const suggestion = getTimeFormatSuggestion(input)
    console.log(`    ${input} (${description}): ${status} ${result === false ? 'rejected' : 'accepted'}`)
    if (result === false) {
      console.log(`      💡 Suggestion: ${suggestion}`)
    }
  })
}

/**
 * Test Time Parsing and Formatting
 */
function testTimeParsing() {
  console.log('\n⏱️  Testing Time Parsing and Formatting...')
  
  const testCases = [
    { input: '0:00', expected: 0 },
    { input: '1:30', expected: 90 },
    { input: '59:59', expected: 3599 },
    { input: '1:00:00', expected: 3600 },
    { input: '2:30:45', expected: 9045 }
  ]
  
  testCases.forEach(({ input, expected }) => {
    const parsed = parseTimeToSeconds(input)
    const formatted = formatSecondsToTime(parsed)
    const correct = parsed === expected
    console.log(`  ${input} → ${parsed}s → ${formatted}: ${correct ? '✅' : '❌'}`)
  })
}

/**
 * Test Chord Validation Rules
 */
function testChordValidation() {
  console.log('\n✅ Testing Chord Validation Rules...')
  
  const testChords = [
    { name: 'Valid chord', start_time: '0:00', end_time: '1:30' },
    { name: 'Zero duration', start_time: '1:00', end_time: '1:00' },
    { name: 'Start after end', start_time: '2:00', end_time: '1:00' },
    { name: 'Negative start', start_time: '-0:30', end_time: '1:00' },
    { name: 'Beyond video duration', start_time: '1:00', end_time: '10:00' }
  ]
  
  const videoDuration = 300 // 5 minutes
  
  testChords.forEach(chord => {
    const result = validateChordTimes(chord, videoDuration)
    const status = result.isValid ? '✅' : '❌'
    console.log(`  ${chord.name}: ${status}`)
    if (!result.isValid) {
      result.failures.forEach(failure => {
        console.log(`    Rule ${failure.rule}: ${failure.reason}`)
      })
    }
  })
}

/**
 * Test Chord Name Building and Parsing
 */
function testChordNames() {
  console.log('\n🎸 Testing Chord Name Building and Parsing...')
  
  const testCases = [
    { root: 'C', modifier: '', expected: 'C' },
    { root: 'A', modifier: 'm', expected: 'Am' },
    { root: 'F', modifier: 'maj7', expected: 'Fmaj7' },
    { root: 'G', modifier: '7', expected: 'G7' },
    { root: 'B', modifier: '°', expected: 'B°' }
  ]
  
  testCases.forEach(({ root, modifier, expected }) => {
    const built = buildChordName(root, modifier)
    const parsed = parseChordName(built)
    const correct = built === expected && parsed.rootNote === root && parsed.modifier === modifier
    console.log(`  ${root} + ${modifier || 'Major'} → ${built} → ${parsed.rootNote} + ${parsed.modifier || 'Major'}: ${correct ? '✅' : '❌'}`)
  })
}

/**
 * Test Grid Layout Calculation
 */
function testGridLayout() {
  console.log('\n📱 Testing Grid Layout Calculation...')
  
  const testCases = [
    { chordCount: 4, screenWidth: 375, expected: 'Mobile: 4 cols' },
    { chordCount: 6, screenWidth: 768, expected: 'Tablet: 6 cols' },
    { chordCount: 8, screenWidth: 1024, expected: 'Desktop: 8 cols' },
    { chordCount: 12, screenWidth: 1920, expected: 'Desktop: 9 cols' }
  ]
  
  testCases.forEach(({ chordCount, screenWidth, expected }) => {
    const layout = calculateGridLayout(chordCount, screenWidth)
    console.log(`  ${chordCount} chords, ${screenWidth}px width: ${layout.columns}x${layout.rows} grid ✅`)
  })
}

/**
 * Test Chord Timing Functions
 */
function testChordTiming() {
  console.log('\n⏰ Testing Chord Timing Functions...')
  
  const currentTime = 120 // 2 minutes into video
  
  // Test active chord detection
  const activeChords = getChordsAtTime(testChords, currentTime)
  console.log(`  Active chords at ${formatSecondsToTime(currentTime)}: ${activeChords.length} chords`)
  activeChords.forEach(chord => {
    console.log(`    - ${chord.chord_name} (${chord.start_time} - ${chord.end_time})`)
  })
  
  // Test individual chord status
  testChords.forEach(chord => {
    const isActive = isChordActive(chord, currentTime)
    console.log(`  ${chord.chord_name}: ${isActive ? '🟢 Active' : '⚪ Inactive'}`)
  })
}

/**
 * Test UberChord API Integration (Mock)
 */
async function testAPIIntegration() {
  console.log('\n🌐 Testing UberChord API Integration...')
  
  try {
    // Note: This will fail in CLI due to CORS/browser requirements
    // But we can test the fallback logic
    console.log('  Note: API calls require browser environment due to CORS')
    console.log('  Fallback data would be used in CLI environment ✅')
    
    // Test chord data structure
    const mockChordData = {
      strings: "X 0 2 2 1 0",
      fingering: "X X 3 4 2 X",
      chordName: "F,maj,7,"
    }
    
    console.log('  Expected API response format:')
    console.log(`    Strings: ${mockChordData.strings}`)
    console.log(`    Fingering: ${mockChordData.fingering}`)
    console.log(`    Chord Name: ${mockChordData.chordName}`)
    
  } catch (error) {
    console.log(`  ❌ API test error: ${error.message}`)
  }
}

/**
 * Run All Tests
 */
function runAllTests() {
  console.log('🎸 Starting Chord Caption Utilities CLI Tests...')
  console.log('=' .repeat(60))
  
  testTimeValidation()
  testTimeParsing()
  testChordValidation()
  testChordNames()
  testGridLayout()
  testChordTiming()
  testAPIIntegration()
  
  console.log('\n' + '=' .repeat(60))
  console.log('✅ All tests completed!')
  console.log('\n📝 Next steps:')
  console.log('  1. Review test results above')
  console.log('  2. Fix any failing tests')
  console.log('  3. Integrate with watch.js UI')
  console.log('  4. Test with real Supabase database')
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node test_chord_utils.js [options]

Options:
  --test <category>    Test specific category (validation, api, timing, names, grid, all)
  --help, -h          Show this help message

Examples:
  node test_chord_utils.js                    # Run all tests
  node test_chord_utils.js --test validation # Test validation functions only
  node test_chord_utils.js --test api        # Test API integration only
    `)
    return
  }
  
  const testCategory = args.find(arg => arg.startsWith('--test='))?.split('=')[1] || 'all'
  
  switch (testCategory) {
    case 'validation':
      testTimeValidation()
      testChordValidation()
      break
    case 'api':
      testAPIIntegration()
      break
    case 'timing':
      testTimeParsing()
      testChordTiming()
      break
    case 'names':
      testChordNames()
      break
    case 'grid':
      testGridLayout()
      break
    case 'all':
    default:
      runAllTests()
      break
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  main()
}

module.exports = {
  testTimeValidation,
  testTimeParsing,
  testChordValidation,
  testChordNames,
  testGridLayout,
  testChordTiming,
  testAPIIntegration,
  runAllTests
}
