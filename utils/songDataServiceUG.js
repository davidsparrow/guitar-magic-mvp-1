/**
 * 🎸 Ultimate Guitar Song Data Service
 * 
 * Main service layer for Ultimate Guitar song data integration
 * Transforms raw UG tab data into structured song objects
 * Uses the enhanced database schema for optimal storage
 * 
 * Features:
 * - Ultimate Guitar scraper integration
 * - Tab data parsing and transformation
 * - Song section extraction with timing
 * - Chord progression analysis
 * - Database-ready data preparation
 */

import { callUGScraper } from './ugScraperIntegration.js'

/**
 * Song Data Structure (matches enhanced database schema)
 * @typedef {Object} SongData
 * @property {string} title - Song title
 * @property {string} artist - Song artist
 * @property {number} ugTabId - Ultimate Guitar tab ID
 * @property {string} instrumentType - Instrument type (guitar, bass, etc.)
 * @property {string} tuning - Instrument tuning
 * @property {string} tabbedBy - Who created the tab
 * @property {SongSection[]} sections - Song sections with timing
 * @property {ChordProgression[]} chordProgressions - Chord changes with timing
 * @property {Object} metadata - Additional song information
 */

/**
 * Song Section Structure
 * @typedef {Object} SongSection
 * @property {string} sectionName - Section name (e.g., "Verse 1", "Chorus")
 * @property {string} sectionType - Section type (verse, chorus, bridge, solo, etc.)
 * @property {string} sectionLabel - Section label (e.g., "fig. a", "Guitar Solo")
 * @property {string} startTime - Start time in MM:SS format
 * @property {string} endTime - End time in MM:SS format
 * @property {number} repeatCount - How many times to repeat (2x, 6x, etc.)
 * @property {string} performanceNotes - Performance instructions
 * @property {Object} tabContent - Tab notation for this section
 * @property {Object} chordProgression - Chords in this section
 */

/**
 * Chord Progression Structure
 * @typedef {Object} ChordProgression
 * @property {string} chordName - Chord name (e.g., "Am", "C", "Fmaj7")
 * @property {string} chordType - Chord type (major, minor, 7th, etc.)
 * @property {string} rootNote - Root note (e.g., "A", "C", "F")
 * @property {string} startTime - Start time in MM:SS format
 * @property {string} endTime - End time in MM:SS format
 * @property {number} sequenceOrder - Order in the progression
 * @property {Object} chordData - Full chord information
 */

/**
 * 🎯 MAIN SONG DATA SERVICE FUNCTION
 * Primary entry point for song data requests
 * Fetches UG data and transforms it into structured format
 * 
 * @param {number|string} tabId - Ultimate Guitar tab ID
 * @returns {Promise<SongData|null>} Structured song data or null if not found
 */
export const getSongDataUG = async (tabId) => {
  if (!tabId || (typeof tabId !== 'string' && typeof tabId !== 'number')) {
    console.warn('⚠️ Invalid tab ID provided:', tabId)
    return null
  }

  try {
    console.log(`🎸 Fetching song data for tab ID: ${tabId}`)
    
    // 🚀 PHASE 1: Fetch raw data from Ultimate Guitar
    const ugResult = await callUGScraper(tabId)
    
    if (!ugResult || !ugResult.success) {
      console.warn(`⚠️ Failed to fetch UG data for tab ID: ${tabId}`)
      return null
    }
    
    console.log(`✅ Successfully fetched UG data for tab ID: ${tabId}`)
    
    // 🔄 PHASE 2: Transform raw UG data to structured format
    const songData = transformUGDataToSongData(ugResult.data, tabId)
    
    if (!songData) {
      console.warn(`⚠️ Failed to transform UG data for tab ID: ${tabId}`)
      return null
    }
    
    console.log(`✅ Successfully transformed song data for: ${songData.title} by ${songData.artist}`)
    
    return songData
    
  } catch (error) {
    console.error(`❌ Error in getSongDataUG for tab ID ${tabId}:`, error)
    return null
  }
}

/**
 * 🔄 Transform raw UG data to structured song data
 * Parses tab content and extracts song structure
 * 
 * @param {Object} ugData - Raw data from Ultimate Guitar
 * @param {number|string} tabId - Original tab ID
 * @returns {SongData|null} Structured song data
 */
