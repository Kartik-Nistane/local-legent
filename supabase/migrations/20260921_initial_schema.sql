-- ==============================================================================
-- LOCAL LEGEND: Supabase PostgreSQL Schema & Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. PLACES TABLE
CREATE TABLE IF NOT EXISTS public.places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index places coordinates for fast spatial queries
CREATE INDEX IF NOT EXISTS idx_places_lat_lng ON public.places(latitude, longitude);

-- 3. MEMORIES TABLE
CREATE TABLE IF NOT EXISTS public.memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
    original_text TEXT NOT NULL,
    ai_title TEXT,
    ai_summary TEXT,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    mood TEXT NOT NULL DEFAULT 'Nostalgic',
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'draft', 'private')),
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'flagged')),
    audio_url TEXT,
    illustration_url TEXT,
    is_postcard_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_memories_place ON public.memories(place_id);
CREATE INDEX IF NOT EXISTS idx_memories_user ON public.memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_mood ON public.memories(mood);
CREATE INDEX IF NOT EXISTS idx_memories_status_visibility ON public.memories(status, visibility);

-- 4. MEDIA TABLE
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('photo', 'audio', 'illustration')),
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_media_memory ON public.media(memory_id);

-- 5. REACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL DEFAULT 'heart' CHECK (reaction_type IN ('heart', 'bookmark', 'warmth', 'pin')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(memory_id, user_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_reactions_memory ON public.reactions(memory_id);

-- 6. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_memory ON public.comments(memory_id);

-- 7. SAVED MEMORIES TABLE
CREATE TABLE IF NOT EXISTS public.saved_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(memory_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_memories_user ON public.saved_memories(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_memories ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can view all profiles; users can update only their own profile
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Places: Anyone can view places; authenticated users can insert places
CREATE POLICY "Places are viewable by everyone" 
ON public.places FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create places" 
ON public.places FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Memories:
-- Public can view approved public memories.
-- Memory author can view their own memories (including drafts).
CREATE POLICY "Public can view approved public memories" 
ON public.memories FOR SELECT 
USING (
    (visibility = 'public' AND status = 'approved') 
    OR (auth.uid() = user_id)
);

CREATE POLICY "Authenticated users can insert memories" 
ON public.memories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories" 
ON public.memories FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories" 
ON public.memories FOR DELETE USING (auth.uid() = user_id);

-- Media:
CREATE POLICY "Media is viewable if parent memory is viewable" 
ON public.media FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.memories m 
        WHERE m.id = media.memory_id 
        AND ((m.visibility = 'public' AND m.status = 'approved') OR m.user_id = auth.uid())
    )
);

CREATE POLICY "Memory author can insert media" 
ON public.media FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.memories m 
        WHERE m.id = media.memory_id AND m.user_id = auth.uid()
    )
);

CREATE POLICY "Memory author can delete media" 
ON public.media FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.memories m 
        WHERE m.id = media.memory_id AND m.user_id = auth.uid()
    )
);

-- Reactions:
CREATE POLICY "Reactions viewable by everyone" 
ON public.reactions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reactions" 
ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" 
ON public.reactions FOR DELETE USING (auth.uid() = user_id);

-- Comments:
CREATE POLICY "Comments viewable by everyone" 
ON public.comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can post comments" 
ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Saved Memories:
CREATE POLICY "Users can view their own saved memories" 
ON public.saved_memories FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save memories" 
ON public.saved_memories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their saved memories" 
ON public.saved_memories FOR DELETE USING (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url, bio)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
    'Neighborhood explorer and storyteller.'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
