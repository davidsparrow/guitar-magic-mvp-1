/**
 * 🎸 Chord Library Generation Configuration
 * Centralized configuration for AWS S3 chord library generation
 */

module.exports = {
  // AWS Configuration
  aws: {
    region: 'us-west-2', // US West (Oregon) - close to PST
    bucketName: 'guitarmagic-chords',
    accessKeyId: '553653220095',
    secretAccessKey: 'p:@Maz!234',
  },

  // Chord Generation Settings
  generation: {
    themes: ['light', 'dark'],
    svgQuality: 'high',
    canvasSize: {
      width: 160,
      height: 140
    }
  },

  // Chord Library Scope
  chords: {
    // Phase 1: Basic Chords (Start with these)
    basic: [
      // Major Chords
      'C', 'D', 'E', 'F', 'G', 'A', 'B',
      // Minor Chords  
      'Am', 'Dm', 'Em', 'Fm', 'Gm', 'Bm',
      // 7th Chords
      'C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7',
      // Major 7th Chords
      'Cmaj7', 'Dmaj7', 'Emaj7', 'Fmaj7', 'Gmaj7', 'Amaj7', 'Bmaj7',
      // Minor 7th Chords
      'Am7', 'Dm7', 'Em7', 'Fm7', 'Gm7', 'Bm7'
    ],
    
    // Future Expansion (Phase 2+)
    extended: [
      // Barre chords, suspended chords, power chords, etc.
    ]
  },

  // S3 URL Structure
  urls: {
    base: 'https://guitarmagic-chords.s3.us-west-2.amazonaws.com',
    pattern: '/chords/{theme}/{chordName}.svg'
  },

  // File Naming Convention
  naming: {
    format: '{chordName}-{theme}.svg',
    examples: {
      light: 'C-light.svg',
      dark: 'Am-dark.svg'
    }
  }
}
