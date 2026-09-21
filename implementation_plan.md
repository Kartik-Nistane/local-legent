# Implementation Plan - Local Legend: AI-Powered Neighborhood Memory Map

Build **Local Legend**, a warm, editorial, community-driven full-stack web application where people attach personal stories, photos, and voice memories to real locations on an interactive map.

## Overview & Architecture

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons, customized editorial design system (cream `#FAF7F2` backgrounds, charcoal `#1C1917` typography, warm terracotta `#C2410C`, sage green `#0F766E`, and antique accents).
- **Interactive Map**: Mapbox GL JS (with MapLibre/OpenStreetMap fallback for out-of-the-box zero-config demonstration) featuring clustered memory pins, mood-colored markers, geosearch, interactive popups, and full mobile support (map/list toggle).
- **Database & Auth**: Supabase PostgreSQL with Row-Level Security (RLS), Supabase Auth, and Supabase Storage for audio/photo media. Comprehensive SQL migration and seed script provided in `supabase/migrations/` and `supabase/seed.sql`.
- **Hybrid Data Layer**: Built-in resilient repository layer that connects to live Supabase if credentials are provided in `.env.local`, and seamlessly falls back to a rich pre-seeded client/server mock store with real coordinates, stories, audio clips, and comments so the app runs immediately out of the box.
- **AI Core (OpenAI)**:
  - Structured memory enhancement: GPT-4o-mini generating `{ title, summary, tags, mood }`.
  - Content moderation check prior to public listing.
  - Audio transcription: OpenAI Whisper API (`/api/ai/transcribe`) from browser audio recordings or uploaded files.
  - Story translation: `/api/ai/translate` allowing multilingual reading while strictly preserving the author's original story.
  - Postcard illustration generator: Optional AI postcard illustration (DALL-E 3 with vintage watercolor/linocut prompt curation) clearly labeled as AI-generated.

---

## User Review Required

> [!IMPORTANT]
> **API Keys & Zero-Config Demo Mode**: The application will be fully operational on day 1 even before adding your own Supabase, Mapbox, or OpenAI API keys. It will include realistic seeded memories across vibrant neighborhoods, an interactive map, simulated AI enhancements, and local storage state persistence. Once you insert your credentials into `.env.local`, it automatically engages live Supabase tables, Mapbox tiles, and OpenAI models.

> [!NOTE]
> **Recommended Active Workspace**: We will scaffold the project inside `C:\Users\karti\.gemini\antigravity\scratch\local-legend`. You can open this directory as your active workspace in your editor.

---

## Proposed Changes

### Project Scaffolding & Configuration

#### [NEW] [package.json](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/package.json)
- Next.js 14/15, React 18/19, TypeScript, Tailwind CSS, `mapbox-gl`, `@types/mapbox-gl`, `@supabase/supabase-js`, `@supabase/ssr`, `openai`, `lucide-react`, `clsx`, `tailwind-merge`, `canvas-confetti`.

#### [NEW] [tailwind.config.ts](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/tailwind.config.ts) & [globals.css](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/app/globals.css)
- Editorial color tokens (`parchment`, `terracotta`, `sage`, `charcoal`, `sand`, `warm-border`).
- Custom serif heading fonts (`Playfair Display` or `Newsreader` font pairing with `Plus Jakarta Sans`).
- Warm card shadows, custom map pin animations, and audio waveform styling.

#### [NEW] [.env.example](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/.env.example)
- Environment variable specifications for Supabase, Mapbox, and OpenAI.

---

### Database Schema & Supabase Configuration

