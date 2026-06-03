import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a helpful wellness and nutrition assistant for Lee, a woman focused on health, productivity, and building her online business.

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
Keep it simple and encouraging!`;

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(message);
    const text = result.response.text();

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
