import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/ai-helpers';

// Curated high quality artistic vintage postcard illustrations for instant zero-config testing
const POSTCARD_FALLBACKS = [
  'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&auto=format&fit=crop&q=80',
];

export async function POST(req: NextRequest) {
  try {
    const { storyTitle, placeName, storySummary } = await req.json();

    const openai = getOpenAIClient();

    const curatedPrompt = `Vintage travel postcard illustration of ${placeName || 'a historic neighborhood'}. Theme: ${storyTitle || 'Local memory'}, ${storySummary || ''}. Style: 1950s linocut and watercolor print on textured parchment paper, warm terracotta, sage green, ochre tones, nostalgic editorial travel archive aesthetic, artistic illustration, no modern photographic noise.`;

    if (!openai) {
      // Pick random fallback illustration
      const randomIdx = Math.floor(Math.random() * POSTCARD_FALLBACKS.length);
      return NextResponse.json({
        imageUrl: POSTCARD_FALLBACKS[randomIdx],
        prompt: curatedPrompt,
        isDemo: true,
      });
    }

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: curatedPrompt,
      n: 1,
      size: '1024x1024',
      style: 'vivid',
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('No image returned from DALL-E');
    }

    return NextResponse.json({
      imageUrl,
      prompt: curatedPrompt,
      isDemo: false,
    });
  } catch (error: any) {
    console.error('Postcard API Error:', error);
    const randomIdx = Math.floor(Math.random() * POSTCARD_FALLBACKS.length);
    return NextResponse.json({
      imageUrl: POSTCARD_FALLBACKS[randomIdx],
      prompt: 'Vintage archival postcard illustration',
      isDemo: true,
      error: error.message,
    });
  }
}
