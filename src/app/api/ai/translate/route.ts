import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/ai-helpers';

export async function POST(req: NextRequest) {
  try {
    const { text, targetLanguage } = await req.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and targetLanguage are required.' },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();

    if (!openai) {
      // Demo translation fallback
      const mockTranslations: Record<string, string> = {
        'Spanish': `Recuerdo estar parado aquí en una tarde húmeda de noviembre. El aroma de las castañas asadas flotaba desde la plaza y, durante unos minutos, todo el mundo parecía cálido y en calma.`,
        'French': `Je me souviens m'être tenu exactement ici par un après-midi humide de novembre. L'odeur des marrons chauds descendait de la place, et pendant un instant, le monde entier semblait doux et paisible.`,
        'Japanese': `11月の肌寒い夕暮れ、この場所に立っていたのを覚えています。広場から漂う焼き栗の香りと共に、世界が静かで温かい安らぎに包まれていました。`,
        'Italian': `Ricordo di essere rimasto qui in un umido pomeriggio di novembre. Il profumo delle caldarroste saliva dalla piazza e il tempo sembrava essersi fermato.`,
        'Portuguese': `Lembro-me de estar aqui numa tarde húmida de novembro. O aroma a castanhas assadas descia da praça, e o mundo inteiro parecia calmo e acolhedor.`,
      };

      return NextResponse.json({
        translatedText: mockTranslations[targetLanguage] || `[${targetLanguage} Translation]: ${text}`,
        language: targetLanguage,
        isDemo: true,
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a sensitive literary translator. Translate this personal neighborhood story faithfully into ${targetLanguage}. Maintain the nostalgic tone, emotional rhythm, and personal voice. Output ONLY the translated story without commentary.`,
        },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
    });

    const translatedText = completion.choices[0]?.message?.content || text;

    return NextResponse.json({
      translatedText,
      language: targetLanguage,
      isDemo: false,
    });
  } catch (error: any) {
    console.error('Translate API Error:', error);
    return NextResponse.json(
      { error: 'Failed to translate story.' },
      { status: 500 }
    );
  }
}
