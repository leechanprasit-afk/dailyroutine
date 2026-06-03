import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: `You are a helpful wellness and nutrition assistant for Lee, a woman focused on health, productivity, and building her online business.

Your role:
- Suggest high-protein, easy-to-prepare meal ideas
- Give simple healthy recipes with common ingredients
- Provide encouragement and wellness tips
- Help with focus and productivity questions
- Keep answers SHORT and practical (3-5 sentences max unless recipe)
- Be warm, friendly, and supportive
- Always answer in the same language the user writes in (Thai or English)

For recipes: give ingredient list + simple steps
For meal ideas: suggest 2-3 options with protein content
Keep it simple and encouraging!`,
      messages: [
        { role: 'user', content: message }
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
