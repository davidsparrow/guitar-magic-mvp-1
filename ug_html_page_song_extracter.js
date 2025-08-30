// Extract Ultimate Guitar Songs from HTML File
// This script parses the HTML file and extracts song data in JSON format

import fs from 'fs';

/**
 * Extract song data from Ultimate Guitar HTML file
 * @param {string} htmlFilePath - Path to the HTML file
 * @returns {Object} JSON blob with extracted song data
 */
function extractUGSongs(htmlFilePath) {
  try {
    // Read the HTML file
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
    
    // Find the js-store div with song data
    const jsStoreMatch = htmlContent.match(/<div class="js-store" data-content="(.+?)"><\/div>/);
    
    if (!jsStoreMatch) {
      throw new Error('Could not find js-store div with song data');
    }
    
    // Parse the JSON content from the js-store div
    const jsonContent = jsStoreMatch[1].replace(/&quot;/g, '"').replace(/&#039;/g, "'");
    const pageData = JSON.parse(jsonContent);
    
    // Extract songs from the store data
    const songs = pageData.store?.page?.data?.data?.tabs || [];
    
    if (!songs || songs.length === 0) {
      throw new Error('No songs found in the HTML data');
    }
    
    // Format the songs data
    const formattedSongs = songs.map(song => ({
      tab_id: song.id,
      artist_name: song.artist_name,
      song_name: song.song_name,
      tab_url: song.tab_url,
      type: song.type_name,
      difficulty: song.difficulty || 'Unknown',
      rating: song.rating || 0,
      votes: song.votes || 0,
      tonality: song.tonality_name || 'Unknown'
    }));
    
    // Create the final JSON blob
    const result = {
      source: "Ultimate Guitar Explore Page - Guitar Pro Tabs",
      url: "https://www.ultimate-guitar.com/explore?order=hitstotal_desc&type[]=Pro",
      total_songs: formattedSongs.length,
      extraction_date: new Date().toISOString(),
      songs: formattedSongs
    };
    
    return result;
    
  } catch (error) {
    console.error('Error extracting songs:', error.message);
    return {
      error: error.message,
      success: false
    };
  }
}

/**
 * Main function to extract and display songs
 */
function main() {
  const htmlFilePath = './docs/ug-pages/Explore guitar pro tabs @ Ultimate-Guitar.Com.html';
  
  console.log('🎸 Extracting Ultimate Guitar Songs...');
  console.log('=' .repeat(60));
  
  const songsData = extractUGSongs(htmlFilePath);
  
  if (songsData.error) {
    console.error('❌ Extraction failed:', songsData.error);
    return;
  }
  
  console.log('✅ Successfully extracted song data!');
  console.log(`📊 Total songs found: ${songsData.total_songs}`);
  console.log(`🔗 Source: ${songsData.url}`);
  console.log(`📅 Extracted: ${songsData.extraction_date}`);
  
  console.log('\n📋 SONG LIST:');
  console.log('=' .repeat(60));
  
  songsData.songs.forEach((song, index) => {
    console.log(`${index + 1}. ${song.artist_name} - ${song.song_name}`);
    console.log(`   Tab ID: ${song.tab_id} | Type: ${song.type} | Difficulty: ${song.difficulty}`);
    console.log(`   Rating: ${song.rating} | Votes: ${song.votes} | Key: ${song.tonality}`);
    console.log(`   URL: ${song.tab_url}`);
    console.log('');
  });
  
  // Save to JSON file
  const outputFile = 'ug_songs_extracted.json';
  fs.writeFileSync(outputFile, JSON.stringify(songsData, null, 2));
  console.log(`💾 Song data saved to: ${outputFile}`);
  
  // Display sample JSON structure
  console.log('\n📄 JSON STRUCTURE SAMPLE:');
  console.log('=' .repeat(60));
  console.log(JSON.stringify(songsData.songs[0], null, 2));
}

// Run the extraction
main();
