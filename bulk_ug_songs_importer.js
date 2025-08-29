// Bulk Ultimate Guitar Songs Importer
// Connects to Supabase and imports songs from all HTML files in the ug-pages folder

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * Supabase client configuration
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Extract song data from a single HTML file
 * @param {string} htmlFilePath - Path to the HTML file
 * @returns {Array} Array of extracted song objects
 */
function extractSongsFromHTML(htmlFilePath) {
  try {
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
    
    // Find the js-store div with song data
    const jsStoreMatch = htmlContent.match(/<div class="js-store" data-content="(.+?)"><\/div>/);
    
    if (!jsStoreMatch) {
      console.log(`⚠️  No js-store data found in ${path.basename(htmlFilePath)}`);
      return [];
    }
    
    // Parse the JSON content from the js-store div
    const jsonContent = jsStoreMatch[1].replace(/&quot;/g, '"').replace(/&#039;/g, "'");
    const pageData = JSON.parse(jsonContent);
    
    // Extract songs from the store data
    const songs = pageData.store?.page?.data?.data?.tabs || [];
    
    if (!songs || songs.length === 0) {
      console.log(`⚠️  No songs found in ${path.basename(htmlFilePath)}`);
      return [];
    }
    
    // Format the songs data for database insertion
    const formattedSongs = songs.map(song => ({
      title: song.song_name,
      artist: song.artist_name,
      ug_tab_id: song.id,
      ug_url: song.tab_url,
      key_signature: song.tonality_name || null,
      difficulty: song.difficulty || 'unknown',
      ug_rating: song.rating || null,
      ug_votes: song.votes || 0,
      genre: 'rock', // Default genre since UG doesn't provide this
      instrument_type: 'guitar',
      tuning: 'E A D G B E', // Default standard tuning
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    return formattedSongs;
    
  } catch (error) {
    console.error(`❌ Error processing ${htmlFilePath}:`, error.message);
    return [];
  }
}

/**
 * Check if songs already exist in the database
 * @param {Array} songs - Array of song objects to check
 * @returns {Array} Array of songs that don't exist yet
 */
async function filterExistingSongs(songs) {
  try {
    const newSongs = [];
    
    for (const song of songs) {
      // Check by title + artist combination
      const { data, error } = await supabase
        .from('songs')
        .select('id, ug_tab_id')
        .eq('title', song.title)
        .eq('artist', song.artist)
        .limit(1);
      
      if (error) {
        console.error(`❌ Error checking existing song: ${error.message}`);
        continue;
      }
      
      if (!data || data.length === 0) {
        newSongs.push(song);
      } else {
        // Check if this specific tab ID already exists
        const existingSong = data[0];
        if (existingSong.ug_tab_id !== song.ug_tab_id) {
          // Different tab ID for same song, we can add this as a variation
          newSongs.push(song);
        }
      }
    }
    
    return newSongs;
    
  } catch (error) {
    console.error('❌ Error filtering existing songs:', error.message);
    return songs; // Return all songs if filtering fails
  }
}

/**
 * Insert songs into Supabase database
 * @param {Array} songs - Array of song objects to insert
 * @returns {Object} Result of the insertion operation
 */
async function insertSongsToSupabase(songs) {
  try {
    if (songs.length === 0) {
      return { success: true, inserted: 0, errors: [], skipped: 0 };
    }
    
    // Filter out songs that already exist
    const newSongs = await filterExistingSongs(songs);
    
    if (newSongs.length === 0) {
      console.log(`   ℹ️  All ${songs.length} songs already exist in database`);
      return { success: true, inserted: 0, errors: [], skipped: songs.length };
    }
    
    console.log(`   📝 Inserting ${newSongs.length} new songs (${songs.length - newSongs.length} already exist)`);
    
    // Insert songs one by one to handle individual errors
    let insertedCount = 0;
    let errorCount = 0;
    
    for (const song of newSongs) {
      try {
        const { data, error } = await supabase
          .from('songs')
          .insert([song]);
        
        if (error) {
          console.error(`   ❌ Failed to insert "${song.title}" by ${song.artist}: ${error.message}`);
          errorCount++;
        } else {
          insertedCount++;
        }
        
        // Small delay between insertions
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (insertError) {
        console.error(`   ❌ Unexpected error inserting "${song.title}" by ${song.artist}: ${insertError.message}`);
        errorCount++;
      }
    }
    
    if (errorCount > 0) {
      return { 
        success: false, 
        inserted: insertedCount, 
        errors: [`${errorCount} songs failed to insert`], 
        skipped: songs.length - newSongs.length 
      };
    }
    
    return { 
      success: true, 
      inserted: insertedCount, 
      errors: [], 
      skipped: songs.length - newSongs.length 
    };
    
  } catch (error) {
    console.error('❌ Unexpected error during insertion:', error);
    return { success: false, inserted: 0, errors: [error.message], skipped: 0 };
  }
}

/**
 * Get all HTML files from the ug-pages folder
 * @returns {Array} Array of HTML file paths
 */
function getHTMLFiles() {
  const ugPagesDir = './docs/ug-pages';
  
  if (!fs.existsSync(ugPagesDir)) {
    console.error(`❌ Directory not found: ${ugPagesDir}`);
    return [];
  }
  
  const files = fs.readdirSync(ugPagesDir);
  const htmlFiles = files
    .filter(file => file.endsWith('.html'))
    .map(file => path.join(ugPagesDir, file));
  
  return htmlFiles;
}

/**
 * Main function to process all HTML files and import songs
 */
async function main() {
  console.log('🎸 Bulk Ultimate Guitar Songs Importer');
  console.log('=' .repeat(60));
  
  // Get all HTML files
  const htmlFiles = getHTMLFiles();
  
  if (htmlFiles.length === 0) {
    console.log('❌ No HTML files found in docs/ug-pages/ folder');
    return;
  }
  
  console.log(`📁 Found ${htmlFiles.length} HTML files to process`);
  console.log('🔗 Connecting to Supabase...');
  
  // Test Supabase connection
  try {
    const { data, error } = await supabase.from('songs').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Successfully connected to Supabase');
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error.message);
    return;
  }
  
  let totalSongsProcessed = 0;
  let totalSongsInserted = 0;
  let totalSongsSkipped = 0;
  let totalErrors = 0;
  
  // Process each HTML file
  for (let i = 0; i < htmlFiles.length; i++) {
    const htmlFile = htmlFiles[i];
    const fileName = path.basename(htmlFile);
    
    console.log(`\n📄 Processing file ${i + 1}/${htmlFiles.length}: ${fileName}`);
    
    // Extract songs from HTML
    const songs = extractSongsFromHTML(htmlFile);
    
    if (songs.length === 0) {
      console.log(`   ⚠️  No songs extracted from ${fileName}`);
      continue;
    }
    
    console.log(`   🎵 Extracted ${songs.length} songs`);
    totalSongsProcessed += songs.length;
    
    // Insert songs into Supabase
    const result = await insertSongsToSupabase(songs);
    
    if (result.success) {
      console.log(`   ✅ Successfully inserted ${result.inserted} songs`);
      totalSongsInserted += result.inserted;
      totalSongsSkipped += result.skipped || 0;
    } else {
      console.log(`   ❌ Failed to insert songs: ${result.errors.join(', ')}`);
      totalErrors += songs.length;
    }
    
    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 IMPORT SUMMARY:');
  console.log(`   📁 Files processed: ${htmlFiles.length}`);
  console.log(`   🎵 Total songs extracted: ${totalSongsProcessed}`);
  console.log(`   ✅ Songs successfully inserted: ${totalSongsInserted}`);
  console.log(`   ⏭️  Songs skipped (already exist): ${totalSongsSkipped}`);
  console.log(`   ❌ Songs with errors: ${totalErrors}`);
  console.log('=' .repeat(60));
  
  if (totalErrors === 0) {
    console.log('🎉 All songs processed successfully!');
  } else {
    console.log('⚠️  Some songs had errors during import. Check the logs above.');
  }
}

// Run the importer
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
