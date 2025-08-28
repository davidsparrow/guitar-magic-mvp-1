/**
 * 🎸 Custom Chord SVG Renderer
 * Generates pre-rendered SVG chord diagrams for AWS storage
 * 
 * Features:
 * - Correct string order mapping (E1 at top, E6 at bottom)
 * - 6-fret display zones (nut → 5th fret)
 * - Accurate finger positioning with colored circles
 * - String labels and fret numbers
 * - Support for open and barre chord positions
 */

/**
 * 🎯 SVG Dimensions and Layout Constants
 */
const SVG_CONFIG = {
  // Dimensions (increased width to show all 6 frets, height to prevent 6th string cut-off)
  width: 160,
  height: 140,
  
  // Fret spacing (6 frets: nut, 1, 2, 3, 4, 5) - 10% smaller
  fretSpacing: 27,
  
  // String spacing (5 spaces between 6 strings) - 10% smaller
  stringSpacing: 21, // Reduced from 23px to 21px
  
  // Nut thickness (much thicker than strings)
  nutThickness: 8,
  stringThickness: 1,
  
  // Finger circle size - 10% smaller
  fingerCircleDiameter: 18,
  
  // Margins (top-aligned with 8px top margin)
  leftMargin: 15,
  topMargin: 8
}

/**
 * 🎨 Finger Color Mapping
 */
const FINGER_COLORS = {
  '1': '#ff914d', // Orange - Index finger
  '2': '#cb6ce6', // Purple - Middle finger
  '3': '#0f8120', // Green - Ring finger (darker green for better contrast)
  '4': '#082cf',  // Blue - Pinky finger
  'T': '#000000'  // Black - Thumb
}

/**
 * 🎵 String Names (top to bottom: E1, B2, G3, D4, A5, E6)
 */
const STRING_NAMES = ['E', 'B', 'G', 'D', 'A', 'E']

/**
 * 🎯 Fret Numbers (left to right: nut, 1, 2, 3, 4, 5)
 */
const FRET_NUMBERS = ['0', '1', '2', '3', '4', '5']

/**
 * 🎯 MAIN CHORD RENDERING FUNCTION
 * Generates SVG string for a chord diagram
 * @param {Object} chordData - Chord data from chordData.js
 * @param {string} zone - Fret zone (default: 'open' for nut→5th fret)
 * @returns {string} SVG string ready for file saving
 */
export const renderChord = (chordData, zone = 'open', theme = 'light') => {
  if (!chordData || !chordData.strings || !chordData.frets || !chordData.fingering) {
    throw new Error('Invalid chord data provided')
  }
  
  // Start building SVG
  let svg = `<svg width="${SVG_CONFIG.width}" height="${SVG_CONFIG.height}" xmlns="http://www.w3.org/2000/svg">`
  
  // Add background based on theme
  const bgColor = theme === 'dark' ? 'black' : 'white'
  svg += `<rect width="${SVG_CONFIG.width}" height="${SVG_CONFIG.height}" fill="${bgColor}"/>`
  
  // Draw the fretboard based on theme
  svg += drawFretboard(theme)
  
  // Draw mute/open symbols above the nut
  svg += drawMuteOpenSymbols(chordData, theme)
  
  // Draw finger positions
  svg += drawFingerPositions(chordData, theme)
  
  // Draw string labels and fret numbers
  svg += drawLabels(theme)
  
  // Close SVG
  svg += '</svg>'
  
  return svg
}

/**
 * 🎨 Draw the basic fretboard grid
 * Creates strings (horizontal lines) and frets (vertical lines)
 * Strings: E1 at top, E6 at bottom
 * Frets: Nut at left, 5th fret at right
 */
const drawFretboard = (theme = 'light') => {
  let svg = ''
  
  // Calculate starting positions
  const startX = SVG_CONFIG.leftMargin
  const startY = SVG_CONFIG.topMargin
  
  // Set colors based on theme
  const lineColor = theme === 'dark' ? 'white' : 'black'
  
  // Draw strings (6 horizontal lines, top to bottom: High E at top, Bass E at bottom)
  for (let i = 0; i < 6; i++) {
    const y = startY + ((5 - i) * SVG_CONFIG.stringSpacing) // Flip: High E (i=0) at top, Bass E (i=5) at bottom
    const x1 = startX
    const x2 = startX + (5 * SVG_CONFIG.fretSpacing) // 5 fret spaces + nut
    
    svg += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${lineColor}" stroke-width="${SVG_CONFIG.stringThickness}"/>`
  }
  
  // Draw frets (6 vertical lines, left to right: nut, 1, 2, 3, 4, 5)
  for (let i = 0; i < 6; i++) {
    const x = startX + (i * SVG_CONFIG.fretSpacing)
    const y1 = startY
    const y2 = startY + (5 * SVG_CONFIG.stringSpacing) // Stop exactly at last string (no crossing below)
    
    // Nut is thicker than other frets
    const thickness = i === 0 ? SVG_CONFIG.nutThickness : SVG_CONFIG.stringThickness
    
    svg += `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${lineColor}" stroke-width="${thickness}"/>`
  }
  
  return svg
}

/**
 * 🚫 Draw mute (X) and open (O) string symbols above the nut
 * Places symbols above the correct strings at the top of the diagram
 * @param {Object} chordData - Chord data with strings, frets, fingering
 * @returns {string} SVG elements for mute/open symbols
 */
