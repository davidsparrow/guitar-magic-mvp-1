FEATURE_SPECIFICATIONS

# 🎯 Feature Specifications

## 🔄 Video Flipping Controls
### Free Tier ✅
- **Vertical Flip**: CSS `transform: rotateX(180deg)`
- **Horizontal Flip**: CSS `transform: rotateY(180deg)`
- **Both**: Combined transforms
- **Implementation**: Applied to YouTube iframe container

## 🔁 Custom Loop Timeline
### Premium Only 💎
- **Timeline UI**: Draggable start/stop markers
- **Precision**: Sub-second accuracy (0.1s increments)
- **Loop Logic**: Monitor currentTime vs bounds
- **Auto-seek**: Jump to start when reaching end
- **Persistence**: Save/load custom loops per user

## 🔍 Search & Discovery
### Free Tier
- **Daily Limit**: 20 searches per day
- **History**: Last 5 searches saved
- **Results**: YouTube Data API v3 integration

### Premium Tier
- **Unlimited**: No daily search limits
- **Full History**: All searches saved indefinitely
- **Advanced Filters**: Duration, quality, upload date

## 🔐 User Management
- **Authentication**: Supabase Auth (email + OAuth)
- **Profiles**: Extended user data in user_profiles table
- **Feature Gates**: Dynamic system for premium features
- **Usage Tracking**: Analytics and limit enforcement