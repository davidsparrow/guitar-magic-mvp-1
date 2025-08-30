-- Database Schema Backup - GuitarMagic Platform
-- Created: 2025-08-29T19:58:47.942Z
-- Project: https://kxnnbusdokitbgurowkq.supabase.co

-- Table: favorites
-- Columns: id, user_id, video_id, video_title, video_thumbnail, video_channel, video_duration_seconds, is_public, share_token, share_expires_at, created_at, updated_at, video_channel_id, uuid_song
-- Sample data structure found
CREATE TABLE IF NOT EXISTS "favorites" (
  "id" TEXT,
  "user_id" TEXT,
  "video_id" TEXT,
  "video_title" TEXT,
  "video_thumbnail" TEXT,
  "video_channel" TEXT,
  "video_duration_seconds" TEXT,
  "is_public" BOOLEAN,
  "share_token" TEXT,
  "share_expires_at" TEXT,
  "created_at" TEXT,
  "updated_at" TEXT,
  "video_channel_id" TEXT,
  "uuid_song" TEXT
);

-- Table: captions
-- Columns: id, favorite_id, user_id, row_type, start_time, end_time, line1, line2, is_shared, original_caption_id, created_at, updated_at, serial_number
-- Sample data structure found
CREATE TABLE IF NOT EXISTS "captions" (
  "id" TEXT,
  "favorite_id" TEXT,
  "user_id" TEXT,
  "row_type" INTEGER,
  "start_time" TEXT,
  "end_time" TEXT,
  "line1" TEXT,
  "line2" TEXT,
  "is_shared" BOOLEAN,
  "original_caption_id" TEXT,
  "created_at" TEXT,
  "updated_at" TEXT,
  "serial_number" INTEGER
);

-- Table: chord_captions
-- Columns: id, favorite_id, user_id, chord_name, start_time, end_time, chord_data, display_order, serial_number, sync_group_id, is_master, created_at, updated_at
-- Sample data structure found
CREATE TABLE IF NOT EXISTS "chord_captions" (
  "id" TEXT,
  "favorite_id" TEXT,
  "user_id" TEXT,
  "chord_name" TEXT,
  "start_time" TEXT,
  "end_time" TEXT,
  "chord_data" TEXT,
  "display_order" INTEGER,
  "serial_number" INTEGER,
  "sync_group_id" TEXT,
  "is_master" BOOLEAN,
  "created_at" TEXT,
  "updated_at" TEXT
);

-- Table: chord_positions
-- Columns: id, position_type, fret_position, strings, frets, fingering, barre, barre_fret, aws_svg_url_light, aws_svg_url_dark, svg_file_size, metadata, created_at, updated_at, chord_variation_id
-- Sample data structure found
CREATE TABLE IF NOT EXISTS "chord_positions" (
  "id" TEXT,
  "position_type" TEXT,
  "fret_position" INTEGER,
  "strings" JSONB,
  "frets" JSONB,
  "fingering" JSONB,
  "barre" BOOLEAN,
  "barre_fret" TEXT,
  "aws_svg_url_light" TEXT,
  "aws_svg_url_dark" TEXT,
  "svg_file_size" TEXT,
  "metadata" JSONB,
  "created_at" TEXT,
  "updated_at" TEXT,
  "chord_variation_id" TEXT
);

-- Table: chord_variations
-- Columns: id, chord_name, display_name, root_note, chord_type, difficulty, category, total_variations, created_at, updated_at
-- Sample data structure found
CREATE TABLE IF NOT EXISTS "chord_variations" (
  "id" TEXT,
  "chord_name" TEXT,
  "display_name" TEXT,
  "root_note" TEXT,
  "chord_type" TEXT,
  "difficulty" TEXT,
  "category" TEXT,
  "total_variations" INTEGER,
  "created_at" TEXT,
  "updated_at" TEXT
);

-- Table: user_profiles
-- Columns: id, email, full_name, avatar_url, subscription_tier, subscription_status, stripe_customer_id, trial_ends_at, subscription_ends_at, daily_searches_used, last_search_reset, preferences, created_at, updated_at, default_caption_duration_seconds, plan_selected_at, trial_started_at, trial_reminder_sent, last_video_id, last_video_timestamp, last_video_title, last_video_channel_name, last_session_date, resume_enabled
-- Sample data structure found
CREATE TABLE IF NOT EXISTS "user_profiles" (
  "id" TEXT,
  "email" TEXT,
  "full_name" TEXT,
  "avatar_url" TEXT,
  "subscription_tier" TEXT,
  "subscription_status" TEXT,
  "stripe_customer_id" TEXT,
  "trial_ends_at" TEXT,
  "subscription_ends_at" TEXT,
  "daily_searches_used" INTEGER,
  "last_search_reset" TEXT,
  "preferences" JSONB,
  "created_at" TEXT,
  "updated_at" TEXT,
  "default_caption_duration_seconds" INTEGER,
  "plan_selected_at" TEXT,
  "trial_started_at" TEXT,
  "trial_reminder_sent" JSONB,
  "last_video_id" TEXT,
  "last_video_timestamp" NUMERIC,
  "last_video_title" TEXT,
  "last_video_channel_name" TEXT,
  "last_session_date" TEXT,
  "resume_enabled" BOOLEAN
);

-- Table: admin_settings
-- Columns: id, setting_key, setting_name, setting_value, description, is_active, created_at, updated_at
-- Sample data structure found
CREATE TABLE IF NOT EXISTS "admin_settings" (
  "id" TEXT,
  "setting_key" TEXT,
  "setting_name" TEXT,
  "setting_value" JSONB,
  "description" TEXT,
  "is_active" BOOLEAN,
  "created_at" TEXT,
  "updated_at" TEXT
);

-- Table: feature_gates
-- Columns: id, feature_key, feature_name, description, required_tier, is_enabled, rollout_percentage, metadata, created_at, updated_at
-- Sample data structure found
CREATE TABLE IF NOT EXISTS "feature_gates" (
  "id" TEXT,
  "feature_key" TEXT,
  "feature_name" TEXT,
  "description" TEXT,
  "required_tier" JSONB,
  "is_enabled" BOOLEAN,
  "rollout_percentage" INTEGER,
  "metadata" JSONB,
  "created_at" TEXT,
  "updated_at" TEXT
);

-- Backup Summary
-- Tables found: 15
-- Total tables checked: 17
-- Backup completed: 2025-08-29T19:58:53.243Z
-- Note: This is a basic schema backup. For complete schema,
-- use the Supabase Dashboard SQL Editor to run:
-- SELECT table_name, column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_schema = 'public'
-- ORDER BY table_name, ordinal_position;
