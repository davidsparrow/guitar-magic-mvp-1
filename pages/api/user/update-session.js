// pages/api/user/update-session.js
// Save user's current session data for resume functionality
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      userId, 
      videoId, 
      timestamp, 
      title, 
      channelId, 
      channelName 
    } = req.body;

    // Validate required fields
    if (!userId || !videoId || timestamp === undefined) {
      return res.status(400).json({ 
        message: 'userId, videoId, and timestamp are required' 
      });
    }

    // Get user profile to check subscription tier
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('subscription_tier, resume_enabled')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return res.status(500).json({ message: 'Failed to fetch user profile' });
    }

    if (!profile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Check if user has access to resume feature (Roadie+ only)
    if (profile.subscription_tier === 'free') {
      return res.status(403).json({ 
        message: 'Resume feature requires Roadie or Hero plan',
        currentPlan: profile.subscription_tier,
        upgradeRequired: true
      });
    }

    // Check if resume is enabled
    if (!profile.resume_enabled) {
      return res.status(200).json({ 
        message: 'Resume feature is disabled for this user' 
      });
    }

    // Update user profile with session data
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        last_video_id: videoId,
        last_video_timestamp: timestamp,
        last_video_title: title || null,
        last_video_channel_id: channelId || null,
        last_video_channel_name: channelName || null,
        last_session_date: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating session data:', updateError);
      return res.status(500).json({ message: 'Failed to update session data' });
    }

    res.status(200).json({ 
      message: 'Session data updated successfully',
      sessionData: {
        videoId,
        timestamp,
        title,
        channelName,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ 
      message: 'Failed to update session',
      error: error.message 
    });
  }
}