const transformUGDataToSongData = (ugData, tabId) => {
  try {
    console.log(`🔄 Transforming UG data to structured song format`)
    
    // Extract basic song information
    const songInfo = extractSongInfo(ugData)
    if (!songInfo) {
      console.warn('⚠️ Failed to extract basic song information')
      return null
    }
    
    // Extract song sections with timing
    const sections = extractSongSections(ugData)
    console.log(`📊 Extracted ${sections.length} song sections`)
    
    // Extract chord progressions
    const chordProgressions = extractChordProgressions(ugData, sections)
    console.log(`🎵 Extracted ${chordProgressions.length} chord progressions`)
    
    // Build the complete song data object
    const songData = {
      title: songInfo.title,
      artist: songInfo.artist,
      ugTabId: parseInt(tabId),
      instrumentType: songInfo.instrumentType || 'guitar',
      tuning: songInfo.tuning || 'E A D G B E',
      tabbedBy: songInfo.tabbedBy,
      album: songInfo.album,
      sections: sections,
      chordProgressions: chordProgressions,
      metadata: {
        source: 'ultimate_guitar',
        rawData: ugData,
        transformed: true,
        transformationDate: new Date().toISOString()
      }
    }
    
    return songData
    
  } catch (error) {
    console.error('❌ Error transforming UG data:', error)
    return null
  }
}

/**
 * 📋 Extract basic song information from UG data
 * 
 * @param {Object} ugData - Raw UG data
 * @returns {Object|null} Basic song information
 */
const extractSongInfo = (ugData) => {
  try {
    const rawOutput = ugData.rawOutput || ''
    const lines = rawOutput.split('\n')
    
    let songInfo = {}
    
    // Extract song name and artist from header
    for (const line of lines) {
      if (line.includes('Song name:')) {
        const match = line.match(/Song name:\s*(.+?)\s+by\s+(.+)/)
        if (match) {
          songInfo.title = match[1].trim()
          songInfo.artist = match[2].trim()
        }
        break
      }
    }
    
    // Extract additional metadata
    for (const line of lines) {
      if (line.includes('Album:')) {
        const match = line.match(/Album:\s*(.+)/)
        if (match) songInfo.album = match[1].trim()
      }
      if (line.includes('Tabbed by:')) {
        const match = line.match(/Tabbed by:\s*(.+)/)
        if (match) songInfo.tabbedBy = match[1].trim()
      }
    }
    
    // Determine instrument type from content
    if (rawOutput.includes('G|---') || rawOutput.includes('G|--')) {
      songInfo.instrumentType = 'guitar'
    } else if (rawOutput.includes('B|---') || rawOutput.includes('B|--')) {
      songInfo.instrumentType = 'bass'
    } else {
      songInfo.instrumentType = 'guitar' // Default
    }
    
    // Determine tuning (default to standard guitar)
    songInfo.tuning = 'E A D G B E'
    
    return songInfo.title && songInfo.artist ? songInfo : null
    
  } catch (error) {
    console.error('❌ Error extracting song info:', error)
    return null
  }
}

/**
 * 📊 Extract song sections with timing from UG data
 * 
 * @param {Object} ugData - Raw UG data
 * @returns {SongSection[]} Array of song sections
 */
const extractSongSections = (ugData) => {
  try {
    const rawOutput = ugData.rawOutput || ''
    const lines = rawOutput.split('\n')
    
    const sections = []
    let currentSection = null
    let sectionOrder = 0
    
    // Extract timing markers for reference
    const timingMarkers = ugData.timingMarkers || []
    console.log(`🔍 Found ${timingMarkers.length} timing markers:`, timingMarkers)
    
    // If we have timing markers, use them for section detection
    if (timingMarkers.length > 0) {
      sections.push(...extractSectionsFromTimingMarkers(lines, timingMarkers, sectionOrder))
    } else {
      // Fallback: extract sections from tab structure and figure labels
      console.log(`⚠️ No timing markers found, using fallback section detection`)
      sections.push(...extractSectionsFromTabStructure(lines, sectionOrder))
    }
    
    console.log(`📊 Successfully extracted ${sections.length} song sections`)
    return sections
    
  } catch (error) {
    console.error('❌ Error extracting song sections:', error)
    return []
  }
}

