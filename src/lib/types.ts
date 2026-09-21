export type MoodType = 
  | 'Nostalgic'
  | 'Food'
  | 'Hidden Gem'
  | 'Student Life'
  | 'History'
  | 'Romance'
  | 'Nature';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

export interface Place {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at?: string;
}

export interface MediaItem {
  id: string;
  memory_id: string;
  type: 'photo' | 'audio' | 'illustration';
  url: string;
  created_at?: string;
}

export interface Reaction {
  id: string;
  memory_id: string;
  user_id: string;
  reaction_type: 'heart' | 'bookmark' | 'warmth' | 'pin';
  created_at?: string;
}

export interface Comment {
  id: string;
  memory_id: string;
  user_id: string;
  user?: Profile;
  content: string;
  created_at: string;
}

export interface Memory {
  id: string;
  user_id: string;
  user?: Profile;
  place_id: string;
  place: Place;
  original_text: string;
  ai_title: string;
  ai_summary: string;
  tags: string[];
  mood: MoodType;
  visibility: 'public' | 'draft' | 'private';
  status: 'approved' | 'pending' | 'flagged';
  audio_url?: string;
  audio_duration?: number;
  illustration_url?: string;
  is_postcard_generated?: boolean;
  media?: MediaItem[];
  reactions_count?: {
    heart: number;
    warmth: number;
    pin: number;
  };
  user_reaction?: 'heart' | 'warmth' | 'pin' | null;
  is_saved?: boolean;
  comments_count?: number;
  comments?: Comment[];
  created_at: string;
}

export interface AIEnhanceResponse {
  title: string;
  summary: string;
  tags: string[];
  mood: MoodType;
  isModeratedSafe: boolean;
}

export interface AITranscriptionResponse {
  text: string;
}

export interface AIPostcardResponse {
  imageUrl: string;
  prompt: string;
}

export interface AITranslateResponse {
  translatedText: string;
  language: string;
}
