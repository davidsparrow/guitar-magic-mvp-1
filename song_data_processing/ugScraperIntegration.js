/**
 * 🎸 Ultimate Guitar Scraper Integration
 * 
 * Direct integration with the Go scraper tool executable
 * Spawns the Go process and manages communication
 * 
 * Features:
 * - Subprocess management for Go tool
 * - Command execution with proper parameters
 * - JSON output parsing
 * - Error handling and timeout management
 * - Logging and debugging support
 * - Song search functionality
 */

import { spawn } from 'child_process'
import path from 'path'

/**
 * Configuration for the UG scraper integration
 */
const UG_SCRAPER_CONFIG = {
  // Path to the Go executable (relative to project root)
  executablePath: './ultimate-guitar-scraper-setup/ultimate-guitar-scraper/ultimate-guitar-scraper',
  
  // Default timeout for scraper calls (30 seconds)
  defaultTimeout: 30000,
  
  // Maximum retry attempts
  maxRetries: 2,
  
  // Delay between retries (1 second)
  retryDelay: 1000,
  
  // Environment variables for the Go process
  env: {
    ...process.env,
    // Add any specific environment variables needed by the Go tool
  }
}

/**
 * 🚀 MAIN FUNCTION: Call Ultimate Guitar scraper for song data
 * 
 * @param {number|string} tabId - Ultimate Guitar tab ID to fetch
 * @param {Object} options - Optional configuration
 * @param {number} options.timeout - Timeout in milliseconds
 * @param {number} options.retries - Number of retry attempts
 * @returns {Promise<Object>} Promise that resolves to song data or error
 */
export const callUGScraper = async (tabId, options = {}) => {
  if (!tabId || (typeof tabId !== 'string' && typeof tabId !== 'number')) {
    throw new Error('Invalid tab ID provided')
  }

  const config = {
    timeout: options.timeout || UG_SCRAPER_CONFIG.defaultTimeout,
    retries: options.retries || UG_SCRAPER_CONFIG.maxRetries,
    retryDelay: options.retryDelay || UG_SCRAPER_CONFIG.retryDelay
  }

  console.log(`🎸 Calling UG scraper for tab ID: ${tabId}`)
  console.log(`⚙️ Configuration:`, config)

  let lastError = null
  
  // Retry loop
  for (let attempt = 1; attempt <= config.retries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${config.retries}`)
      
      const result = await executeUGScraper(tabId, config.timeout)
      
      if (result.success) {
        console.log(`✅ UG scraper successful on attempt ${attempt}`)
        return result
      } else {
        lastError = new Error(result.error || 'UG scraper failed')
        console.warn(`⚠️ Attempt ${attempt} failed:`, lastError.message)
      }
      
    } catch (error) {
      lastError = error
      console.error(`❌ Attempt ${attempt} error:`, error.message)
      
      // If this isn't the last attempt, wait before retrying
      if (attempt < config.retries) {
        console.log(`⏳ Waiting ${config.retryDelay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, config.retryDelay))
      }
    }
  }

  // All retries failed
  console.error(`❌ All ${config.retries} attempts failed for tab ID: ${tabId}`)
  throw lastError || new Error('UG scraper failed after all retries')
}

/**
 * 🔍 NEW FUNCTION: Search for songs by name/artist
 * 
 * @param {string} query - Search query (e.g., "Hotel California Eagles")
 * @param {Object} options - Optional configuration
 * @param {number} options.timeout - Timeout in milliseconds
 * @param {number} options.retries - Number of retry attempts
 * @returns {Promise<Object>} Promise that resolves to search results or error
 */
