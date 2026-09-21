# Local Legend 🗺️✨
### An AI-Powered Neighborhood Memory Map

> **“Every place has a story.”**  
> Local Legend is a warm, editorial, community-driven digital travel journal and archive where people attach personal memories, vintage photographs, and voice notes to real coordinates on an interactive map.

---

## 🌟 Key Features

1. **Interactive Neighborhood Map (Mapbox GL JS + OpenTile Fallback)**
   - Clustered memory pins color-coded by emotional mood.
   - Smooth fly-to animations, hover previews, and coordinate inspection.
   - Fullscreen explore view with reactive search and mobile map/list toggle.
   - Works immediately out of the box even before configuring a Mapbox token.

2. **Core AI Capabilities (OpenAI)**
   - **Voice Memory Transcription**: In-browser microphone voice recorder powered by OpenAI Whisper (`whisper-1`) to turn spoken recollections into written text.
   - **Literary Memory Enhancement**: Extracts an evocative title, a faithful 2–3 sentence archival summary, 3–5 descriptive tags, and detects one of seven emotional moods using GPT-4o-mini with structured JSON output.
   - **Story Preservation**: The author's original words are strictly preserved and prominently displayed.
   - **Collectible Postcards**: Generates 1950s linocut and watercolor travel postcard illustrations via DALL-E 3, clearly labeled as AI-generated.
   - **Story Translation**: Multilingual reader support (Spanish, French, Japanese, Italian, etc.) keeping original text intact.
   - **Content Moderation**: Pre-publishing safety verification via OpenAI Moderation endpoint.

3. **Database, Authentication & Security (Supabase PostgreSQL)**
   - Row-Level Security (RLS) policies ensuring public users view approved memories while creators manage their own content.
   - Structured schema for `profiles`, `places`, `memories`, `media`, `reactions`, `comments`, and `saved_memories`.
   - Complete SQL migration scripts in `supabase/migrations/`.

4. **Resilient Zero-Config Demo Mode**
   - Pre-seeded with authentic, rich memories across global neighborhoods (Greenwich Village NY, Montmartre Paris, Gion Kyoto, Alfama Lisbon, North Beach San Francisco, Marine Drive Mumbai).
   - Operates seamlessly with local storage persistence if API credentials are not yet supplied.

5. **Warm Editorial Aesthetic**
   - Parchment paper textures, Newsreader serif typography, terracotta `#C2410C`, sage green `#0F766E`, and charcoal `#1C1917` palette designed to feel like a treasured archival journal.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, `@tailwindcss/typography`, Lucide Icons
- **Mapping**: Mapbox GL JS (`mapbox-gl`)
- **Backend & Database**: Supabase (PostgreSQL with RLS & Auth)
- **AI Models**: OpenAI GPT-4o-mini, Whisper (`whisper-1`), DALL-E 3 (`dall-e-3`)
- **Deployment**: Ready for Vercel

---

## 🚀 Getting Started

### 1. Installation

Clone or navigate into the project directory:
```bash
cd local-legend
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory (or copy from `.env.example`):
```bash
cp .env.example .env.local
```

Fill in your API credentials:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Mapbox Configuration (Optional - app will use OpenStreetMap tiles if left empty)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_public_token

# OpenAI API Configuration (Optional - app will use built-in smart mock fallbacks if empty)
OPENAI_API_KEY=sk-your-openai-api-key
```

### 3. Supabase Setup (Optional for local testing, required for production)

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Navigate to the **SQL Editor** in the Supabase Dashboard.
3. Open [`supabase/migrations/20260921_initial_schema.sql`](supabase/migrations/20260921_initial_schema.sql) and execute the SQL query.
4. (Optional) Run [`supabase/seed.sql`](supabase/seed.sql) to populate initial places.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience Local Legend!

---

## 📁 Project Structure

```
local-legend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── ai/
│   │   │       ├── enhance/route.ts       # GPT-4o-mini structured JSON enhancement
│   │   │       ├── transcribe/route.ts    # Whisper audio transcription
│   │   │       ├── postcard/route.ts      # DALL-E 3 postcard illustration generator
│   │   │       └── translate/route.ts     # Multilingual story translation
│   │   ├── explore/
│   │   │   └── page.tsx                   # Fullscreen interactive map & filters
│   │   ├── memories/
│   │   │   ├── new/page.tsx               # Add memory wizard with pin dropper & AI
│   │   │   └── [id]/page.tsx              # Memory detail with audio, map & comments
│   │   ├── profile/
│   │   │   └── page.tsx                   # User profile, statistics & bookmarks
│   │   ├── layout.tsx                     # Editorial typography & base shell
│   │   ├── page.tsx                       # Landing page with hero & featured stories
│   │   └── globals.css                    # Design tokens & parchment styles
│   ├── components/
│   │   ├── map/
│   │   │   ├── interactive-map.tsx        # Mapbox GL component with custom markers
│   │   │   └── map-pin-picker.tsx         # Draggable pin dropper for new stories
│   │   ├── memories/
│   │   │   ├── audio-player.tsx           # Voice memory audio waveform player
│   │   │   ├── audio-recorder.tsx         # Browser mic recorder & Whisper action
│   │   │   ├── filter-bar.tsx             # Mood pills, search & mobile list toggle
│   │   │   └── memory-card.tsx            # Editorial memory card
│   │   └── ui/
│   │       ├── navbar.tsx                 # Navigation header
│   │       └── footer.tsx                 # Archive manifesto footer
│   └── lib/
│       ├── ai-helpers.ts                  # OpenAI clients and fallback heuristics
│       ├── demo-data.ts                   # Curated memories & mood definitions
│       ├── store.ts                       # Resilient local + Supabase data store
│       ├── types.ts                       # TypeScript interfaces
│       └── supabase/
│           ├── client.ts                  # Browser client
│           └── server.ts                  # Server client
├── supabase/
│   ├── migrations/
│   │   └── 20260921_initial_schema.sql    # Tables, indexes & Row Level Security
│   └── seed.sql                           # Initial seed data
├── .env.example
├── package.json
└── tailwind.config.ts
```

---

## 🚢 Deploying to Vercel

1. Push your repository to GitHub or GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. Add the environment variables from your `.env.local` to the Vercel Project Settings.
4. Deploy! Next.js App Router and server actions are optimized for instant Vercel edge and serverless execution.
