import { Memory, Place, Comment, MoodType, Profile } from './types';
import { INITIAL_MEMORIES, DEMO_PROFILES } from './demo-data';

const STORAGE_KEY = 'local_legend_memories_v3';
const SAVED_KEY = 'local_legend_saved_v3';

// Current logged in demo user for zero-config experience
export const CURRENT_USER: Profile = DEMO_PROFILES.kartik;

// Helper to get stored memories in browser
function getStoredMemories(): Memory[] {
  if (typeof window === 'undefined') {
    return INITIAL_MEMORIES;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MEMORIES));
      return INITIAL_MEMORIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse memories from localStorage', e);
    return INITIAL_MEMORIES;
  }
}

function saveStoredMemories(memories: Memory[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
  } catch (e) {
    console.error('Failed to write memories to localStorage', e);
  }
}

export const memoryStore = {
  getMemories: async (filters?: { mood?: string; query?: string; tag?: string }): Promise<Memory[]> => {
    const all = getStoredMemories();
    let filtered = [...all];

    if (filters?.mood && filters.mood !== 'All') {
      filtered = filtered.filter(
        (m) => m.mood.toLowerCase() === filters.mood?.toLowerCase()
      );
    }

    if (filters?.tag) {
      filtered = filtered.filter((m) =>
        m.tags.some((t) => t.toLowerCase() === filters.tag?.toLowerCase())
      );
    }

    if (filters?.query && filters.query.trim() !== '') {
      const q = filters.query.toLowerCase().trim();
      filtered = filtered.filter(
        (m) =>
          m.ai_title.toLowerCase().includes(q) ||
          m.original_text.toLowerCase().includes(q) ||
          m.ai_summary.toLowerCase().includes(q) ||
          m.place.name.toLowerCase().includes(q) ||
          m.place.address.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return filtered;
  },

  getMemoryById: async (id: string): Promise<Memory | null> => {
    const all = getStoredMemories();
    const found = all.find((m) => m.id === id);
    return found || null;
  },

  getNearbyMemories: async (lat: number, lng: number, excludeId: string, limit = 3): Promise<Memory[]> => {
    const all = getStoredMemories();
    const otherMemories = all.filter((m) => m.id !== excludeId);
    
    // Sort by approximate euclidean distance
    otherMemories.sort((a, b) => {
      const distA = Math.pow(a.place.latitude - lat, 2) + Math.pow(a.place.longitude - lng, 2);
      const distB = Math.pow(b.place.latitude - lat, 2) + Math.pow(b.place.longitude - lng, 2);
      return distA - distB;
    });

    return otherMemories.slice(0, limit);
  },

  createMemory: async (data: {
    place: { name: string; address: string; latitude: number; longitude: number };
    original_text: string;
    ai_title: string;
    ai_summary: string;
    tags: string[];
    mood: MoodType;
    visibility: 'public' | 'draft';
    photo_url?: string;
    audio_url?: string;
    audio_duration?: number;
    is_postcard_generated?: boolean;
  }): Promise<Memory> => {
    const all = getStoredMemories();
    const newId = 'mem-' + Date.now().toString(36);
    const placeId = 'plc-' + Date.now().toString(36);

    const place: Place = {
      id: placeId,
      name: data.place.name,
      address: data.place.address,
      latitude: data.place.latitude,
      longitude: data.place.longitude,
      created_at: new Date().toISOString(),
    };

    const newMemory: Memory = {
      id: newId,
      user_id: CURRENT_USER.id,
      user: CURRENT_USER,
      place_id: placeId,
      place,
      original_text: data.original_text,
      ai_title: data.ai_title || 'Untitled Memory',
      ai_summary: data.ai_summary || data.original_text.slice(0, 150) + '...',
      tags: data.tags && data.tags.length > 0 ? data.tags : ['Neighborhood'],
      mood: data.mood || 'Nostalgic',
      visibility: data.visibility || 'public',
      status: 'approved',
      audio_url: data.audio_url,
      audio_duration: data.audio_duration,
      illustration_url: data.photo_url || 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=1200&auto=format&fit=crop&q=80',
      is_postcard_generated: data.is_postcard_generated || false,
      media: data.photo_url ? [
        {
          id: 'med-' + Date.now(),
          memory_id: newId,
          type: data.is_postcard_generated ? 'illustration' : 'photo',
          url: data.photo_url,
        }
      ] : [],
      reactions_count: { heart: 1, warmth: 0, pin: 0 },
      user_reaction: 'heart',
      is_saved: false,
      comments_count: 0,
      comments: [],
      created_at: new Date().toISOString(),
    };

    all.unshift(newMemory);
    saveStoredMemories(all);
    return newMemory;
  },

  toggleReaction: async (memoryId: string, reactionType: 'heart' | 'warmth' | 'pin'): Promise<Memory | null> => {
    const all = getStoredMemories();
    const index = all.findIndex((m) => m.id === memoryId);
    if (index === -1) return null;

    const mem = all[index];
    const reactions = mem.reactions_count || { heart: 0, warmth: 0, pin: 0 };

    if (mem.user_reaction === reactionType) {
      // remove reaction
      mem.user_reaction = null;
      reactions[reactionType] = Math.max(0, (reactions[reactionType] || 1) - 1);
    } else {
      if (mem.user_reaction) {
        reactions[mem.user_reaction] = Math.max(0, (reactions[mem.user_reaction] || 1) - 1);
      }
      mem.user_reaction = reactionType;
      reactions[reactionType] = (reactions[reactionType] || 0) + 1;
    }

    mem.reactions_count = reactions;
    all[index] = mem;
    saveStoredMemories(all);
    return mem;
  },

  toggleSave: async (memoryId: string): Promise<boolean> => {
    const all = getStoredMemories();
    const index = all.findIndex((m) => m.id === memoryId);
    if (index === -1) return false;

    const newState = !all[index].is_saved;
    all[index].is_saved = newState;
    saveStoredMemories(all);
    return newState;
  },

  addComment: async (memoryId: string, content: string): Promise<Comment | null> => {
    const all = getStoredMemories();
    const index = all.findIndex((m) => m.id === memoryId);
    if (index === -1) return null;

    const newComment: Comment = {
      id: 'comm-' + Date.now().toString(36),
      memory_id: memoryId,
      user_id: CURRENT_USER.id,
      user: CURRENT_USER,
      content,
      created_at: new Date().toISOString(),
    };

    if (!all[index].comments) {
      all[index].comments = [];
    }
    all[index].comments?.unshift(newComment);
    all[index].comments_count = (all[index].comments_count || 0) + 1;
    saveStoredMemories(all);
    return newComment;
  },

  getUserStats: async () => {
    const all = getStoredMemories();
    const myMemories = all.filter((m) => m.user_id === CURRENT_USER.id);
    const saved = all.filter((m) => m.is_saved);
    const totalReactions = myMemories.reduce(
      (acc, m) => acc + (m.reactions_count?.heart || 0) + (m.reactions_count?.warmth || 0) + (m.reactions_count?.pin || 0),
      0
    );
    const distinctMoods = new Set(myMemories.map((m) => m.mood)).size;

    return {
      memoriesCount: myMemories.length,
      savedCount: saved.length,
      reactionsReceived: totalReactions,
      distinctMoods,
    };
  },

  resetToDefault: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MEMORIES));
    }
  },
};