const drawMuteOpenSymbols = (chordData, theme = 'light') => {
  let svg = ''
  
  // Process each string
  for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
    const fret = chordData.frets[stringIndex]
    
    // Only draw symbols for muted (X) or open (0) strings
    if (fret !== 'X' && fret !== '0') continue
    
    // Calculate position above the nut (flipped string order)
    const x = SVG_CONFIG.leftMargin + (0 * SVG_CONFIG.fretSpacing) // Nut position
    const y = SVG_CONFIG.topMargin + ((5 - stringIndex) * SVG_CONFIG.stringSpacing) - 8 // Above the string (flipped)
    
    if (fret === 'X') {
      // Draw muted string symbol (X) - white circle with black X (2px smaller radius)
      const radius = (SVG_CONFIG.fingerCircleDiameter / 2) - 2
      svg += `<circle cx="${x}" cy="${y + 8}" r="${radius}" fill="white" stroke="black" stroke-width="1"/>`
      svg += `<text x="${x}" y="${y + 12}" text-anchor="middle" fill="black" font-family="Arial, sans-serif" font-size="12" font-weight="bold">X</text>`
    } else if (fret === '0') {
      // Draw open string symbol (O) - white circle with black O (2px smaller radius)
      const radius = (SVG_CONFIG.fingerCircleDiameter / 2) - 2
      svg += `<circle cx="${x}" cy="${y + 8}" r="${radius}" fill="white" stroke="black" stroke-width="1"/>`
      svg += `<text x="${x}" y="${y + 12}" text-anchor="middle" fill="black" font-family="Arial, sans-serif" font-size="12" font-weight="bold">O</text>`
    }
  }
  
  return svg
}

/**
 * 🎯 Draw finger positions on the fretboard
 * Places colored circles with white numbers at correct positions
 * @param {Object} chordData - Chord data with strings, frets, fingering
 * @returns {string} SVG elements for finger positions
 */
const drawFingerPositions = (chordData, theme = 'light') => {
  let svg = ''
  
  // Process each string (array index 0-5 maps to visual position 0-5)
  for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
    const fret = chordData.frets[stringIndex]
    const finger = chordData.fingering[stringIndex]
    
    // Skip muted strings (X) and open strings (0)
    if (fret === 'X' || fret === '0') continue
    
    // Calculate position for this finger
    const fretNumber = parseInt(fret)
    const stringPosition = stringIndex
    
    // Position calculation (flipped string order)
    const x = SVG_CONFIG.leftMargin + (fretNumber * SVG_CONFIG.fretSpacing) - (SVG_CONFIG.fretSpacing / 2)
    const y = SVG_CONFIG.topMargin + ((5 - stringPosition) * SVG_CONFIG.stringSpacing) // Flip: High E at top, Bass E at bottom
    
    // Get finger color
    const color = FINGER_COLORS[finger] || '#000000'
    
    // Set outline color based on theme
    const outlineColor = theme === 'dark' ? 'white' : 'black'
    
    // Draw colored circle
    const radius = SVG_CONFIG.fingerCircleDiameter / 2
    svg += `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" stroke="${outlineColor}" stroke-width="1"/>`
    
    // Draw white finger number
    svg += `<text x="${x}" y="${y + 4}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="13" font-weight="bold">${finger}</text>`
  }
  
  return svg
}

/**
 * 🏷️ Draw string labels and fret numbers
 * String labels on the right side, fret numbers on the bottom
 * @returns {string} SVG elements for labels
 */
const drawLabels = (theme = 'light') => {
  let svg = ''
  
  // Set text color based on theme
  const textColor = theme === 'dark' ? 'white' : 'black'
  
  // Draw string labels on the right side (High E at top, Bass E at bottom)
  for (let i = 0; i < 6; i++) {
    const x = SVG_CONFIG.leftMargin + (5 * SVG_CONFIG.fretSpacing) + 15 // Right of 5th fret
    const y = SVG_CONFIG.topMargin + ((5 - i) * SVG_CONFIG.stringSpacing) + 4 // Align with string (flipped)
    
    svg += `<text x="${x}" y="${y}" text-anchor="start" fill="${textColor}" font-family="Arial, sans-serif" font-size="10">${STRING_NAMES[i]}</text>`
  }
  
  // Draw fret numbers on the bottom (0, 1, 2, 3, 4, 5) - moved up 4px
  for (let i = 0; i < 6; i++) {
    const x = SVG_CONFIG.leftMargin + (i * SVG_CONFIG.fretSpacing)
    const y = SVG_CONFIG.topMargin + (5 * SVG_CONFIG.stringSpacing) + 16 // Below 6th string, moved up 4px
    
    svg += `<text x="${x}" y="${y}" text-anchor="middle" fill="${textColor}" font-family="Arial, sans-serif" font-size="10">${FRET_NUMBERS[i]}</text>`
  }
  
  return svg
}

/**
 * 🧪 Test function to verify the renderer works with REAL chord data
 * @param {string} chordName - Chord name to test
 * @returns {string} SVG string for testing
 */
export const testChordRenderer = async (chordName = 'C', theme = 'light') => {
  // Import and use REAL chord data instead of hardcoded C
  try {
    // Dynamic import for ES modules
    const chordDataModule = await import('../utils/chordData.js')
    const realChordData = chordDataModule.generateChordData(chordName)
    
    if (realChordData) {
      return renderChord(realChordData, 'open', theme)
    } else {
      throw new Error(`Failed to generate chord data for ${chordName}`)
    }
  } catch (error) {
    console.error(`❌ Error in testChordRenderer: ${error.message}`)
    // Fallback to a simple error SVG
    return `<svg width="160" height="140" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="140" fill="white"/>
      <text x="80" y="70" text-anchor="middle" fill="red" font-family="Arial, sans-serif" font-size="14">
        Error: Could not render ${chordName}
      </text>
    </svg>`
  }
}
