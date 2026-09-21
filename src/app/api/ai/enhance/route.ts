import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient, generateLocalEnhancement } from '@/lib/ai-helpers';
import { MoodType } from '@/lib/types';

const VALID_MOODS: MoodType[] = [
  'Nostalgic',
  'Food',
  'Hidden Gem',
  'Student Life',
  'History',
  'Romance',
  'Nature',
];

export async function POST(req: NextRequest) {
  try {
    const { story, placeName } = await req.json();

    if (!story || typeof story !== 'string' || story.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please provide a story with at least a few words.' },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();

    // If no OpenAI client or API key is available, use our high quality local analyzer
    if (!openai) {
      const fallbackResult = generateLocalEnhancement(story, placeName || 'this place');
      return NextResponse.json(fallbackResult);
    }

    // 1. Content Moderation Check
    try {
      const moderation = await openai.moderations.create({ input: story });
      const isFlagged = moderation.results?.[0]?.flagged;
      if (isFlagged) {
        return NextResponse.json(
          {
            error: 'This story contains content that violates community safety standards and cannot be published.',
            isModeratedSafe: false,
          },
          { status: 422 }
        );
      }
    } catch (modErr) {
      console.warn('Moderation check skipped or encountered error:', modErr);
    }

    // 2. Structured AI Enhancement
    const systemPrompt = `You are an editorial archivist and literary curator for "Local Legend", a warm community memory map.
Given a raw personal story attached to a place, transform it into an editorial memory entry.
Requirements:
1. "title": An evocative, memorable 4 to 8 word title capturing the emotional core of the experience.
2. "summary": A faithful, gentle 2 to 3 sentence summary honoring the writer's authentic voice. Do not sensationalize or invent details.
3. "tags": An array of 3 to 5 descriptive, evocative tags.
4. "mood": Exactly one mood selected STRICTLY from this list: ["Nostalgic", "Food", "Hidden Gem", "Student Life", "History", "Romance", "Nature"].

Respond strictly with valid JSON:
{
  "title": "string",
  "summary": "string",
  "tags": ["string"],
  "mood": "string"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Place: ${placeName || 'Neighborhood location'}\nOriginal Story: ${story}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(content);

    // Validate mood
    let mood: MoodType = 'Nostalgic';
    if (VALID_MOODS.includes(parsed.mood)) {
      mood = parsed.mood;
    }

    return NextResponse.json({
      title: parsed.title || `Memories at ${placeName}`,
      summary: parsed.summary || story.slice(0, 160) + '...',
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : ['Neighborhood'],
      mood,
      isModeratedSafe: true,
    });
  } catch (error: any) {
    console.error('Enhance API Error:', error);
    // Graceful fallback if OpenAI call fails (e.g. invalid key or network issue)
    const { story, placeName } = await req.clone().json().catch(() => ({ story: '', placeName: '' }));
    const fallback = generateLocalEnhancement(story || '', placeName || 'this place');
    return NextResponse.json(fallback);
  }
}
