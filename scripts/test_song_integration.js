/**
 * 🧪 Test Script for Ultimate Guitar Song Integration
 * 
 * Tests the updated UG scraper integration with real tab IDs
 * Focuses on guitar-focused songs as requested
 */

import { testUGScraperIntegration, getUGScraperStatus } from '../utils/ugScraperIntegration.js'

/**
 * Test with different tab IDs to find guitar-focused songs
 */
async function testSongIntegration() {
  console.log('🎸 Testing Ultimate Guitar Song Integration')
  console.log('==========================================')
  
  // Check integration status
  const status = getUGScraperStatus()
  console.log('📊 Integration Status:', status)
  console.log('')
  
  // Test with tab ID 100 (The Prophet by Yes - we saw this has guitar content)
  console.log('🧪 Test 1: Tab ID 100 (The Prophet by Yes)')
  console.log('Expected: Guitar-focused song with timing markers')
  console.log('---')
  
  try {
    const result1 = await testUGScraperIntegration(100)
    console.log('✅ Test 1 Result:', result1)
  } catch (error) {
    console.error('❌ Test 1 Failed:', error.message)
  }
  
  console.log('')
  
  // Test with tab ID 1 (Telepath Boy by Zeke - bass-focused, but good for comparison)
  console.log('🧪 Test 2: Tab ID 1 (Telepath Boy by Zeke)')
  console.log('Expected: Bass-focused song for comparison')
  console.log('---')
  
  try {
    const result2 = await testUGScraperIntegration(1)
    console.log('✅ Test 2 Result:', result2)
  } catch (error) {
    console.error('❌ Test 2 Failed:', error.message)
  }
  
  console.log('')
  
  // Test with a higher tab ID to see if we get different content
  console.log('🧪 Test 3: Tab ID 500 (Random higher ID)')
  console.log('Expected: Different song or error handling')
  console.log('---')
  
  try {
    const result3 = await testUGScraperIntegration(500)
    console.log('✅ Test 3 Result:', result3)
  } catch (error) {
    console.error('❌ Test 3 Failed:', error.message)
  }
  
  console.log('')
  console.log('🎯 Integration Test Complete!')
}

// Run the test
testSongIntegration().catch(console.error)
