// Test script to check if a specific user profile exists
// Run this with: node test_user_profile.js

import { supabase } from './lib/supabase.js'

const TEST_USER_ID = 'c47a8186-32ff-4bcc-8d54-b44caafa4660'

async function testUserProfile() {
  console.log('🔍 Testing user profile access...')
  console.log('User ID:', TEST_USER_ID)
  
  try {
    // Test 1: Check if we can access the table at all
    console.log('\n1️⃣ Testing basic table access...')
    const { data: tableTest, error: tableError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Table access failed:', tableError)
      return false
    }
    console.log('✅ Table access successful')
    
    // Test 2: Check if the specific user profile exists
    console.log('\n2️⃣ Checking if user profile exists...')
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', TEST_USER_ID)
      .single()
    
    if (profileError) {
      if (profileError.code === 'PGRST116') {
        console.log('❌ User profile NOT FOUND - this is the issue!')
        console.log('💡 The user authenticated but no profile record was created')
        return false
      } else {
        console.error('❌ Error fetching profile:', profileError)
        return false
      }
    }
    
    if (profile) {
      console.log('✅ User profile found:', {
        id: profile.id,
        email: profile.email,
        subscription_tier: profile.subscription_tier,
        resume_enabled: profile.resume_enabled,
        has_resume_columns: {
          last_video_id: !!profile.last_video_id,
          last_video_timestamp: !!profile.last_video_timestamp,
          last_video_title: !!profile.last_video_title,
          last_video_channel_name: !!profile.last_video_channel_name,
          last_session_date: !!profile.last_session_date
        }
      })
      return true
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

// Run the test
testUserProfile()
  .then(success => {
    if (success) {
      console.log('\n🎉 User profile exists and is accessible!')
      console.log('🔍 The issue must be elsewhere in the API...')
    } else {
      console.log('\n🔧 User profile is missing - this explains the 500 error!')
      console.log('💡 You need to create a profile record for this user')
    }
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Test script error:', error)
    process.exit(1)
  })
