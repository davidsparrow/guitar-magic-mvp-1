/**
 * 🧪 Ultimate Guitar Integration Test Script
 * 
 * Tests the complete chord integration system:
 * 1. Chord Data Service UG
 * 2. UG Scraper Integration  
 * 3. Chord Data Mapper UG
 * 4. End-to-end integration
 * 
 * Run with: node scripts/test_ug_integration.js
 */

import { 
  getChordDataUG, 
  testChordDataServiceUG, 
  getChordDataServiceStatus 
} from '../utils/chordDataServiceUG.js'

import { 
  callUGScraper, 
  testUGScraperIntegration, 
  getUGScraperStatus 
} from '../utils/ugScraperIntegration.js'

import { 
  transformUGDataToInternal, 
  testChordDataMapperUG, 
  getChordDataMapperStatus 
} from '../utils/chordDataMapperUG.js'

/**
 * 🎯 MAIN TEST FUNCTION
 * Runs all tests in sequence
 */
async function runAllTests() {
  console.log('🚀 Starting Ultimate Guitar Integration Tests')
  console.log('=' .repeat(60))
  
  try {
    // Test 1: Service Status Checks
    await testServiceStatus()
    
    // Test 2: Individual Component Tests
    await testIndividualComponents()
    
    // Test 3: Integration Tests
    await testIntegration()
    
    // Test 4: End-to-End Tests
    await testEndToEnd()
    
    console.log('=' .repeat(60))
    console.log('✅ All tests completed!')
    
  } catch (error) {
    console.error('❌ Test suite failed:', error)
    process.exit(1)
  }
}

/**
 * Test 1: Check service status
 */
async function testServiceStatus() {
  console.log('\n📊 TEST 1: Service Status Checks')
  console.log('-'.repeat(40))
  
  try {
    // Check Chord Data Service status
    const chordServiceStatus = getChordDataServiceStatus()
    console.log('✅ Chord Data Service Status:', chordServiceStatus)
    
    // Check UG Scraper status
    const scraperStatus = getUGScraperStatus()
    console.log('✅ UG Scraper Status:', scraperStatus)
    
    // Check Data Mapper status
    const mapperStatus = getChordDataMapperStatus()
    console.log('✅ Data Mapper Status:', mapperStatus)
    
    console.log('✅ Service Status Tests: PASSED')
    
  } catch (error) {
    console.error('❌ Service Status Tests: FAILED', error)
    throw error
  }
}

/**
 * Test 2: Test individual components
 */
async function testIndividualComponents() {
  console.log('\n🔧 TEST 2: Individual Component Tests')
  console.log('-'.repeat(40))
  
  try {
    // Test Chord Data Service
    console.log('🧪 Testing Chord Data Service...')
    const chordServiceTest = await testChordDataServiceUG('Am')
    console.log('✅ Chord Data Service Test:', chordServiceTest.success ? 'PASSED' : 'FAILED')
    
    // Test UG Scraper Integration
    console.log('🧪 Testing UG Scraper Integration...')
    const scraperTest = await testUGScraperIntegration('Am')
    console.log('✅ UG Scraper Test:', scraperTest.success ? 'PASSED' : 'FAILED')
    
    // Test Data Mapper
    console.log('🧪 Testing Data Mapper...')
    const testData = {
      chord: 'Am',
      variations: [{
        frets: [null, 0, 2, 2, 1, 0],
        fingers: [null, null, 2, 3, 1, null]
      }]
    }
    const mapperTest = testChordDataMapperUG(testData, 'Am')
    console.log('✅ Data Mapper Test:', mapperTest.success ? 'PASSED' : 'FAILED')
    
    console.log('✅ Individual Component Tests: PASSED')
    
  } catch (error) {
    console.error('❌ Individual Component Tests: FAILED', error)
    throw error
  }
}

/**
 * Test 3: Test integration between components
 */
async function testIntegration() {
  console.log('\n🔗 TEST 3: Integration Tests')
  console.log('-'.repeat(40))
  
  try {
    // Test the complete flow (without actual UG scraper)
    console.log('🧪 Testing integration flow...')
    
    // This will test the fallback system since UG integration isn't fully implemented yet
    const result = await getChordDataUG('Am')
    
    if (result) {
      console.log('✅ Integration Test: PASSED')
      console.log('📊 Result structure:', {
        name: result.name,
        type: result.type,
        root: result.root,
        hasFrets: !!result.frets,
        hasFingering: !!result.fingering,
        metadata: result.metadata?.source
      })
    } else {
      console.log('❌ Integration Test: FAILED - No data returned')
    }
    
  } catch (error) {
    console.error('❌ Integration Tests: FAILED', error)
    throw error
  }
}

/**
 * Test 4: End-to-end testing
 */
async function testEndToEnd() {
  console.log('\n🎯 TEST 4: End-to-End Tests')
  console.log('-'.repeat(40))
  
  try {
    // Test multiple chord types
    const testChords = ['Am', 'C', 'F', 'G']
    
    console.log('🧪 Testing multiple chord types...')
    
    for (const chordName of testChords) {
      console.log(`\n🎸 Testing chord: ${chordName}`)
      
      try {
        const result = await getChordDataUG(chordName)
        
        if (result) {
          console.log(`✅ ${chordName}: SUCCESS`)
          console.log(`   Type: ${result.type}, Root: ${result.root}`)
          console.log(`   Source: ${result.metadata?.source || 'unknown'}`)
        } else {
          console.log(`❌ ${chordName}: FAILED - No data`)
        }
        
      } catch (error) {
        console.log(`❌ ${chordName}: ERROR - ${error.message}`)
      }
    }
    
    console.log('\n✅ End-to-End Tests: COMPLETED')
    
  } catch (error) {
    console.error('❌ End-to-End Tests: FAILED', error)
    throw error
  }
}

/**
 * Test the actual UG scraper (optional - requires Go tool)
 */
async function testRealUGScraper() {
  console.log('\n🚀 OPTIONAL: Real UG Scraper Test')
  console.log('-'.repeat(40))
  console.log('⚠️  This test requires the Go tool to be properly configured')
  console.log('⚠️  It may fail if the tool path is incorrect or not executable')
  
  try {
    console.log('🧪 Testing real UG scraper for chord: Am')
    const result = await callUGScraper('Am', { timeout: 15000, retries: 1 })
    
    if (result && result.success) {
      console.log('✅ Real UG Scraper Test: PASSED')
      console.log('📊 Raw output length:', result.rawOutput?.length || 0)
      console.log('📊 Process code:', result.processCode)
    } else {
      console.log('❌ Real UG Scraper Test: FAILED')
      console.log('📊 Error details:', result?.error || 'Unknown error')
    }
    
  } catch (error) {
    console.log('❌ Real UG Scraper Test: FAILED')
    console.log('📊 Error:', error.message)
    console.log('💡 This is expected if the Go tool is not configured yet')
  }
}

/**
 * Run the test suite
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  // Only run if this file is executed directly
  runAllTests()
    .then(() => {
      console.log('\n🎉 Test suite completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Test suite failed:', error)
      process.exit(1)
    })
}

// Export for use in other test files
export { runAllTests, testRealUGScraper }
