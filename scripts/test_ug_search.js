#!/usr/bin/env node

/**
 * 🧪 Test UG Search Functionality
 * 
 * Tests the new searchSongs function we added to ugScraperIntegration.js
 * 
 * Run with: node scripts/test_ug_search.js
 */

import { searchSongs } from '../utils/ugScraperIntegration.js'

console.log('🧪 Testing UG Search Functionality');
console.log('===================================\n');

async function testUGSearch() {
  try {
    console.log('🔍 Testing search for "Hotel California Eagles"...');
    
    // Test the search function
    const searchResults = await searchSongs('Hotel California Eagles', {
      timeout: 15000,  // 15 second timeout
      retries: 1        // Only 1 retry for testing
    });
    
    console.log('\n✅ Search successful!');
    console.log('📊 Results:', JSON.stringify(searchResults, null, 2));
    
    return searchResults;
    
  } catch (error) {
    console.error('\n❌ Search failed:', error.message);
    console.error('🔍 Error details:', error);
    
    // Don't be surprised if it doesn't work - some things only work from CLI
    console.log('\n💡 Note: This might fail if the Go scraper only works from CLI');
    console.log('   Check the error details above to see what went wrong');
    
    return null;
  }
}

// Run the test
testUGSearch().catch(console.error);