/**
 * 🎯 Extract sections from timing markers (primary method)
 * 
 * @param {string[]} lines - All lines from UG data
 * @param {string[]} timingMarkers - Array of timing markers
 * @param {number} startOrder - Starting section order
 * @returns {SongSection[]} Array of song sections
 */
const extractSectionsFromTimingMarkers = (lines, timingMarkers, startOrder) => {
  const sections = []
  let currentSection = null
  let sectionOrder = startOrder
  
  // Process each line to identify sections
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Look for timing markers (MM:SS format) - ANYWHERE in the line
    const timingMatch = line.match(/(\d+:\d+)/)
    if (timingMatch) {
      const time = timingMatch[1]
      
      // Close previous section if exists
      if (currentSection) {
        currentSection.endTime = time
        sections.push(currentSection)
      }
      
      // Extract section label from the same line (before the timing marker)
      let sectionLabel = line.replace(/\d+:\d+.*/, '').trim()
      let sectionName = sectionLabel || `Section at ${time}`
      let sectionType = 'verse' // Default type
      
      // Determine section type based on label content
      if (sectionLabel.includes('Guitar Solo')) {
        sectionType = 'solo'
        sectionName = 'Guitar Solo'
      } else if (sectionLabel.includes('Drums')) {
        sectionType = 'instrumental'
        sectionName = 'Drums'
      } else if (sectionLabel.includes('Bass Out')) {
        sectionType = 'instrumental'
        sectionName = 'Bass Out'
      } else if (sectionLabel.includes('Organ') || sectionLabel.includes('Violins')) {
        sectionType = 'instrumental'
        sectionName = sectionLabel
      } else if (sectionLabel) {
        sectionType = 'verse'
        sectionName = sectionLabel
      }
      
      // Start new section
      currentSection = {
        sectionName: sectionName,
        sectionType: sectionType,
        sectionLabel: sectionLabel || null,
        startTime: time,
        endTime: null,
        repeatCount: 1,
        performanceNotes: null,
        tabContent: {},
        chordProgression: {},
        sequenceOrder: sectionOrder++
      }
      
      console.log(`🎯 Created timed section: ${sectionName} (${sectionType}) at ${time}`)
    }
    
    // Look for repeat instructions (2x, 6x, etc.)
    if (line.includes('x') && /\d+x/.test(line)) {
      const repeatMatch = line.match(/(\d+)x/)
      if (repeatMatch && currentSection) {
        currentSection.repeatCount = parseInt(repeatMatch[1])
        console.log(`🔄 Section ${currentSection.sectionName} repeats ${currentSection.repeatCount}x`)
      }
    }
    
    // Look for performance notes
    if (line.includes('play like this:') || line.includes('>=play')) {
      if (currentSection) {
        currentSection.performanceNotes = line
        console.log(`📝 Performance note for ${currentSection.sectionName}: ${line}`)
      }
    }
    
    // Look for figure labels
    if (line.includes('fig.') && currentSection) {
      const figMatch = line.match(/fig\.\s*([a-z])/i)
      if (figMatch) {
        currentSection.sectionLabel = `fig. ${figMatch[1]}`
        console.log(`🏷️ Figure label for ${currentSection.sectionName}: fig. ${figMatch[1]}`)
      }
    }
  }
  
  // Close the last section if exists
  if (currentSection) {
    // Estimate end time if not set
    if (!currentSection.endTime && timingMarkers.length > 1) {
      const currentIndex = timingMarkers.indexOf(currentSection.startTime)
      if (currentIndex < timingMarkers.length - 1) {
        currentSection.endTime = timingMarkers[currentIndex + 1]
      }
    }
    sections.push(currentSection)
  }
  
  // Post-process sections to improve timing
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    
    // If no end time, use next section's start time
    if (!section.endTime && i < sections.length - 1) {
      section.endTime = sections[i + 1].startTime
    }
    
    // Calculate duration if we have both times
    if (section.startTime && section.endTime) {
      section.durationSeconds = calculateDurationSeconds(section.startTime, section.endTime)
    }
  }
  
  return sections
}

/**
 * 🎵 Extract sections from tab structure (fallback method)
 * Creates sections based on figure labels, performance instructions, and tab structure
 * 
 * @param {string[]} lines - All lines from UG data
 * @param {number} startOrder - Starting section order
 * @returns {SongSection[]} Array of song sections
 */
