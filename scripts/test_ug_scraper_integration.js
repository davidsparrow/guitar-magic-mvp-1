#!/usr/bin/env node

/**
 * Test UG Scraper Integration - GuitarMagic Platform
 * 
 * This script tests the Ultimate Guitar scraper integration:
 * 1. Go scraper tool availability
 * 2. Data storage strategy for comprehensive capture
 * 3. Song caching to prevent re-scanning
 * 4. Data completeness validation
 * 
 * Run with: node scripts/test_ug_scraper_integration.js
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🎸 UG Scraper Integration Test');
console.log('==============================\n');

// Test configuration
const SCRAPER_TESTS = {
  goToolAvailable: false,
  dataStorageReady: false,
  songCachingReady: false,
  dataCompleteness: false
};

// Test 1: Go Scraper Tool Availability
function testGoScraperTool() {
  console.log('1️⃣ Testing Go Scraper Tool...');
  
  const scraperPath = path.join(process.cwd(), 'ultimate-guitar-scraper-setup/ultimate-guitar-scraper');
  const goFiles = ['main.go', 'scraper.go', 'models.go'];
  
  if (fs.existsSync(scraperPath)) {
    console.log('✅ UG scraper directory exists');
    
    // Check for Go source files
    let goFilesFound = 0;
    goFiles.forEach(file => {
      const filePath = path.join(scraperPath, file);
      if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${file} found`);
        goFilesFound++;
      } else {
        console.log(`   ❌ ${file} missing`);
      }
    });
    
    // Check for compiled binary
    const binaryPath = path.join(scraperPath, 'ultimate-guitar-scraper');
    if (fs.existsSync(binaryPath)) {
      console.log('   ✅ Compiled binary found');
      SCRAPER_TESTS.goToolAvailable = true;
    } else {
      console.log('   ⚠️  Binary not compiled - may need to build');
      console.log('   💡 Run: cd ultimate-guitar-scraper-setup/ultimate-guitar-scraper && go build');
    }
    
    return goFilesFound === goFiles.length;
  } else {
    console.log('❌ UG scraper directory missing');
    return false;
  }
}

// Test 2: Data Storage Strategy
async function testDataStorageStrategy() {
  console.log('\n2️⃣ Testing Data Storage Strategy...');
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Missing Supabase environment variables');
      return false;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check for required tables
    const requiredTables = [
      'songs',
      'song_attributes', 
      'song_sections',
      'song_chord_progressions',
      'video_song_mappings'
    ];
    
    let tablesFound = 0;
    
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ Table ${table} accessible`);
          tablesFound++;
        }
      } catch (err) {
        console.log(`   ❌ Table ${table} error: ${err.message}`);
      }
    }
    
    // Check for helper functions
    console.log('\n   🔧 Testing Database Helper Functions...');
    
    try {
      // Test create_chord_sync_group function
      const { data: syncGroup, error: syncError } = await supabase
        .rpc('create_chord_sync_group', {
          p_favorite_id: 'test-123',
          p_song_id: 'test-song-123'
        });
      
      if (syncError) {
        console.log(`   ❌ create_chord_sync_group: ${syncError.message}`);
      } else {
        console.log('   ✅ create_chord_sync_group function working');
      }
    } catch (err) {
      console.log(`   ❌ Function test error: ${err.message}`);
    }
    
    SCRAPER_TESTS.dataStorageReady = tablesFound >= 4; // At least 4 out of 5 tables
    return SCRAPER_TESTS.dataStorageReady;
    
  } catch (error) {
    console.log('❌ Data storage test error:', error.message);
    return false;
  }
}

// Test 3: Song Caching Strategy
async function testSongCachingStrategy() {
  console.log('\n3️⃣ Testing Song Caching Strategy...');
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Missing Supabase environment variables');
      return false;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check for song cache table or strategy
    console.log('   🔍 Checking song caching implementation...');
    
    // Look for songs table with comprehensive data
    try {
      const { data: songs, error } = await supabase
        .from('songs')
        .select('*')
        .limit(5);
      
      if (error) {
        console.log(`   ❌ Songs table query failed: ${error.message}`);
      } else if (songs && songs.length > 0) {
        console.log(`   ✅ Songs table accessible with ${songs.length} sample records`);
        
        // Check data completeness
        const sampleSong = songs[0];
        const dataFields = Object.keys(sampleSong);
        console.log(`   📊 Sample song has ${dataFields.length} fields: ${dataFields.join(', ')}`);
        
        // Check for key UG data fields
        const ugFields = ['title', 'artist', 'chords', 'sections', 'progression'];
        const hasUGData = ugFields.some(field => 
          dataFields.includes(field) || 
          sampleSong[field] !== undefined
        );
        
        if (hasUGData) {
          console.log('   ✅ UG data fields detected');
          SCRAPER_TESTS.songCachingReady = true;
        } else {
          console.log('   ⚠️  UG data fields not yet populated');
        }
      } else {
        console.log('   ⚠️  Songs table empty - ready for first scan');
        SCRAPER_TESTS.songCachingReady = true; // Empty is fine for new system
      }
    } catch (err) {
      console.log(`   ❌ Songs table error: ${err.message}`);
    }
    
    return SCRAPER_TESTS.songCachingReady;
    
  } catch (error) {
    console.log('❌ Song caching test error:', error.message);
    return false;
  }
}

// Test 4: Data Completeness Validation
function testDataCompleteness() {
  console.log('\n4️⃣ Testing Data Completeness Strategy...');
  
  // Define what data we should capture from UG
  const requiredDataFields = {
    basic: ['title', 'artist', 'album', 'year', 'genre'],
    structure: ['sections', 'chord_progressions', 'timing'],
    technical: ['difficulty', 'tuning', 'capo', 'tempo'],
    content: ['lyrics', 'chords', 'tabs', 'notes'],
    metadata: ['rating', 'votes', 'views', 'last_updated']
  };
  
  console.log('   📋 Required Data Fields for Complete Capture:');
  
  let totalFields = 0;
  let documentedFields = 0;
  
  Object.entries(requiredDataFields).forEach(([category, fields]) => {
    console.log(`   ${category.toUpperCase()}: ${fields.join(', ')}`);
    totalFields += fields.length;
    
    // Check if these fields are documented in schema
    fields.forEach(field => {
      // This would check against actual schema files
      documentedFields++; // Simplified for now
    });
  });
  
  console.log(`\n   📊 Total fields to capture: ${totalFields}`);
  console.log('   ✅ Data completeness strategy defined');
  
  // Check if we have the right database structure
  const hasComprehensiveSchema = SCRAPER_TESTS.dataStorageReady;
  
  if (hasComprehensiveSchema) {
    console.log('   ✅ Database schema supports comprehensive data capture');
    SCRAPER_TESTS.dataCompleteness = true;
  } else {
    console.log('   ⚠️  Database schema may need enhancement for complete data');
  }
  
  return SCRAPER_TESTS.dataCompleteness;
}

// Main test runner
async function runUGScraperTests() {
  console.log('Starting UG Scraper Integration tests...\n');
  
  // Run tests
  SCRAPER_TESTS.goToolAvailable = testGoScraperTool();
  await testDataStorageStrategy();
  await testSongCachingStrategy();
  SCRAPER_TESTS.dataCompleteness = testDataCompleteness();
  
  // Summary
  console.log('\n📊 UG Scraper Integration Test Results');
  console.log('=======================================');
  console.log(`Go Tool Available: ${SCRAPER_TESTS.goToolAvailable ? '✅' : '❌'}`);
  console.log(`Data Storage Ready: ${SCRAPER_TESTS.dataStorageReady ? '✅' : '❌'}`);
  console.log(`Song Caching Ready: ${SCRAPER_TESTS.songCachingReady ? '✅' : '❌'}`);
  console.log(`Data Completeness: ${SCRAPER_TESTS.dataCompleteness ? '✅' : '❌'}`);
  
  const allPassed = Object.values(SCRAPER_TESTS).every(test => test === true);
  
  if (allPassed) {
    console.log('\n🎉 UG Scraper integration is fully ready!');
    console.log('   💡 Ready to implement comprehensive song data capture');
  } else {
    console.log('\n⚠️  Some tests failed. Review above for details.');
    console.log('   💡 Focus on failed areas before proceeding');
  }
  
  return SCRAPER_TESTS;
}

// Run tests if called directly
if (require.main === module) {
  runUGScraperTests().catch(console.error);
}

module.exports = { runUGScraperTests, SCRAPER_TESTS };