export const searchSongs = async (query, options = {}) => {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new Error('Invalid search query provided')
  }

  const config = {
    timeout: options.timeout || UG_SCRAPER_CONFIG.defaultTimeout,
    retries: options.retries || UG_SCRAPER_CONFIG.maxRetries,
    retryDelay: options.retryDelay || UG_SCRAPER_CONFIG.retryDelay
  }

  console.log(`🔍 Searching UG for: "${query}"`)
  console.log(`⚙️ Configuration:`, config)

  let lastError = null
  
  // Retry loop
  for (let attempt = 1; attempt <= config.retries; attempt++) {
    try {
      console.log(`🔄 Search attempt ${attempt}/${config.retries}`)
      
      const result = await executeUGSearch(query, config.timeout)
      
      if (result.success) {
        console.log(`✅ UG search successful on attempt ${attempt}`)
        return result
      } else {
        lastError = new Error(result.error || 'UG search failed')
        console.warn(`⚠️ Search attempt ${attempt} failed:`, lastError.message)
      }
      
    } catch (error) {
      lastError = error
      console.error(`❌ Search attempt ${attempt} error:`, error.message)
      
      // If this isn't the last attempt, wait before retrying
      if (attempt < config.retries) {
        console.log(`⏳ Waiting ${config.retryDelay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, config.retryDelay))
      }
    }
  }

  // All retries failed
  console.error(`❌ All ${config.retries} search attempts failed for query: "${query}"`)
  throw lastError || new Error('UG search failed after all retries')
}

/**
 * Execute the UG scraper with timeout and error handling
 * 
 * @param {number|string} tabId - Ultimate Guitar tab ID to fetch
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Object>} Promise that resolves to result or error
 */
const executeUGScraper = (tabId, timeout) => {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Executing UG scraper for tab ID: ${tabId}`)
    
    // Build the command and arguments
    const command = path.resolve(UG_SCRAPER_CONFIG.executablePath)
    const args = buildScraperArgs(tabId)
    
    console.log(`📋 Command: ${command}`)
    console.log(`📋 Args:`, args)
    
    // Spawn the Go process
    const scraperProcess = spawn(command, args, {
      env: UG_SCRAPER_CONFIG.env,
      stdio: ['pipe', 'pipe', 'pipe']
    })
    
    let stdout = ''
    let stderr = ''
    let processKilled = false
    
    // Set up timeout
    const timeoutId = setTimeout(() => {
      if (!processKilled) {
        processKilled = true
        scraperProcess.kill('SIGTERM')
        reject(new Error(`UG scraper timeout after ${timeout}ms`))
      }
    }, timeout)
    
    // Handle stdout (data output)
    scraperProcess.stdout.on('data', (data) => {
      stdout += data.toString()
      console.log(`📤 UG scraper stdout:`, data.toString().trim())
    })
    
    // Handle stderr (error output)
    scraperProcess.stderr.on('data', (data) => {
      stderr += data.toString()
      console.warn(`⚠️ UG scraper stderr:`, data.toString().trim())
    })
    
    // Handle process completion
    scraperProcess.on('close', (code) => {
      clearTimeout(timeoutId)
      
      if (processKilled) {
        return // Already handled by timeout
      }
      
      console.log(`🏁 UG scraper process closed with code: ${code}`)
      
      if (code === 0) {
        // Process completed successfully
        try {
          const parsedData = parseScraperOutput(stdout, tabId)
          resolve({
            success: true,
            data: parsedData,
            rawOutput: stdout,
            processCode: code
          })
        } catch (parseError) {
          reject(new Error(`Failed to parse UG scraper output: ${parseError.message}`))
        }
      } else {
        // Process failed
        const errorMessage = stderr || `Process exited with code ${code}`
        reject(new Error(`UG scraper failed: ${errorMessage}`))
      }
    })
    
    // Handle process errors
    scraperProcess.on('error', (error) => {
      clearTimeout(timeoutId)
      if (!processKilled) {
        reject(new Error(`Failed to start UG scraper: ${error.message}`))
      }
    })
  })
}

/**
 * Execute the UG scraper's search command with timeout and error handling
 * 
 * @param {string} query - Search query (e.g., "Hotel California Eagles")
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Object>} Promise that resolves to search results or error
 */
const executeUGSearch = (query, timeout) => {
  return new Promise((resolve, reject) => {
    console.log(`🔍 Executing UG search for query: "${query}"`)
    
    // Build the command and arguments
    const command = path.resolve(UG_SCRAPER_CONFIG.executablePath)
    const args = buildSearchArgs(query)
    
    console.log(`📋 Command: ${command}`)
    console.log(`📋 Args:`, args)
    
    // Spawn the Go process
    const searchProcess = spawn(command, args, {
      env: UG_SCRAPER_CONFIG.env,
      stdio: ['pipe', 'pipe', 'pipe']
    })
    
    let stdout = ''
    let stderr = ''
    let processKilled = false
    
    // Set up timeout
    const timeoutId = setTimeout(() => {
      if (!processKilled) {
        processKilled = true
        searchProcess.kill('SIGTERM')
        reject(new Error(`UG search timeout after ${timeout}ms`))
      }
    }, timeout)
    
    // Handle stdout (data output)
    searchProcess.stdout.on('data', (data) => {
      stdout += data.toString()
      console.log(`📤 UG search stdout:`, data.toString().trim())
    })
    
    // Handle stderr (error output)
    searchProcess.stderr.on('data', (data) => {
      stderr += data.toString()
      console.warn(`⚠️ UG search stderr:`, data.toString().trim())
    })
    
    // Handle process completion
    searchProcess.on('close', (code) => {
      clearTimeout(timeoutId)
      
      if (processKilled) {
        return // Already handled by timeout
      }
      
      console.log(`🏁 UG search process closed with code: ${code}`)
      
      if (code === 0) {
        // Process completed successfully
        try {
          const parsedData = parseSearchOutput(stdout, query)
          resolve({
            success: true,
            data: parsedData,
            rawOutput: stdout,
            processCode: code
          })
        } catch (parseError) {
          reject(new Error(`Failed to parse UG search output: ${parseError.message}`))
        }
      } else {
        // Process failed
        const errorMessage = stderr || `Process exited with code ${code}`
        reject(new Error(`UG search failed: ${errorMessage}`))
      }
    })
    
    // Handle process errors
    searchProcess.on('error', (error) => {
      clearTimeout(timeoutId)
      if (!processKilled) {
        reject(new Error(`Failed to start UG search: ${error.message}`))
      }
    })
  })
}

