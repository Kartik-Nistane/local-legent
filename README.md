# Local Legend 🗺️✨

### An AI-Powered Neighborhood Memory Map

> **"Every place has a story."**
>
> Local Legend is a warm, editorial, community-driven digital travel journal and archive where people attach personal memories, vintage photographs, and voice notes to real coordinates on an interactive neighborhood map. Powered by OpenAI's latest models, every memory is beautifully enhanced with evocative titles, mood detection, AI-generated vintage postcard illustrations, and multilingual translation.

---

## 🌟 Key Features

### 1. **Interactive Neighborhood Map**
- Built with Mapbox GL JS + OpenStreetMap fallback (zero-config demo mode works immediately)
- Clustered memory pins color-coded by emotional mood
- Smooth fly-to animations, hover previews, and coordinate inspection
- Fullscreen explore view with reactive search and mobile map/list toggle
- Works seamlessly even without API credentials configured

### 2. **Core AI Capabilities**
- **🎙️ Voice Memory Transcription**: Browser-based microphone recorder powered by OpenAI Whisper to transcribe spoken recollections
- **✍️ Literary Memory Enhancement**: Automatically extracts evocative titles, 2–3 sentence archival summaries, 3–5 descriptive tags, and detects emotional moods (7 categories) using GPT-4o-mini
- **📖 Story Preservation**: Original author's words remain strictly preserved and prominently displayed
- **🎨 Collectible Postcards**: Generates 1950s linocut and watercolor travel postcard illustrations via DALL-E 3 (clearly labeled as AI-generated)
- **🌍 Story Translation**: Multilingual reader support (Spanish, French, Japanese, Italian, and more) while keeping original text intact
- **🛡️ Content Moderation**: Pre-publishing safety verification via OpenAI Moderation endpoint

### 3. **Database, Authentication & Security**
- Supabase PostgreSQL backend with Row-Level Security (RLS) policies
- Public users view approved memories; creators manage their own content
- Structured schema for `profiles`, `places`, `memories`, `media`, `reactions`, `comments`, and `saved_memories`
- Complete SQL migration scripts included

### 4. **Resilient Zero-Config Demo Mode**
- Pre-seeded with authentic, rich memories across global neighborhoods:
  - Greenwich Village (New York)
  - Montmartre (Paris)
  - Gion (Kyoto)
  - Alfama (Lisbon)
  - North Beach (San Francisco)
  - Marine Drive (Mumbai)
- Operates seamlessly with local storage persistence if API credentials are not yet supplied

### 5. **Warm Editorial Aesthetic**
- Parchment paper textures and Newsreader serif typography
- Carefully curated color palette: terracotta `#C2410C`, sage green `#0F766E`, charcoal `#1C1917`
- Designed to feel like a treasured archival journal

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 14+ (App Router) |
| **Language** | TypeScript (93.7%) |
| **Styling** | Tailwind CSS, `@tailwindcss/typography`, Lucide Icons |
| **Mapping** | Mapbox GL JS, Google Maps API loader, Vis.gl React Google Maps |
| **Backend & Database** | Supabase (PostgreSQL with RLS & Auth) |
| **AI Models** | OpenAI GPT-4o-mini, Whisper (`whisper-1`), DALL-E 3 |
| **Utilities** | Canvas Confetti, clsx, tailwind-merge |
| **Deployment** | Vercel-ready |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- (Optional) Supabase account for production deployment
- (Optional) OpenAI API key for full AI features
- (Optional) Mapbox token for advanced mapping features

### 1. Clone & Install

```bash
git clone https://github.com/Kartik-Nistane/local-legent.git
cd local-legent
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Configure your API credentials (all optional for demo mode):

```env
# Supabase Configuration (Required for production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Mapbox Configuration (Optional - uses OpenStreetMap tiles if empty)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_public_token

# OpenAI API Configuration (Optional - uses smart mock fallbacks if empty)
OPENAI_API_KEY=sk-your-openai-api-key
```

### 3. Supabase Setup (Production)

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Navigate to **SQL Editor** in the Supabase Dashboard
3. Execute the migration script: [`supabase/migrations/20260921_initial_schema.sql`](supabase/migrations/20260921_initial_schema.sql)
4. (Optional) Run [`supabase/seed.sql`](supabase/seed.sql) to populate initial places

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to experience Local Legend!

**Available Scripts:**
- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm start` — Start production server
- `npm run lint` — Run ESLint

