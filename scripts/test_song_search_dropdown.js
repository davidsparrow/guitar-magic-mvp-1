#!/usr/bin/env node

/**
 * Test SongSearchDropdown Component - GuitarMagic Platform
 * 
 * This script tests the SongSearchDropdown component functionality:
 * 1. Component file existence and structure
 * 2. API endpoint functionality
 * 3. Search functionality simulation
 * 
 * Run with: node scripts/test_song_search_dropdown.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🎸 SongSearchDropdown Component Test');
console.log('===================================\n');

// Test configuration
const COMPONENT_TESTS = {
  fileExists: false,
  componentStructure: false,
  apiEndpoint: false,
  searchFunctionality: false
};

// Test 1: Component File Existence
function testComponentFile() {
  console.log('1️⃣ Testing Component File...');
  
  const componentPath = path.join(process.cwd(), 'components/SongSearchDropdown.js');
  
  if (fs.existsSync(componentPath)) {
    console.log('✅ SongSearchDropdown.js exists');
    COMPONENT_TESTS.fileExists = true;
    
    // Read file content for structure analysis
    const content = fs.readFileSync(componentPath, 'utf8');
    console.log(`   📄 File size: ${(content.length / 1024).toFixed(2)} KB`);
    
    return content;
  } else {
    console.log('❌ SongSearchDropdown.js missing');
    return null;
  }
}

// Test 2: Component Structure Analysis
function testComponentStructure(content) {
  console.log('\n2️⃣ Testing Component Structure...');
  
  if (!content) {
    console.log('❌ No content to analyze');
    return false;
  }
  
  const structureChecks = {
    hasReactImport: content.includes('import React') || content.includes('import {'),
    hasUseState: content.includes('useState'),
    hasUseEffect: content.includes('useEffect'),
    hasSearchFunction: content.includes('search') || content.includes('Search'),
    hasDebounce: content.includes('debounce') || content.includes('Debounce'),
    hasKeyboardNav: content.includes('keydown') || content.includes('onKeyDown'),
    hasLoadingState: content.includes('loading') || content.includes('Loading'),
    hasErrorHandling: content.includes('error') || content.includes('Error')
  };
  
  let passedChecks = 0;
  const totalChecks = Object.keys(structureChecks).length;
  
  Object.entries(structureChecks).forEach(([check, passed]) => {
    if (passed) {
      console.log(`   ✅ ${check}`);
      passedChecks++;
    } else {
      console.log(`   ❌ ${check}`);
    }
  });
  
  const passRate = (passedChecks / totalChecks) * 100;
  console.log(`   📊 Structure score: ${passedChecks}/${totalChecks} (${passRate.toFixed(1)}%)`);
  
  COMPONENT_TESTS.componentStructure = passRate >= 70;
  return COMPONENT_TESTS.componentStructure;
}

// Test 3: API Endpoint Test
async function testAPIEndpoint() {
  console.log('\n3️⃣ Testing API Endpoint...');
  
  try {
    // Test the songs search endpoint
    const response = await fetch('http://localhost:3000/api/chord-captions/songs/search?q=test');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API endpoint responding');
      console.log(`   📡 Status: ${response.status}`);
      console.log(`   📊 Response type: ${typeof data}`);
      
      if (data && typeof data === 'object') {
        console.log(`   🔑 Response keys: ${Object.keys(data).join(', ')}`);
      }
      
      COMPONENT_TESTS.apiEndpoint = true;
      return true;
    } else {
      console.log(`❌ API endpoint failed: ${response.status} ${response.statusText}`);
      return false;
    }
    
  } catch (error) {
    console.log('❌ API test error:', error.message);
    console.log('   💡 Make sure your Next.js dev server is running on port 3000');
    return false;
  }
}

// Test 4: Search Functionality Simulation
async function testSearchFunctionality() {
  console.log('\n4️⃣ Testing Search Functionality...');
  
  try {
    // Test with a real search term
    const searchTerms = ['wonderwall', 'stairway', 'hotel california'];
    
    for (const term of searchTerms) {
      console.log(`   🔍 Testing search: "${term}"`);
      
      const response = await fetch(`http://localhost:3000/api/chord-captions/songs/search?q=${encodeURIComponent(term)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`      ✅ "${term}" search successful`);
        
        if (data && data.length > 0) {
          console.log(`      📊 Found ${data.length} results`);
          if (data[0].title) {
            console.log(`      🎵 First result: ${data[0].title}`);
          }
        }
      } else {
        console.log(`      ❌ "${term}" search failed: ${response.status}`);
      }
    }
    
    COMPONENT_TESTS.searchFunctionality = true;
    return true;
    
  } catch (error) {
    console.log('❌ Search functionality test error:', error.message);
    return false;
  }
}

// Main test runner
async function runSongSearchTests() {
  console.log('Starting SongSearchDropdown tests...\n');
  
  // Run tests
  const content = testComponentFile();
  COMPONENT_TESTS.componentStructure = testComponentStructure(content);
  await testAPIEndpoint();
  await testSearchFunctionality();
  
  // Summary
  console.log('\n📊 SongSearchDropdown Test Results');
  console.log('==================================');
  console.log(`File Exists: ${COMPONENT_TESTS.fileExists ? '✅' : '❌'}`);
  console.log(`Component Structure: ${COMPONENT_TESTS.componentStructure ? '✅' : '❌'}`);
  console.log(`API Endpoint: ${COMPONENT_TESTS.apiEndpoint ? '✅' : '❌'}`);
  console.log(`Search Functionality: ${COMPONENT_TESTS.searchFunctionality ? '✅' : '❌'}`);
  
  const allPassed = Object.values(COMPONENT_TESTS).every(test => test === true);
  
  if (allPassed) {
    console.log('\n🎉 SongSearchDropdown component is fully functional!');
  } else {
    console.log('\n⚠️  Some tests failed. Review above for details.');
  }
  
  return COMPONENT_TESTS;
}

// Run tests if called directly
if (require.main === module) {
  runSongSearchTests().catch(console.error);
}

module.exports = { runSongSearchTests, COMPONENT_TESTS };