/**
 * Build command line arguments for the UG scraper
 * Based on the Go tool's actual command structure
 * 
 * @param {number|string} tabId - Ultimate Guitar tab ID to fetch
 * @returns {string[]} Array of command line arguments
 */
const buildScraperArgs = (tabId) => {
  // Based on the Go tool's actual fetch command structure
  // The tool expects: ./ultimate-guitar-scraper fetch -id {tabId}
  
  return [
    'fetch',                         // Command: fetch song data
    '-id', tabId.toString()          // Tab ID to fetch
  ]
}

/**
 * Build command line arguments for the UG scraper's search command
 * Based on the Go tool's actual command structure
 * 
 * @param {string} query - Search query (e.g., "Hotel California Eagles")
 * @returns {string[]} Array of command line arguments
 */
const buildSearchArgs = (query) => {
  // Based on the Go tool's actual search command structure
  // The tool expects: ./ultimate-guitar-scraper search -query "Hotel California Eagles"
  
  return [
    'search',                        // Command: search songs
    '-query', query                  // Search query
  ]
}

/**
 * Parse the output from the UG scraper
 * Converts the raw output to structured song data
 * 
 * @param {string} output - Raw output from the Go tool
 * @param {number|string} tabId - Original tab ID requested
 * @returns {Object} Parsed song data in internal format
 */
const parseScraperOutput = (output, tabId) => {
  console.log(`🔍 Parsing UG scraper output for tab ID: ${tabId}`)
  console.log(`📄 Raw output length:`, output.length)
  
  try {
    // Try to parse as JSON first
    const jsonData = JSON.parse(output.trim())
    console.log(`✅ Successfully parsed JSON output`)
    
    // Transform UG format to internal format
    return transformUGDataToInternal(jsonData, tabId)
    
  } catch (jsonError) {
    console.warn(`⚠️ Failed to parse as JSON, trying text parsing:`, jsonError.message)
    
    // Fallback to text parsing if JSON fails
    return parseTextOutput(output, tabId)
  }
}

/**
 * Parse the output from the UG scraper's search command
 * Converts the raw output to structured search results
 * 
 * @param {string} output - Raw output from the Go tool
 * @param {string} query - Original search query
 * @returns {Object} Parsed search results in internal format
 */
const parseSearchOutput = (output, query) => {
  console.log(`🔍 Parsing UG search output for query: "${query}"`)
  console.log(`📄 Raw output length:`, output.length)
  
  try {
    // Try to parse as JSON first
    const jsonData = JSON.parse(output.trim())
    console.log(`✅ Successfully parsed JSON output`)
    
    // Transform UG format to internal format
    return transformUGSearchDataToInternal(jsonData, query)
    
  } catch (jsonError) {
    console.warn(`⚠️ Failed to parse as JSON, trying text parsing:`, jsonError.message)
    
    // Fallback to text parsing if JSON fails
    return parseTextSearchOutput(output, query)
  }
}

/**
 * Transform UG data format to internal song data format
 * 
 * @param {Object} ugData - Data from Ultimate Guitar
 * @param {number|string} tabId - Original tab ID
 * @returns {Object} Internal song data format
 */
const transformUGDataToInternal = (ugData, tabId) => {
  console.log(`🔄 Transforming UG data to internal song format`)
  
  // 🚧 PLACEHOLDER: This will be implemented in the next step
  // For now, return a basic structure that indicates transformation is needed
  
  return {
    tabId: tabId,
    type: 'song_data', // Will be determined from UG data
    source: 'ultimate_guitar',
    rawData: ugData,
    transformed: false, // Flag indicating this needs proper transformation
    note: 'Song data transformation not yet implemented'
  }
}

/**
 * Transform UG search data format to internal search results format
 * 
 * @param {Object} ugData - Data from Ultimate Guitar
 * @param {string} query - Original search query
 * @returns {Object} Internal search results format
 */
