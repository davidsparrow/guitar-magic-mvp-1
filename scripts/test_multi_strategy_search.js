/**
 * 🚀 Test Multi-Strategy UG Search
 * 
 * Tests different search approaches to find which one gives clean data
 */

import { searchUGMultiStrategy } from '../utils/ugWebScraper.js'

console.log('🚀 Testing Multi-Strategy UG Search')
console.log('=' .repeat(60))

const testQuery = 'Hotel California Eagles'

console.log(`🎯 Testing query: "${testQuery}"`)
console.log('🔍 This will try 5 different search strategies...')
console.log('⏳ Each strategy gets 20 seconds timeout')
console.log('⏳ 2 second delay between strategies')
console.log('')

try {
  const startTime = Date.now()
  const results = await searchUGMultiStrategy(testQuery)
  const endTime = Date.now()
  
  console.log('\n🎉 Multi-strategy search complete!')
  console.log('=' .repeat(60))
  console.log(`⏱️ Total time: ${endTime - startTime}ms`)
  console.log(`✅ Success: ${results.success}`)
  console.log(`🏆 Best strategy: ${results.bestStrategy}`)
  console.log(`📊 Summary: ${results.summary}`)
  
  if (results.success) {
    console.log(`\n🎯 Best results from ${results.bestStrategy}:`)
    console.log(`📄 Total results: ${results.results.results.totalResults}`)
    console.log(`📄 Tab IDs found: ${results.results.results.results.length}`)
    
    // Show first few results
    if (results.results.results.results.length > 0) {
      console.log('\n📋 First few results:')
      results.results.results.results.slice(0, 3).forEach((result, index) => {
        console.log(`  ${index + 1}. Tab ID: ${result.tabId}`)
        console.log(`     URL: ${result.url}`)
        console.log(`     Song: ${result.extracted.songTitle}`)
        console.log(`     Artists: ${result.extracted.artists.join(', ')}`)
        console.log('')
      })
    }
  }
  
  console.log('\n📊 All strategies summary:')
  results.allStrategies.forEach(strategy => {
    const status = strategy.error ? '❌' : '✅'
    const tabCount = strategy.tabIdsFound || 0
    console.log(`  ${status} ${strategy.strategy}: ${tabCount} Tab IDs${strategy.error ? ` (${strategy.error})` : ''}`)
  })
  
} catch (error) {
  console.error('❌ Multi-strategy search failed:', error.message)
  console.error('Stack trace:', error.stack)
}

console.log('\n🎯 Next steps:')
console.log('If any strategy found Tab IDs, we can focus on that approach!')
console.log('If all failed, we may need to investigate the data corruption pattern.')
