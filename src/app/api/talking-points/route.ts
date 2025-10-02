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
  const { url, specificUrl, contactFirstName, jobTitle } = await req.json();

  if (!url) {
    return new Response(JSON.stringify({ message: 'URL is required' }), { status: 400 });
  }

  try {
    const websiteText = await fetchWebsiteContent(url);
    let specificText = '';
    if (specificUrl) {
      specificText = await fetchWebsiteContent(specificUrl);
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Your task is to analyze the provided website text from two sources: a primary company website and a specific initiative page (e.g., product, news). Provide structured insights and a personalized email draft. Base your analysis *only* on the text provided.

You are an AI research and sales assistant for Business Growth Global. Through their signature framework, AEROPS (Analyse, Expand, Revenue, Operations, People, Success), they deliver bespoke solutions to transform businesses. Specialising in helping clients increase profitability, build high-performance teams, and develop actionable plans for long-term growth.

First, provide the following sections based on the **Primary Website Text**:

**Industry:** [Primary industry]

**Full Company Name:** [Official name]

**Summary:** [1–2 sentences summarizing the company’s business, target customers, and differentiators]

**Recent Developments:** [From the text, identify any press releases, news, or case studies. Prioritize funding rounds, leadership changes, partnerships, product launches, or expansions. Summarize 1–2 key points.]

**How Business Growth Global Could Help:** [Write a sales-oriented point connecting the company’s current stage and challenges to how the AEROPS Framework can help them scale efficiently.]

**Outreach Hook Example:** [Craft a one-sentence cold outreach hook. **Prioritize the Specific Initiative Text** for this, otherwise use the Primary Website Text.]

**Case Study to Reference:** [Analyze the company's industry and challenges and recommend the most relevant case study from the list provided below. Explain in 2-3 sentences how the challenges and solutions in the case study apply to the company being researched.]

**Contact Information (if available):** [Extract any Phone, email, website, HQ, and LinkedIn from the text.]

**Referenced URLs:** [List the full URLs of any pages referenced for case studies, blogs, or news.]

---
EMAIL BODY
---

Second, draft a personalized cold outreach email. 
- **Do not include a greeting (like "Hi," or "Hi David,").** The email should start with the first sentence.
- If a **Job Title** is provided, subtly reference their role or potential responsibilities in the email body to make it more relevant.
- Use the **Specific Initiative Text** to personalize the first paragraph.

I’ve been following [COMPANY]’s work with [specific initiative/product/news from the **Specific Initiative Text**], and it looks like revenue growth is a key focus right now.

Many of our partners tell us the challenge isn’t finding growth opportunities, but scaling revenue profitably without adding operational drag. For example, we recently helped a founder led company grow revenue +52% while freeing the ${jobTitle || 'CEO'} from daily bottlenecks.

At Business Growth Global, we’ve worked with high-growth companies to:
- Reduce operational drag to unlock faster revenue growth
- Free leadership time to focus on strategy, not firefighting
- Balance ambitious growth with reduced risk exposure

Would you be open to a 20-minute call where I can share the core approach? Even if it’s not a fit, you’ll leave with practical insights you can apply immediately.

---

Rules:
- Base your analysis *strictly* on the texts provided. Do not use any external knowledge.
- If the Specific Initiative Text is available, use it as the primary source for the email's opening line.
- For the bulleted list in the email, use Markdown formatting (e.g., "- List item").
- If any text is unclear or insufficient, state that you cannot provide a complete analysis.

Case Studies:
---
${JSON.stringify(caseStudies, null, 2)}
---

Primary Website Text to Analyze:
---
${websiteText.substring(0, 10000)}
---

${specificText ? `
Specific Initiative Text to Analyze:
---
${specificText.substring(0, 10000)}
---
` : ''}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Split the response into insights and email
    const parts = text.split(/\s*---\s*EMAIL BODY\s*---\s*/);
    const insights = parts[0].trim();
    let email = parts.length > 1 ? parts[1].trim() : '';

    // Prepend the correct greeting
    const greeting = contactFirstName ? `Hi ${contactFirstName},` : 'Hi,';
    email = `${greeting}\n\n${email}`;


    return new Response(JSON.stringify({ insights, email }), { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /api/talking-points:', error);
    return new Response(JSON.stringify({ message: error.message || 'An error occurred while generating insights.' }), { status: 500 });
  }
}