const extractSectionsFromTabStructure = (lines, startOrder) => {
  const sections = []
  let sectionOrder = startOrder
  let currentSection = null
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Look for figure labels (fig. a, fig. b, etc.)
    const figMatch = line.match(/fig\.\s*([a-z])/i)
    if (figMatch) {
      // Close previous section if exists
      if (currentSection) {
        sections.push(currentSection)
      }
      
      // Start new section based on figure
      currentSection = {
        sectionName: `Figure ${figMatch[1].toUpperCase()}`,
        sectionType: 'instrumental',
        sectionLabel: `fig. ${figMatch[1]}`,
        startTime: null, // No timing available
        endTime: null,
        repeatCount: 1,
        performanceNotes: null,
        tabContent: {},
        chordProgression: {},
        sequenceOrder: sectionOrder++
      }
      
      console.log(`🎯 Created figure section: Figure ${figMatch[1].toUpperCase()}`)
    }
    
    // Look for performance instructions
    if (line.includes('play like this:') || line.includes('>=play')) {
      if (currentSection) {
        currentSection.performanceNotes = line
        console.log(`📝 Performance note for ${currentSection.sectionName}: ${line}`)
      }
    }
    
    // Look for repeat instructions
    if (line.includes('x') && /\d+x/.test(line)) {
      const repeatMatch = line.match(/(\d+)x/)
      if (repeatMatch && currentSection) {
        currentSection.repeatCount = parseInt(repeatMatch[1])
        console.log(`🔄 Section ${currentSection.sectionName} repeats ${currentSection.repeatCount}x`)
      }
    }
    
    // Look for section descriptions
    if (line.includes('fill') || line.includes('solo') || line.includes('verse') || line.includes('chorus')) {
      if (currentSection) {
        currentSection.sectionName = line.trim()
        console.log(`🏷️ Updated section name: ${line.trim()}`)
      }
    }
  }
  
  // Close the last section if exists
  if (currentSection) {
    sections.push(currentSection)
  }
  
  // If no sections were created, create a default one
  if (sections.length === 0) {
    sections.push({
      sectionName: 'Main Tab',
      sectionType: 'instrumental',
      sectionLabel: null,
      startTime: null,
      endTime: null,
      repeatCount: 1,
      performanceNotes: null,
      tabContent: {},
      chordProgression: {},
      sequenceOrder: 0
    })
    console.log(`🎯 Created default section: Main Tab`)
  }
  
  return sections
}

/**
 * 🎵 Extract chord progressions from UG data
 * 
 * @param {Object} ugData - Raw UG data
 * @param {SongSection[]} sections - Song sections for context
 * @returns {ChordProgression[]} Array of chord progressions
 */
const extractChordProgressions = (ugData, sections) => {
  try {
    const rawOutput = ugData.rawOutput || ''
    const lines = rawOutput.split('\n')
    
    const chordProgressions = []
    let chordOrder = 0
    
    // Extract timing markers for chord positioning
    const timingMarkers = ugData.timingMarkers || []
    
    // Look for chord patterns in tab lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Look for tab lines (containing G|, D|, A|, E|)
      if (line.includes('G|') || line.includes('D|') || line.includes('A|') || line.includes('E|')) {
        
        // Extract potential chord information from tab
        const chordInfo = extractChordFromTabLine(line)
        if (chordInfo) {
          
          // Find the section this chord belongs to
          const section = findSectionForTime(timingMarkers, sections, i, lines)
          
          const chordProgression = {
            chordName: chordInfo.chordName,
            chordType: chordInfo.chordType,
            rootNote: chordInfo.rootNote,
            startTime: section ? section.startTime : null,
            endTime: section ? section.endTime : null,
            sequenceOrder: chordOrder++,
            barPosition: null, // Will be calculated later
            chordData: {
              tabLine: line,
              fingering: chordInfo.fingering,
              notes: chordInfo.notes
            }
          }
          
          chordProgressions.push(chordProgression)
        }
      }
    }
    
    console.log(`🎵 Extracted ${chordProgressions.length} chord progressions`)
    return chordProgressions
    
  } catch (error) {
    console.error('❌ Error extracting chord progressions:', error)
    return []
  }
}

/**
 * 🎯 Extract chord information from a tab line
 * 
 * @param {string} tabLine - Tab notation line
 * @returns {Object|null} Chord information
 */
