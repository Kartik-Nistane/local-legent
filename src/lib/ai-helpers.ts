import OpenAI from 'openai';
import { MoodType, AIEnhanceResponse } from './types';

const VALID_MOODS: MoodType[] = [
  'Nostalgic',
  'Food',
  'Hidden Gem',
  'Student Life',
  'History',
  'Romance',
  'Nature',
];

export function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-your-')) {
    return null;
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Intelligent fallback generator when OpenAI key is not configured.
 * Analyzes story text to create authentic, editorial metadata.
 */
export function generateLocalEnhancement(story: string, placeName: string): AIEnhanceResponse {
  const lower = story.toLowerCase();
  
  // Detect mood based on keyword heuristics
  let mood: MoodType = 'Nostalgic';
  if (lower.includes('food') || lower.includes('eat') || lower.includes('coffee') || lower.includes('chai') || lower.includes('pastry') || lower.includes('wine') || lower.includes('dinner') || lower.includes('taste') || lower.includes('cannoli')) {
    mood = 'Food';
  } else if (lower.includes('love') || lower.includes('romantic') || lower.includes('kiss') || lower.includes('partner') || lower.includes('sunset') || lower.includes('dusk') || lower.includes('holding hands')) {
    mood = 'Romance';
  } else if (lower.includes('college') || lower.includes('dorm') || lower.includes('exam') || lower.includes('student') || lower.includes('study') || lower.includes('campus') || lower.includes('friends') || lower.includes('roommate')) {
    mood = 'Student Life';
  } else if (lower.includes('secret') || lower.includes('alley') || lower.includes('tucked away') || lower.includes('hidden') || lower.includes('quiet') || lower.includes('lantern') || lower.includes('canal')) {
    mood = 'Hidden Gem';
  } else if (lower.includes('tree') || lower.includes('ocean') || lower.includes('mountain') || lower.includes('sea') || lower.includes('park') || lower.includes('fog') || lower.includes('rain') || lower.includes('garden')) {
    mood = 'Nature';
  } else if (lower.includes('century') || lower.includes('ancient') || lower.includes('historic') || lower.includes('years ago') || lower.includes('war') || lower.includes('bookstore') || lower.includes('heritage') || lower.includes('19')) {
    mood = 'History';
  }

  // Extract sensory words for title
  const words = story.split(/\s+/).filter((w) => w.length > 4);
  const cleanPlace = placeName.replace(/[^a-zA-Z0-9\s]/g, '').trim();

  let title = '';
  if (story.length < 50) {
    title = `Moments at ${cleanPlace || 'the Neighborhood Corner'}`;
  } else if (mood === 'Nostalgic') {
    title = `Echoes of Yesterday at ${cleanPlace || 'this Quiet Street'}`;
  } else if (mood === 'Food') {
    title = `Warm Aromas and Table Stories at ${cleanPlace}`;
  } else if (mood === 'Romance') {
    title = `A Twilight Encounter by ${cleanPlace}`;
  } else if (mood === 'Hidden Gem') {
    title = `The Secret Rhythm of ${cleanPlace}`;
  } else if (mood === 'History') {
    title = `Timeless Footsteps through ${cleanPlace}`;
  } else {
    title = `Memories Under the Open Sky at ${cleanPlace}`;
  }

  // Generate a faithful 2-3 sentence summary
  const sentences = story
    .replace(/([.?!])\s*(?=[A-Z])/g, '$1|')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);

  let summary = '';
  if (sentences.length <= 2) {
    summary = story.trim();
  } else {
    summary = `${sentences[0]} ${sentences[1]} The experience remains deeply anchored in the memory of ${cleanPlace || 'this place'}.`;
  }

  // Generate 3-5 tags
  const potentialTags = [
    cleanPlace,
    mood,
    'Neighborhood Archive',
    'Street Story',
    'Personal Memory',
  ];
  if (lower.includes('coffee') || lower.includes('espresso')) potentialTags.push('Coffee Culture');
  if (lower.includes('rain') || lower.includes('storm')) potentialTags.push('Rainy Days');
  if (lower.includes('music') || lower.includes('song')) potentialTags.push('Soundtrack');
  if (lower.includes('night') || lower.includes('midnight')) potentialTags.push('Nightwalks');
  if (lower.includes('book') || lower.includes('library')) potentialTags.push('Literary');

  const tags = Array.from(new Set(potentialTags.filter(Boolean))).slice(0, 4);

  return {
    title,
    summary,
    tags,
    mood,
    isModeratedSafe: true,
  };
}
