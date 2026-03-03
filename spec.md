# Trade Trigger India

## Current State
The project has no App.tsx, no main.mo, and no meaningful frontend code. Only boilerplate UI components and main.tsx exist. Previous deployment attempts failed due to missing core files.

## Requested Changes (Diff)

### Add
- Motoko backend (minimal, no-op actor for deployment compatibility)
- App.tsx as the main React entry point with full routing
- HeroSection: large heading "TRADE TRIGGER INDIA", tagline, TTI logo, banner image, floating candlestick particle animation in background, 3D gold bull (left) and red bear (right) using Three.js/React Three Fiber, red glow CTA button "Watch Live Analysis" linking to YouTube channel
- LiveDashboard section: 4 glassmorphism cards with TradingView widgets (NIFTY50, SENSEX, BITCOIN, ETHEREUM), hover tilt effect
- LiveStream section: YouTube embed placeholder for @tradetriggerindia channel, "Join Live on YouTube" button
- Telegram section: glass card with Telegram join button linking to t.me/+cSR99I4G5P4yY2I1
- Footer with risk disclaimer and social links (YouTube, Telegram)
- Global effects: parallax scroll, ambient red glow from bottom, gold accent animations, glassmorphism panels, smooth fade-in transitions
- TTI logo image (/assets/uploads/ChatGPT-Image-Feb-27-2026-05_02_34-PM-1.png) in Navbar and Hero
- Wide banner image (/assets/uploads/ChatGPT-Image-Feb-27-2026-05_00_48-PM-2.png) as hero atmospheric overlay

### Modify
- index.css: ultra-dark background (#0b0b0f), premium financial aesthetic, custom scrollbar, font imports

### Remove
- Nothing to remove (no existing app code)

## Implementation Plan
1. Create src/backend/main.mo (minimal actor)
2. Create src/frontend/src/App.tsx (single-page layout, all sections rendered in order)
3. Create HeroSection component with Three.js bull/bear, particle canvas, TTI logo + banner
4. Create LiveDashboard component with 4 TradingView iframe cards
5. Create LiveStream component with YouTube embed
6. Create TelegramSection component
7. Create Footer component
8. Update index.css with dark theme, OKLCH tokens, animations
9. Validate build passes (typecheck + vite build)
