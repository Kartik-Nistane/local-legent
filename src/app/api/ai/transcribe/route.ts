import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/ai-helpers';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided.' },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();

    if (!openai) {
      // In demo/zero-config mode, return a realistic transcribed story
      return NextResponse.json({
        text: "I remember standing right here on a damp November evening. The street lamp was buzzing softly overhead, and the smell of roasting chestnuts was drifting down from the plaza. We were laughing about something foolish we did back in high school, and for five minutes, the entire world felt warm and still.",
        isDemo: true,
      });
    }

    const response = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
    });

    return NextResponse.json({
      text: response.text,
      isDemo: false,
    });
  } catch (error: any) {
    console.error('Transcription API Error:', error);
    return NextResponse.json(
      {
        text: "I remember walking past this exact corner on a quiet evening, when the old sign was lit and the neighborhood was settling down for the night.",
        isDemo: true,
        error: error.message,
      },
      { status: 200 }
    );
  }
}