const extractChordFromTabLine = (tabLine) => {
  try {
    // This is a simplified chord extraction
    // In a full implementation, you'd analyze the fret positions
    
    // Look for common chord patterns
    if (tabLine.includes('0') && tabLine.includes('2') && tabLine.includes('3')) {
      return {
        chordName: 'Am',
        chordType: 'minor',
        rootNote: 'A',
        fingering: ['X', '0', '2', '2', '1', '0'],
        notes: ['A', 'E', 'A', 'C', 'E']
      }

    }
    
    if (tabLine.includes('0') && tabLine.includes('3')) {
      return {
        chordName: 'C',
        chordType: 'major',
        rootNote: 'C',
        fingering: ['X', '3', '2', '0', '1', '0'],
        notes: ['C', 'E', 'G', 'C', 'E']
      }
    }
    
    // Default chord if no pattern matches
    return {
      chordName: 'Unknown',
      chordType: 'unknown',
      rootNote: '?',
      fingering: ['X', 'X', 'X', 'X', 'X', 'X'],
      notes: []
    }
    
  } catch (error) {
    console.error('❌ Error extracting chord from tab line:', error)
    return null
  }
}

/**
 * 🔍 Find the section a chord belongs to based on timing
 * 
 * @param {string[]} timingMarkers - Array of timing markers
 * @param {SongSection[]} sections - Song sections
 * @param {number} lineIndex - Current line index
 * @param {string[]} lines - All lines for context
 * @returns {SongSection|null} Matching section
 */
const findSectionForTime = (timingMarkers, sections, lineIndex, lines) => {
  try {
    // Look backwards from current line for timing markers
    for (let i = lineIndex; i >= 0; i--) {
      const line = lines[i].trim()
      const timingMatch = line.match(/^(\d+:\d+)/)
      
      if (timingMatch) {
        const time = timingMatch[1]
        
        // Find section that starts at this time
        const section = sections.find(s => s.startTime === time)
        if (section) {
          return section
        }
      }
    }
    
    return null
    
  } catch (error) {
    console.error('❌ Error finding section for time:', error)
    return null
  }
}

/**
 * ⏱️ Calculate duration between two time strings
 * 
 * @param {string} startTime - Start time in MM:SS format
 * @param {string} endTime - End time in MM:SS format
 * @returns {number} Duration in seconds
 */
const calculateDurationSeconds = (startTime, endTime) => {
  try {
    if (!startTime || !endTime) return 0
    
    const startParts = startTime.split(':').map(Number)
    const endParts = endTime.split(':').map(Number)
    
    const startSeconds = startParts[0] * 60 + startParts[1]
    const endSeconds = endParts[0] * 60 + endParts[1]
    
    return Math.max(0, endSeconds - startSeconds)
    
  } catch (error) {
    console.error('❌ Error calculating duration:', error)
    return 0
  }
}

/**
 * 🧪 Test function to verify the song data service works
 * 
 * @param {number|string} tabId - Ultimate Guitar tab ID to test
 * @returns {Promise<Object>} Test results
 */
export const testSongDataService = async (tabId = 100) => {
  console.log(`🧪 Testing Song Data Service for tab ID: ${tabId}`)
  
  try {
    const startTime = Date.now()
    const songData = await getSongDataUG(tabId)
    const endTime = Date.now()
    
    if (songData) {
      console.log('✅ Test successful:', {
        tabId,
        title: songData.title,
        artist: songData.artist,
        sections: songData.sections.length,
        chordProgressions: songData.chordProgressions.length,
        responseTime: `${endTime - startTime}ms`
      })
      
      return { success: true, songData, responseTime: endTime - startTime }
    } else {
      console.error('❌ Test failed: No song data returned')
      return { success: false, error: 'No song data returned' }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * 🎯 Service Status Check
 * Returns the current status of the song data service
 * 
 * @returns {Object} Service status information
 */
export const getSongDataServiceStatus = () => {
  return {
    service: 'Song Data Service UG',
    status: 'ready',
    features: [
      'UG data fetching',
      'Song structure extraction',
      'Section timing analysis',
      'Chord progression parsing',
      'Database-ready data preparation'
    ],
    lastUpdated: new Date().toISOString(),
    nextStep: 'Test with real UG tab IDs and integrate with database'
  }
}

