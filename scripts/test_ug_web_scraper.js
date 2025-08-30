/**
 * 🧪 Test Script for UG Web Scraper
 * 
 * Tests the basic HTTP request functionality before implementing HTML parsing
 */

import { testUGWebScraper, getUGWebScraperStatus } from '../utils/ugWebScraper.js'

console.log('🧪 Testing UG Web Scraper - Basic HTTP Functionality')
console.log('=' .repeat(60))

// Test 1: Check scraper status
console.log('\n📊 Test 1: Scraper Status Check')
try {
  const status = getUGWebScraperStatus()
  console.log('✅ Status check successful:', status)
} catch (error) {
  console.error('❌ Status check failed:', error.message)
}

// Test 2: Test basic search functionality
console.log('\n🔍 Test 2: Basic Search Test')
console.log('Testing with query: "Hotel California Eagles"')
console.log('This will test HTTP requests, timeouts, and basic response handling...')

try {
  const testResults = await testUGWebScraper('Hotel California Eagles', { timeout: 45000, retries: 1 })
  
  if (testResults.success) {
    console.log('✅ Basic search test successful!')
    console.log('📊 Response time:', testResults.responseTime + 'ms')
    console.log('📄 HTML received:', testResults.results.rawHtml ? 'Yes' : 'No')
    console.log('📄 HTML length:', testResults.results.rawHtml?.length || 0, 'characters')
    
    // Show a preview of the HTML (first 200 chars)
    if (testResults.results.rawHtml) {
      console.log('\n📄 HTML Preview (first 200 chars):')
      console.log('─'.repeat(50))
      console.log(testResults.results.rawHtml.substring(0, 200) + '...')
      console.log('─'.repeat(50))
    }
    
  } else {
    console.error('❌ Basic search test failed:', testResults.error)
  }
  
} catch (error) {
  console.error('❌ Test execution failed:', error.message)
  console.error('Stack trace:', error.stack)
}

console.log('\n🎯 Test Summary:')
console.log('If you see HTML data above, the HTTP requests are working!')
console.log('If you see errors, we need to debug the request setup.')
console.log('Next step: Implement HTML parsing for the search results.')