#### [NEW] [supabase/migrations/20260921_initial_schema.sql](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/supabase/migrations/20260921_initial_schema.sql)
- Tables:
  - `profiles`: id (uuid PK -> auth.users), username, display_name, avatar_url, bio, created_at.
  - `places`: id (uuid PK), name, address, latitude, longitude, created_at.
  - `memories`: id (uuid PK), user_id (FK profiles), place_id (FK places), original_text, ai_title, ai_summary, tags (text[]), mood (text), visibility ('public'|'private'), status ('approved'|'pending'|'flagged'), audio_url, illustration_url, is_ai_illustrated, created_at.
  - `media`: id, memory_id, type ('photo'|'audio'|'illustration'), url, created_at.
  - `reactions`: id, memory_id, user_id, reaction_type ('heart'|'pin'|'warmth'), created_at.
  - `comments`: id, memory_id, user_id, content, created_at.
  - `saved_memories`: id, memory_id, user_id, created_at.
- Complete Row Level Security (RLS) policies:
  - Anyone can read approved public memories and places.
  - Authenticated users can insert their own memories, reactions, comments, and saved bookmarks.
  - Users can update/delete only their own content.
  - Storage bucket `local-legend-media` configuration policies.

#### [NEW] [supabase/seed.sql](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/supabase/seed.sql)
- Rich seed dataset with realistic neighborhood stories (Greenwich Village jazz cafe, Kyoto alleyway tea shop, Lisbon miradouro sunset, Paris Seine bookstalls, San Francisco fog-swept cable car corner, Mumbai sea face promenade).

---

### Core Data & Client Libraries

#### [NEW] [src/lib/supabase/client.ts](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/lib/supabase/client.ts) & [server.ts](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/lib/supabase/server.ts)
- Supabase browser and server clients with graceful fallback detection when environment variables are not yet configured.

#### [NEW] [src/lib/types.ts](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/lib/types.ts)
- TypeScript definitions for `Memory`, `Place`, `Profile`, `Comment`, `Reaction`, `MoodType`, `AIEnhancementResponse`.

#### [NEW] [src/lib/demo-data.ts](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/lib/demo-data.ts)
- Curated realistic memories, tags, photos, audio previews, coordinates, author profiles, and comments.

#### [NEW] [src/lib/store.ts](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/lib/store.ts)
- Unified memory service: queries Supabase if available, otherwise operates on in-memory/localStorage store so adding memories, reactions, comments, and bookmarks works seamlessly in browser testing.

---

### AI Service & API Routes

#### [NEW] [src/app/api/ai/enhance/route.ts](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/app/api/ai/enhance/route.ts)
- OpenAI API integration (`gpt-4o-mini`) using structured output / JSON mode.
- Sanitizes input, applies moderation via OpenAI Moderation endpoint, and extracts evocative title, concise 2-3 sentence summary, 3-5 tags, and mood category (Nostalgic, Food, Hidden Gem, Student Life, History, Romance, Nature).
- Includes graceful fallback engine for offline or key-less environments.

#### [NEW] [src/app/api/ai/transcribe/route.ts](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/app/api/ai/transcribe/route.ts)
- Audio transcription via OpenAI Whisper (`whisper-1`) accepting audio files/blobs from client mic recorder.

#### [NEW] [src/app/api/ai/postcard/route.ts](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/app/api/ai/postcard/route.ts)
- OpenAI DALL-E 3 image generation with curated vintage linocut/watercolor editorial prompt crafting.

#### [NEW] [src/app/api/ai/translate/route.ts](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/app/api/ai/translate/route.ts)
- Translates story text into selected languages while preserving the original.

---

### Reusable UI Components

#### [NEW] [src/components/ui/navbar.tsx](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/components/ui/navbar.tsx)
- Editorial header with logo ("Local Legend"), navigation links, search trigger, "Share Memory" CTA, user profile button / auth trigger.

#### [NEW] [src/components/ui/footer.tsx](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/components/ui/footer.tsx)
- Community archive manifesto, links, and design attribution.

#### [NEW] [src/components/map/interactive-map.tsx](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/components/map/interactive-map.tsx)
- Mapbox GL JS map component with custom SVG pin markers color-coded by mood.
- Clustered pin handling, zoom animations, bounds auto-fitting, click-to-open drawer/card.
- Map style switcher (Editorial Warm, Classic Street, Satellite).
- Fallback tile provider ensuring the map renders even with missing Mapbox token.

