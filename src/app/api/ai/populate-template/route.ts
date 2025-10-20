import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function runAiCompletion(prompt: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function POST(request: Request) {
  try {
    const { templateBody, insights } = await request.json();

    if (!templateBody || !insights) {
      return NextResponse.json({ error: 'Missing template body or insights' }, { status: 400 });
    }

    const prompt = `
      You are an expert sales copywriter. Your task is to personalize an email template using a provided set of research insights about a prospect.

      **Instructions:**
      1.  Read the email template provided by the user.
      2.  Read the research insights about the prospect.
      3.  Intelligently replace the placeholders in the template (e.g., {{companyName}}, {{painPoint}}, {{firstName}}) with the relevant information from the insights.
      4.  Do NOT invent any information. If an insight for a placeholder is not available, leave the placeholder as is.
      5.  Ensure the final email is natural, fluent, and maintains the original tone of the template.
      6.  Return ONLY the populated email body, without any extra text, greetings, or explanations.

      **Email Template:**
      ---
      ${templateBody}
      ---

      **Research Insights:**
      ---
      ${insights}
      ---

      **Populated Email Body:**
    `;

    const populatedBody = await runAiCompletion(prompt);

    return NextResponse.json({ populatedBody });

  } catch (error) {
    console.error('Error populating email template:', error);
    return NextResponse.json({ error: 'Failed to populate email template' }, { status: 500 });
  }
}