---

## 📁 Project Structure

```
local-legend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── ai/
│   │   │       ├── enhance/route.ts         # GPT-4o-mini structured enhancement
│   │   │       ├── transcribe/route.ts      # Whisper audio transcription
│   │   │       ├── postcard/route.ts        # DALL-E 3 postcard generator
│   │   │       └── translate/route.ts       # Multilingual translation
│   │   ├── explore/
│   │   │   └── page.tsx                     # Fullscreen interactive map
│   │   ├── memories/
│   │   │   ├── new/page.tsx                 # Memory creation wizard
│   │   │   └── [id]/page.tsx                # Memory detail view
│   │   ├── profile/
│   │   │   └── page.tsx                     # User profile & bookmarks
│   │   ├── layout.tsx                       # App shell & typography
│   │   ├── page.tsx                         # Landing page
│   │   └── globals.css                      # Design tokens
│   ├── components/
│   │   ├── map/
│   │   │   ├── interactive-map.tsx          # Mapbox GL component
│   │   │   └── map-pin-picker.tsx           # Pin dropper UI
│   │   ├── memories/
│   │   │   ├── audio-player.tsx             # Waveform player
│   │   │   ├── audio-recorder.tsx           # Mic recorder
│   │   │   ├── filter-bar.tsx               # Search & filters
│   │   │   └── memory-card.tsx              # Memory display card
│   │   └── ui/
│   │       ├── navbar.tsx                   # Navigation
│   │       └── footer.tsx                   # Archive footer
│   └── lib/
│       ├── ai-helpers.ts                    # OpenAI integration
│       ├── demo-data.ts                     # Demo memories
│       ├── store.ts                         # Data persistence
│       ├── types.ts                         # TypeScript types
│       └── supabase/
│           ├── client.ts                    # Browser client
│           └── server.ts                    # Server client
├── supabase/
│   ├── migrations/
│   │   └── 20260921_initial_schema.sql      # DB schema & RLS
│   └── seed.sql                             # Seed data
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your repository to GitHub
2. Import the project into [Vercel](https://vercel.com)
3. Add environment variables in **Project Settings**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_MAPBOX_TOKEN` (optional)
   - `OPENAI_API_KEY` (optional)
4. Deploy!

The Next.js App Router and server actions are optimized for Vercel's edge and serverless execution.

---

## 🎯 Core Workflows

### Adding a Memory
1. Click **"New Memory"** or pin a location on the map
2. Record voice note or type your story
3. AI automatically enhances the memory with title, mood, and tags
4. Review and publish
5. System generates a vintage postcard illustration

### Exploring Memories
- Browse the interactive map with mood-colored pins
- Search by location, mood, or keywords
- View memory details with audio playback and comments
- Bookmark favorites to your profile

### Community Moderation
- Creators manage their own memories with edit/delete controls
- Public users see approved content
- AI-powered content moderation ensures safety
- Comments and reactions foster engagement

---

## 🔐 Security & Privacy

- **Row-Level Security (RLS)**: Database policies enforce user permissions
- **Authentication**: Supabase Auth with email/password or OAuth
- **Content Moderation**: OpenAI Moderation API screens user input
- **Data Encryption**: HTTPS by default, database encryption at rest (Supabase)
- **Privacy Control**: Users choose what memories are public/private

---

## 📊 Language Composition

- **TypeScript**: 93.7% — Strong type safety throughout the codebase
- **PLpgSQL**: 4.7% — Database functions and triggers
- **CSS**: 1.3% — Tailwind-generated and custom styles
- **JavaScript**: 0.3% — Minimal legacy configuration

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please ensure:
- Code is TypeScript with proper types
- Components follow the existing design system
- New features include appropriate error handling
- Database changes include migration scripts

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🙌 Acknowledgments

- **OpenAI** for GPT-4o-mini, Whisper, and DALL-E 3 capabilities
- **Supabase** for the PostgreSQL database and Auth infrastructure
- **Vercel** for Next.js and deployment optimization
- **Mapbox** and **OpenStreetMap** for mapping services
- The community for sharing their neighborhood memories

---

## 📮 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/Kartik-Nistane/local-legent/issues)
- **Email**: Open an issue for inquiries
- **Documentation**: See the [project structure](#-project-structure) for detailed file guides

---

**Built with ❤️ by Kartik Nistane**

*Every place has a story. Let Local Legend help you preserve and share yours.*
