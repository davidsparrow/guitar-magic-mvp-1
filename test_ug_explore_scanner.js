// Test script for UG Explore Page Scanner
import { testUGExploreScanner } from './utils/ugExplorePageScanner.js'

console.log('🧪 Starting UG Explore Page Scanner Test...')
console.log('=' .repeat(60))

// Test the scanner with the Pro tabs explore page
testUGExploreScanner()
  .then(results => {
    if (results.success) {
      console.log('\n🎉 TEST SUCCESSFUL!')
      console.log('=' .repeat(60))
      console.log(`📊 Total songs found: ${results.results.totalSongs}`)
      console.log(`⏱️  Response time: ${results.responseTime}ms`)
      
      if (results.results.songs && results.results.songs.length > 0) {
        console.log('\n📋 ALL EXTRACTED SONGS:')
        console.log('=' .repeat(60))
        
        results.results.songs.forEach((song, index) => {
          console.log(`${index + 1}. ${song.band} - ${song.songTitle}`)
          console.log(`   Tab ID: ${song.tabId}`)
          console.log(`   URL: ${song.fullUrl}`)
          console.log('')
        })
        
        console.log(`\n✅ Successfully extracted data for ${results.results.songs.length} songs!`)
      }
    } else {
      console.error('❌ TEST FAILED:', results.error)
    }
  })
  .catch(error => {
    console.error('💥 TEST CRASHED:', error.message)
    console.error('Stack trace:', error.stack)
  })
