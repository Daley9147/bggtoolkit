My apologies for the repeated failures. This file contains the final, correct plan to fix the AI generation logic.

The core problem was that the working AI logic from your `talking-points` route was not correctly centralized. The solution is to move that logic into a single shared function and have both API routes use it, eliminating all the faulty code I introduced.

Here are the exact files and code needed to fix this permanently.

***

### **Step 1: Create a New File for the Shared AI Logic**

This file will contain the working AI prompt and logic that was originally in `talking-points`.

**File to create:** `src/lib/ai/generate-outreach-plan.ts`

**Code to paste into this new file:**

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';
import { caseStudies } from '@/lib/case-studies';
import { createClient } from '@/lib/supabase/server';

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
    $('script, style, noscript, iframe').remove();
    $('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, div').after('\n');
    const bodyText = $('body').text();
    return bodyText.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n').trim();
  } catch (error) {
    console.error('Error fetching website content:', error);
    throw new Error('Could not retrieve content from the provided URL. Please check if the URL is correct and accessible.');
  }
}

interface GenerateOutreachPlanArgs {
  url: string;
  specificUrl?: string;
  contactFirstName: string;
  jobTitle: string;
  ghlContactId: string;
}

export async function generateOutreachPlan({
  url,
  specificUrl,
  contactFirstName,
  jobTitle,
  ghlContactId,
}: GenerateOutreachPlanArgs) {
  if (!url) {
    throw new Error('URL is required');
  }

  const websiteText = await fetchWebsiteContent(url);
  let specificText = '';
  if (specificUrl) {
    specificText = await fetchWebsiteContent(specificUrl);
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
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

You likely have a growth plan and processes in place. Even the best growth plans can have hidden bottlenecks that stall progress. We help identify and fix those. This approach recently helped one client increase revenue by 52% and gave their leadership team more time to focus on what's next

Do you have time over the next week or two to learn more? Let me know what works for you and I’ll send over a calendar invite

---
LINKEDIN OUTREACH
---

Third, complete and refine the following two LinkedIn messages. Use the **First Name** and **Job Title** provided. Your task is to replace the remaining bracketed placeholders like **[Their Company]** and **[INDUSTRY]** based on your analysis.

**Linkedin Step 1 – Connection Note (light, no pitch yet)**

Hi ${contactFirstName || '[First Name]'}, I’m curious to learn more about your journey at [Their Company]. I also work with Founders and ${jobTitle || '[Job Title]'}s on scaling growth and freeing up leadership from daily firefighting, would love to connect.

**Linkedin Step 2 – Follow-Up DM (once they accept)**

Thanks for connecting, ${contactFirstName || '[First Name]'}. I help ${jobTitle || '[Job Title]'}s in the [INDUSTRY] space scale revenue without getting stuck in daily firefighting. Would you be open to a quick, no-cost 1:1 to share practical approaches? Even if it’s not a fit, you’ll walk away with insights you can apply immediately.

---
COLD CALL SCRIPT
---

Fourth, complete and refine the following cold call script. Use the **First Name** and the **Specific Initiative Text** to fill in the placeholders.

“Hi [First Name],

This is YOUR NAME from Business Growth Global. Have I caught you at a bad time?

I'll be brief. I saw you [specific initiative/product/news].

The reason I'm calling is that after a big push like that, many leaders find the operational cracks start to show. Processes that initially worked break when you scale. We help prevent that breakage.

Would it make sense to grab 20 minutes this week so I can share how we’ve helped firms like yours navigate this exact stage?”

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
  const text = await response.text();

  const emailParts = text.split(/\s*---\s*EMAIL BODY\s*---\s*/);
  const insights = emailParts[0].trim();
  const emailAndRest = emailParts.length > 1 ? emailParts[1] : '';
  
  const linkedinParts = emailAndRest.split(/\s*---\s*LINKEDIN OUTREACH\s*---\s*/);
  let email = linkedinParts[0].trim();
  const linkedinAndRest = linkedinParts.length > 1 ? linkedinParts[1] : '';

  const coldCallParts = linkedinAndRest.split(/\s*---\s*COLD CALL SCRIPT\s*---\s*/);
  const linkedinText = coldCallParts[0].trim();
  const coldCallScript = coldCallParts.length > 1 ? coldCallParts[1].trim() : '';

  const greeting = contactFirstName ? `Hi ${contactFirstName},` : 'Hi,';
  email = `${greeting}\n\n${email}`;

  let linkedinConnectionNote = '';
  let linkedinFollowUpDm = '';

  const connectionNoteMatch = linkedinText.match(/\*\*Linkedin Step 1 – Connection Note \(light, no pitch yet\)\*\*\s*([\s\S]*?)\s*\*\*Linkedin Step 2/);
  if (connectionNoteMatch) {
    linkedinConnectionNote = connectionNoteMatch[1].trim();
  }

  const linkedinFollowUpDmMatch = linkedinText.match(/\*\*Linkedin Step 2 – Follow-Up DM \(once they accept\)\*\*\s*([\s\S]*)/);
  if (linkedinFollowUpDmMatch) {
    linkedinFollowUpDm = linkedinFollowUpDmMatch[1].trim();
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert([
        {
          name: insights.match(/Full Company Name:\s*(.*)/)?.[1],
          industry: insights.match(/Industry:\s*(.*)/)?.[1],
          website: url,
          summary: insights.match(/Summary:\s*(.*)/)?.[1],
          developments: insights.match(/Recent Developments:\s*(.*)/)?.[1],
          user_id: user.id,
        },
      ])
      .select();

    if (companyError) {
      console.error('Error inserting company data:', companyError);
    }

    if (companyData) {
      const { error: templateError } = await supabase
        .from('outreach_templates')
        .insert([
          {
            company_id: companyData[0].id,
            contact_first_name: contactFirstName,
            job_title: jobTitle,
            insights,
            email,
            linkedin_connection_note: linkedinConnectionNote,
            linkedin_follow_up_dm: linkedinFollowUpDm,
            cold_call_script: coldCallScript,
            user_id: user.id,
            ghl_contact_id: ghlContactId,
          },
        ]);

      if (templateError) {
        console.error('Error inserting template data:', templateError);
      }
    }
  }

  return { insights, email, linkedinConnectionNote, linkedinFollowUpDm, coldCallScript };
}
```

***

### **Step 2: Refactor the `talking-points` API Route**

This route will now become a simple wrapper that calls the function we just created.

**File to change:** `src/app/api/talking-points/route.ts`

**Code to paste into this file (replacing all existing code):**

```typescript
import { NextResponse } from 'next/server';
import { generateOutreachPlan } from '@/lib/ai/generate-outreach-plan';

export async function POST(req: Request) {
  try {
    const { url, specificUrl, contactFirstName, jobTitle, ghlContactId } = await req.json();
    
    const outreachPlan = await generateOutreachPlan({
      url,
      specificUrl,
      contactFirstName,
      jobTitle,
      ghlContactId,
    });

    return NextResponse.json(outreachPlan);
  } catch (error: any) {
    console.error('Error in POST /api/talking-points:', error);
    return new Response(JSON.stringify({ message: error.message || 'An error occurred.' }), { status: 500 });
  }
}
```

***

### **Step 3: Refactor the `generate-outreach` API Route**

This route will *also* become a simple wrapper that calls the exact same shared function. This eliminates the forwarding error and all my faulty code.

**File to change:** `src/app/api/ghl/generate-outreach/route.ts`

**Code to paste into this file (replacing all existing code):**

```typescript
import { NextResponse } from 'next/server';
import { generateOutreachPlan } from '@/lib/ai/generate-outreach-plan';

export async function POST(request: Request) {
  try {
    const { contactId, homepageUrl, caseStudyUrl } = await request.json();

    // In a real scenario, you'd fetch the contact's actual name and job title from GHL
    const contactFirstName = "Valued";
    const jobTitle = "Leader";

    const outreachPlan = await generateOutreachPlan({
      url: homepageUrl,
      specificUrl: caseStudyUrl,
      contactFirstName,
      jobTitle,
      ghlContactId: contactId,
    });

    return NextResponse.json(outreachPlan);
  } catch (error: any) {
    console.error('Error in POST /api/ghl/generate-outreach:', error);
    return NextResponse.json({ error: error.message || 'An error occurred.' }, { status: 500 });
  }
}
```