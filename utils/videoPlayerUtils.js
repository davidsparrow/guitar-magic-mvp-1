/**
 * Video Player Management Utility Functions
 * Handles YouTube API loading, player initialization, and related functionality
 */

/**
 * Loads YouTube iframe API script with error handling and timeout protection
 * @param {Object} options - Configuration options
 * @param {Function} options.onLoad - Callback when script loads successfully
 * @param {Function} options.onError - Callback when script fails to load
 * @param {Function} options.onTimeout - Callback when script loading times out
 * @param {number} options.timeoutMs - Timeout in milliseconds (default: 10000)
 * @returns {Object} Object with cleanup function and loading state
 */
export const loadYouTubeIframeAPI = (options = {}) => {
  const {
    onLoad = () => {},
    onError = () => {},
    onTimeout = () => {},
    timeoutMs = 10000
  } = options

  // Check if API is already loaded
  if (window.YT) {
    onLoad()
    return { isLoaded: true, cleanup: () => {} }
  }

  // Create script tag
  const tag = document.createElement('script')
  tag.src = 'https://www.youtube.com/iframe_api'

  // Error handling
  tag.onerror = (error) => {
    console.error('❌ Failed to load YouTube iframe API:', error)
    console.error('❌ Error details:', { 
      error: error.message, 
      type: error.type,
      target: tag.src 
    })
    onError(error)
  }

  // Success handling
  tag.onload = () => {
    console.log('✅ YouTube iframe API loaded successfully')
    onLoad()
  }

  // Timeout protection
  const timeoutId = setTimeout(() => {
    if (!window.YT) {
      console.error('⏰ YouTube API script loading timeout - script may be hanging')
      onTimeout()
    }
  }, timeoutMs)

  // Insert script into DOM
  const firstScriptTag = document.getElementsByTagName('script')[0]
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

  // Cleanup function
  const cleanup = () => {
    clearTimeout(timeoutId)
    if (tag.parentNode) {
      tag.parentNode.removeChild(tag)
    }
  }

  return { isLoaded: false, cleanup }
}

/**
 * Initializes YouTube player with configuration
 * @param {Object} options - Player configuration options
 * @param {string} options.videoId - YouTube video ID
 * @param {string} options.containerId - DOM element ID for player
 * @param {Function} options.onReady - Callback when player is ready
 * @param {Function} options.onStateChange - Callback for player state changes
 * @param {Function} options.onError - Callback for player errors
 * @param {Object} options.playerVars - Additional player variables
 * @returns {Object|null} YouTube player instance or null if failed
 */
export const initializeYouTubePlayer = (options = {}) => {
  const {
    videoId,
    containerId = 'youtube-player',
    onReady = () => {},
    onStateChange = () => {},
    onError = () => {},
    playerVars = {}
  } = options

  // Validate required parameters
  if (!videoId) {
    console.error('❌ Video ID is required for player initialization')
    return null
  }

  if (!window.YT || !window.YT.Player) {
    console.error('❌ YouTube API not loaded. Call loadYouTubeIframeAPI first.')
    return null
  }

  try {
    // Default player variables
    const defaultPlayerVars = {
      controls: 1,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      fs: 0, // Disable YouTube's fullscreen button
      origin: window.location.origin,
      ...playerVars
    }

    // Create player instance
    const player = new window.YT.Player(containerId, {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: defaultPlayerVars,
      events: {
        onReady: (event) => {
          console.log('✅ YouTube player ready')
          onReady(event, player)
        },
        onStateChange: (event) => {
          onStateChange(event)
        },
        onError: (event) => {
          console.error('❌ YouTube player error:', event)
          onError(event)
        }
      }
    })

    console.log('🎬 YouTube player initialization started')
    return player

  } catch (error) {
    console.error('❌ Error initializing YouTube player:', error)
    onError(error)
    return null
  }
}

/**
 * Sets up YouTube API ready callback for delayed initialization
 * @param {Function} callback - Function to call when API is ready
 */
export const setupYouTubeAPIReadyCallback = (callback) => {
  if (window.YT && window.YT.Player) {
    // API already loaded, call immediately
    callback()
  } else {
    // Set up callback for when API loads
    window.onYouTubeIframeAPIReady = () => {
      console.log('🎯 YouTube API ready callback triggered')
      callback()
    }
  }
}

/**
 * Handles YouTube player state changes with session saving logic
 * @param {Object} event - YouTube player state change event
 * @param {Object} options - Handler options
 * @param {Function} options.onPause - Callback when video is paused
 * @param {Function} options.onPlay - Callback when video starts playing
 * @param {Function} options.onBuffer - Callback when video is buffering
 * @param {Function} options.onCued - Callback when video is cued
 */
export const handlePlayerStateChange = (event, options = {}) => {
  const {
    onPause = () => {},
    onPlay = () => {},
    onBuffer = () => {},
    onCued = () => {}
  } = options

  // YouTube player states:
  // -1: UNSTARTED, 0: ENDED, 1: PLAYING, 2: PAUSED, 3: BUFFERING, 5: CUED
  
  if (event.data === 1) { // PLAYING
    onPlay(event)
  } else if (event.data === 2) { // PAUSED
    onPause(event)
  } else if (event.data === 3) { // BUFFERING
    onBuffer(event)
  } else if (event.data === 5) { // CUED
    onCued(event)
  }
}

/**
 * Handles YouTube API loading errors
 * @param {Function} onError - Callback for error handling
 */
export const handleYouTubeAPIError = (onError = () => {}) => {
  console.error('❌ YouTube API failed to load')
  onError()
}

/**
 * Checks if YouTube player is fully ready with all methods available
 * @param {Object} player - YouTube player instance
 * @returns {boolean} True if player is ready and all methods are available
 */
export const isPlayerReady = (player) => {
  if (!player) return false
  
  const result = player.getPlayerState && 
         typeof player.getPlayerState === 'function' &&
         player.playVideo && 
         typeof player.playVideo === 'function' &&
         player.pauseVideo && 
         typeof player.pauseVideo === 'function'
  
  return result
}
