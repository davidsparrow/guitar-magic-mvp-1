// Test script to check database connection and table structure
// Run this with: node test_db_connection.js

import { supabase } from './lib/supabase.js'

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...')
  
  try {
    // Test 1: Basic connection test
    console.log('\n1️⃣ Testing basic connection...')
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Basic connection failed:', testError)
      return false
    }
    console.log('✅ Basic connection successful')
    
    // Test 2: Check if user_profiles table exists and has expected columns
    console.log('\n2️⃣ Checking user_profiles table structure...')
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, subscription_tier')
      .limit(1)
    
    if (profileError) {
      console.error('❌ user_profiles table access failed:', profileError)
      return false
    }
    console.log('✅ user_profiles table accessible')
    
    // Test 3: Check if resume columns exist
    console.log('\n3️⃣ Checking for resume-related columns...')
    const { data: resumeData, error: resumeError } = await supabase
      .from('user_profiles')
      .select('resume_enabled, last_video_id, last_video_timestamp')
      .limit(1)
    
    if (resumeError) {
      console.error('❌ Resume columns missing:', resumeError)
      console.log('\n💡 You need to run the add_resume_columns.sql script in your Supabase database')
      return false
    }
    console.log('✅ Resume columns exist')
    
    // Test 4: Check table schema
    console.log('\n4️⃣ Checking table schema...')
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('get_table_info', { table_name: 'user_profiles' })
      .catch(() => ({ data: null, error: 'RPC function not available' }))
    
    if (schemaError) {
      console.log('⚠️ Could not get detailed schema info (RPC function not available)')
    } else {
      console.log('✅ Schema info retrieved')
    }
    
    console.log('\n🎉 All database tests passed!')
    return true
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return false
  }
}

// Run the test
testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('\n🚀 Database is ready for the Login-Resume feature!')
    } else {
      console.log('\n🔧 Database needs setup - run the add_resume_columns.sql script')
    }
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Test script error:', error)
    process.exit(1)
  })
