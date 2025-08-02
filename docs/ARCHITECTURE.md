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