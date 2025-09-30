import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';
import { caseStudies } from '@/lib/case-studies';

async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    // Remove script, style, and other non-visible elements to clean up the text
    $('script, style, noscript, iframe').remove();
    // Add a newline after block-level elements to preserve some structure
    $('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, div').after('\n');
    // Extract text from the body
    const bodyText = $('body').text();
    // Clean up whitespace and multiple newlines
    return bodyText.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n').trim();
  } catch (error) {
    console.error('Error fetching website content:', error);
    throw new Error('Could not retrieve content from the provided URL. Please check if the URL is correct and accessible.');
  }
}

export async function POST(req: Request) {
  const { url } = await req.json();

  if (!url) {
    return new Response(JSON.stringify({ message: 'URL is required' }), { status: 400 });
  }

  try {
    const websiteText = await fetchWebsiteContent(url);

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Your task is to analyze the provided website text and provide structured insights for cold outreach preparation. Base your analysis *only* on the text provided below.

You are an AI research and sales assistant for Business Growth Global, Through their signature framework, AEROPS (Analyse, Expand, Revenue, Operations, People, Success), they deliver bespoke solutions to transform businesses. Specialising in helping clients increase profitability, build high-performance teams, and develop actionable plans for long-term growth. Whether you’re a startup, founder, small business owner, or corporate executive, they create strategies, systems and processes designed to meet the companies unique challenges and goals. empowering business owners, entrepreneurs, and executives to achieve strategic business growth and unlock their full potential.

For the company described in the text, provide the following sections in this exact format:

**Industry:** [Primary industry]

**Full Company Name:** [Official name]

**Summary:** [1–2 sentences summarizing the company’s business, target customers, and differentiators based *only* on the provided text]

**Recent Developments:** [From the text, identify any press releases, news, or case studies. Prioritize funding rounds, leadership changes, partnerships, product launches, or expansions. Summarize 1–2 key points.]

**How Business Growth Global Could Help:** [Write a sales-oriented point connecting the company’s current stage and challenges (inferred from the text) to how the AEROPS Framework can help them scale efficiently.]

**Outreach Hook Example:** [Craft a one-sentence cold outreach hook that references the company’s services or recent developments from the text. Humanise this sentence with the conversational conversational tone of an expert sales person]

**Case Study to Reference:** [Analyze the company's industry and challenges and recommend the most relevant case study from the list provided below. Explain in 2-3 sentences how the challenges and solutions in the case study apply to the company being researched, making a clear connection between the case study and the company's specific situation.]

**Contact Information (if available):** [Extract any Phone, email, website, HQ, and LinkedIn from the text.]

**Referenced URLs:** [List the full URLs of any pages referenced for case studies, blogs, or news. If no specific pages were referenced, state "N/A".]

Rules:
- Base your analysis *strictly* on the text provided. Do not use any external knowledge.
- If the text is unclear or insufficient, state that you cannot provide a complete analysis.
- Ensure each section is separated by a blank line.

Case Studies:
---
${JSON.stringify(caseStudies, null, 2)}
---

Website Text to Analyze:
---
${websiteText.substring(0, 10000)}
---
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return new Response(JSON.stringify({ output: text }), { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /api/talking-points:', error);
    return new Response(JSON.stringify({ message: error.message || 'An error occurred while generating insights.' }), { status: 500 });
  }
}