#### [NEW] [src/components/map/map-pin-picker.tsx](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/components/map/map-pin-picker.tsx)
- Clickable pin dropping component with geocoding address search for the "Add Memory" page.

#### [NEW] [src/components/memories/memory-card.tsx](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/components/memories/memory-card.tsx)
- Warm editorial card displaying photo/postcard, mood badge, title, AI summary, place, date, audio indicator, and author.

#### [NEW] [src/components/memories/audio-recorder.tsx](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/components/memories/audio-recorder.tsx)
- In-browser microphone audio recorder with live recording timer, playback, and "Transcribe with AI" action.

#### [NEW] [src/components/memories/audio-player.tsx](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/components/memories/audio-player.tsx)
- Elegant voice note player with play/pause, time tracker, and stylized audio bars.

#### [NEW] [src/components/memories/filter-bar.tsx](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/components/memories/filter-bar.tsx)
- Mood filters (Nostalgic, Food, Hidden Gem, Student Life, History, Romance, Nature), search input, and sort dropdown.

---

### Pages & Views

#### [NEW] [src/app/page.tsx](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/app/page.tsx)
- Landing page with headline “Every place has a story.”
- Interactive map preview teaser.
- Featured neighborhood memories carousel/grid.
- Mood exploration pills.
- "Explore the Map" & "Share a Memory" primary CTAs.

#### [NEW] [src/app/explore/page.tsx](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/app/explore/page.tsx)
- Full-screen interactive map.
- Search and mood filters.
- Selected memory side drawer / popup card.
- Mobile toggle button between List View and Map View.

#### [NEW] [src/app/memories/new/page.tsx](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/app/memories/new/page.tsx)
- Memory creation wizard:
  - Step 1: Pin drop on map or search place name/address.
  - Step 2: Write story text, upload photo or record voice note (with instant Whisper transcription).
  - Step 3: Click "Enhance with AI" -> renders structured JSON preview (evocative title, 2-3 sentence summary, tags, detected mood).
  - Step 4: Optional "Generate Postcard Illustration".
  - Step 5: Save as Draft or Publish Publicly.

#### [NEW] [src/app/memories/[id]/page.tsx](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/app/memories/[id]/page.tsx)
- Detail view:
  - Hero image or AI postcard (labeled if generated).
  - Title, original story (strictly preserved), AI summary, mood badge, tags.
  - Audio voice player.
  - Language translation toggle.
  - Embedded location mini-map.
  - Like reaction button, bookmark save button, copy link share action.
  - Comments list with instant comment posting.
  - Related memories from nearby coordinates.

#### [NEW] [src/app/profile/page.tsx](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/src/app/profile/page.tsx)
- Profile view:
  - User avatar, name, bio, join date.
  - Stats: Memories shared, places pinned, reactions received, moods collected.
  - Tabs: My Published Memories, Drafts, Saved Bookmarks.

#### [NEW] [README.md](file:///C:/Users/karti/.gemini/antigravity/scratch/local-legend/README.md)
- Complete setup documentation, Supabase SQL setup steps, Mapbox token instructions, OpenAI key guide, architecture notes, and Vercel deployment guide.

---

## Verification Plan

### Automated Verification
- `npm run build`: Verify TypeScript compilation, App Router route validation, and asset bundling.
- `npm run lint`: Code quality and syntax checks.

### Interactive Functional Verification
- Landing Page: Ensure hero, map teaser, featured memories, and navigation work smoothly.
- Explore Map: Test pin filtering by mood, search query, pin clicks opening preview cards, and mobile list/map toggle.
- Add Memory Flow: Drop a pin on the map, input story text or voice note, click "Enhance with AI" to verify structured JSON response (`title`, `summary`, `tags`, `mood`), test postcard generation, and publish memory.
- Memory Detail: Verify original story display, AI summary, voice note playback, comment addition, like reaction count increment, and related memories.
- Profile Page: Verify user memory list, saved memory bookmarks, and contribution stats.
- Zero-Config vs Live Config: Test graceful fallback when keys are absent and proper connection when keys are provided.
