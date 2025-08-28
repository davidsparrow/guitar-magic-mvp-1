Architecture

// Design and Logic for GuitarMagic Webapp //


# 🏗️ System Architecture

## 🎯 Overview
GuitarMagic is a Next.js SaaS application that enhances YouTube viewing with custom controls.

## 🔧 Tech Stack
- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Payments**: Stripe
- **External APIs**: YouTube Data API v3, YouTube Player API
- **Deployment**: Vercel (Frontend) + Supabase (Backend)

## 🎨 User Experience
- **Mobile**: 3 pages (HOME → SEARCH → DETAIL)
- **Desktop**: 2 pages (HOME + SEARCH+DETAIL combined)
- **Navigation**: Hamburger menu for utilities
- **Focus**: Video-centric, clean interface

## 💎 Business Model
- **Free Tier**: Basic flipping, 20 daily searches
- **Premium Tier**: Custom loops, unlimited searches ($9/mo)
- **Monetization**: Stripe subscriptions with feature gating

## 🎸 Component Architecture

### Chord Caption Modal (`components/ChordCaptionModal.js`)
**Purpose**: Standalone modal for managing chord captions with full snapshot functionality

**Key Features**:
- **Snapshot System**: Creates deep copy of all chord captions when modal opens
- **Cancel Functionality**: Reverts all changes using `originalChordCaptionsSnapshot`
- **State Management**: Comprehensive state reset on cancellation
- **User Experience**: Feature parity with Text Caption Modal

**State Variables**:
- `chords`: Array of current chord captions
- `originalChordCaptionsSnapshot`: Deep copy for revert functionality
- `originalChordSnapshot`: Individual chord snapshot for single edits
- Various UI states for forms and validation

**Key Functions**:
- `handleCancelChordModal()`: Main cancel function that reverts all changes
- `loadChordCaptions()`: Loads chords from database
- `handleEditChord()`: Manages individual chord editing with snapshot
- `handleCancelEditChord()`: Cancels individual chord edits

**Snapshot Implementation**:
- Uses `JSON.parse(JSON.stringify())` for deep copying
- Snapshot created when modal opens and chords are loaded
- Complete state restoration on cancel including all nested objects