const transformUGSearchDataToInternal = (ugData, query) => {
  console.log(`🔄 Transforming UG search data to internal search results format`)
  
  // 🚧 PLACEHOLDER: This will be implemented in the next step
  // For now, return a basic structure that indicates transformation is needed
  
  return {
    query: query,
    type: 'search_results', // Will be determined from UG data
    source: 'ultimate_guitar',
    rawData: ugData,
    transformed: false, // Flag indicating this needs proper transformation
    note: 'Search results transformation not yet implemented'
  }
}

/**
 * Parse text output if JSON parsing fails
 * Fallback parsing method for song data
 * 
 * @param {string} output - Raw text output
 * @param {number|string} tabId - Original tab ID
 * @returns {Object} Basic song data structure
 */
const parseTextOutput = (output, tabId) => {
  console.log(`📝 Parsing text output as fallback for song data`)
  
  // Parse the text output to extract basic song information
  const lines = output.split('\n')
  let songInfo = {
    tabId: tabId,
    type: 'song_data',
    source: 'ultimate_guitar_text',
    rawOutput: output,
    parsed: true
  }
  
  // Extract song name and artist from the header
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
  
  // Extract timing markers (e.g., "1:34", "2:42")
  const timingMarkers = []
  const timingRegex = /(\d+:\d+)/g
  for (const line of lines) {
    const matches = line.match(timingRegex)
    if (matches) {
      timingMarkers.push(...matches)
    }
  }
  
  songInfo.timingMarkers = [...new Set(timingMarkers)].sort()
  songInfo.note = 'Basic text parsing completed - needs enhancement'
  
  return songInfo
}

/**
 * Parse text output if JSON parsing fails for search
 * Fallback parsing method for search results
 * 
 * @param {string} output - Raw text output
 * @param {string} query - Original search query
 * @returns {Object} Basic search results structure
 */
const parseTextSearchOutput = (output, query) => {
  console.log(`📝 Parsing text output as fallback for search results`)
  
  // Parse the text output to extract basic search information
  const lines = output.split('\n')
  let searchInfo = {
    query: query,
    type: 'search_results',
    source: 'ultimate_guitar_text',
    rawOutput: output,
    parsed: true
  }
  
  // Extract search results count
  for (const line of lines) {
    if (line.includes('Found')) {
      const match = line.match(/Found\s+(\d+)\s+results/)
      if (match) {
        searchInfo.totalResults = parseInt(match[1], 10)
      }
      break
    }
  }
  
  // Extract song names and artists from the results
  const results = []
  let currentResult = {}
  for (const line of lines) {
    if (line.includes('Song name:')) {
      if (Object.keys(currentResult).length > 0) {
        results.push(currentResult)
        currentResult = {}
      }
      const match = line.match(/Song name:\s*(.+?)\s+by\s+(.+)/)
      if (match) {
        currentResult.title = match[1].trim()
        currentResult.artist = match[2].trim()
      }
    }
  }
  if (Object.keys(currentResult).length > 0) {
    results.push(currentResult)
  }
  
  searchInfo.results = results
  searchInfo.note = 'Basic text parsing completed - needs enhancement'
  
  return searchInfo
}

/**
 * 🧪 Test function to verify the integration works
 * 
 * @param {number|string} tabId - Ultimate Guitar tab ID to test
 * @returns {Promise<Object>} Test results
 */
export const testUGScraperIntegration = async (tabId = 100) => {
  console.log(`🧪 Testing UG Scraper Integration for tab ID: ${tabId}`)
  
  try {
    const startTime = Date.now()
    const result = await callUGScraper(tabId, { timeout: 10000, retries: 1 })
    const endTime = Date.now()
    
    console.log('✅ Test successful:', {
      tabId,
      responseTime: `${endTime - startTime}ms`,
      hasData: !!result.data,
      processCode: result.processCode
    })
    
    return { success: true, result, responseTime: endTime - startTime }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * 🎯 Integration Status Check
 * Returns the current status of the UG scraper integration
 * 
 * @returns {Object} Integration status information
 */
export const getUGScraperStatus = () => {
  return {
    service: 'UG Scraper Integration',
    status: 'updated_for_song_data',
    executablePath: UG_SCRAPER_CONFIG.executablePath,
    executableExists: false, // Will be checked at runtime
    timeout: UG_SCRAPER_CONFIG.defaultTimeout,
    maxRetries: UG_SCRAPER_CONFIG.maxRetries,
    lastUpdated: new Date().toISOString(),
    nextStep: 'Test with real tab IDs to verify song data retrieval'
  }
}
