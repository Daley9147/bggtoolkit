import 'server-only';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';
import { caseStudies } from '@/lib/case-studies';
import { createClient } from '@/lib/supabase/server';
import { fetchNonProfitData } from '@/lib/propublica/api';
import { fetchUKNonProfitData } from '@/lib/charity-commission/api';
import { forProfitPrompt } from './prompts/for-profit.prompt';
import { nonProfitPrompt } from './prompts/non-profit.prompt';
import { nonProfitUkPrompt } from './prompts/non-profit-uk.prompt';
import { vcBackedPrompt } from './prompts/vc-backed.prompt';
import { partnershipPrompt } from './prompts/partnership.prompt';

export async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Upgrade-Insecure-Requests': '1',
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
  ghlContactId?: string;
  organizationType: 'for-profit' | 'non-profit' | 'non-profit-uk' | 'vc-backed' | 'partnership';
  nonProfitIdentifier?: string;
  userInsight?: string;
  fundingAnnouncementUrl?: string;
  leadVc?: string;
  firmWebsiteUrl?: string;
  partnerLinkedInUrl?: string;
  recentInvestmentArticleUrl?: string;
}

export async function generateOutreachPlan({
  url,
  specificUrl,
  contactFirstName,
  jobTitle,
  ghlContactId,
  organizationType,
  nonProfitIdentifier,
  userInsight,
  fundingAnnouncementUrl,
  leadVc,
  firmWebsiteUrl,
  partnerLinkedInUrl,
  recentInvestmentArticleUrl,
}: GenerateOutreachPlanArgs) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const modelName = organizationType === 'partnership' 
    ? 'gemini-3-flash-preview' // Adhering to project guidelines to use gemini-3-flash-preview
    : 'gemini-3-flash-preview';
  const model = genAI.getGenerativeModel({ model: modelName });

  // Validation
  if (organizationType === 'partnership' && !firmWebsiteUrl) {
    throw new Error('Firm Website URL is required for Partnerships');
  }

  let websiteText = '';
  if (organizationType === 'partnership' && firmWebsiteUrl) {
    websiteText = await fetchWebsiteContent(firmWebsiteUrl);
  } else if (url) {
    websiteText = await fetchWebsiteContent(url);
  }

  let specificText = '';
  if (organizationType === 'partnership' && partnerLinkedInUrl) {
    specificText = await fetchWebsiteContent(partnerLinkedInUrl);
  } else if (organizationType === 'vc-backed' && fundingAnnouncementUrl) {
    specificText = await fetchWebsiteContent(fundingAnnouncementUrl);
  } else if (specificUrl) {
    specificText = await fetchWebsiteContent(specificUrl);
  }

  let recentInvestmentText = '';
  if (organizationType === 'partnership' && recentInvestmentArticleUrl) {
    recentInvestmentText = await fetchWebsiteContent(recentInvestmentArticleUrl);
  }

  let financialsText = '';
  let organizationNameText = '';

  if (organizationType === 'non-profit' && nonProfitIdentifier) {
    organizationNameText = `**Organization Name:** ${nonProfitIdentifier}`;
    const financials = await fetchNonProfitData(nonProfitIdentifier);
    console.log('--- ProPublica API Result ---', financials);

    if (financials) {
      financialsText = `
- **Total Revenue:** ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financials.revenue)}
- **Total Expenses:** ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financials.expenses)}
- **Net Income:** ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financials.net_income)}
      `;
    } else {
      financialsText = '\n- Financial data not available from ProPublica.';
    }
    console.log('--- Formatted Financials Text ---', financialsText);
  }

  if (organizationType === 'non-profit-uk' && nonProfitIdentifier) {
    organizationNameText = `**Organization Name:** ${nonProfitIdentifier}`;
    const financials = await fetchUKNonProfitData(nonProfitIdentifier);
    console.log('--- Charity Commission API Result ---', financials);

    if (financials && financials.length > 0) {
      financialsText = financials.map(f => `
- **Financial Year End:** ${new Date(f.financialYearEnd).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
- **Total Revenue:** ${new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(f.revenue)}
- **Total Spending:** ${new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(f.spending)}
- **Net Income:** ${new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(f.income)}
      `).join('\n');
    } else {
      financialsText = '\n- Financial data not available from Charity Commission.';
    }
    console.log('--- Formatted Financials Text ---', financialsText);
  }

  let prompt;
  switch (organizationType) {
    case 'non-profit':
      prompt = nonProfitPrompt;
      break;
    case 'non-profit-uk':
      prompt = nonProfitUkPrompt;
      break;
    case 'vc-backed':
      prompt = vcBackedPrompt;
      break;
    case 'partnership':
      prompt = partnershipPrompt;
      break;
    default:
      prompt = forProfitPrompt;
      break;
  }

  const fullPrompt = `${prompt}

${userInsight ? `
User's Key Insight (This is the most important information, build your analysis around this):
---
${userInsight}
---
` : ''}

${organizationType !== 'partnership' ? `
Case Studies:
---
${JSON.stringify(caseStudies, null, 2)}
---
` : ''}

${organizationNameText ? `
User Input:
---
${organizationNameText}
---
` : ''}

Primary Website Text to Analyze:
---
${websiteText.substring(0, 10000)}
---

${specificText ? `
${organizationType === 'vc-backed' ? 'Funding Announcement Text to Analyze:' : ''}
${organizationType === 'partnership' ? "Partner's LinkedIn Profile Text to Analyze:" : ''}
${organizationType === 'for-profit' || organizationType === 'non-profit' ? 'Specific Initiative Text to Analyze:' : ''}
---
${specificText.substring(0, 10000)}
---
` : ''}

${recentInvestmentText ? `
Recent Investment Article Text to Analyze:
---
${recentInvestmentText.substring(0, 10000)}
---
` : ''}

${financialsText ? `
Financial Data to Analyze:
---
${financialsText}
---
` : ''}
`;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  const text = await response.text();
  
  // Definitive, index-based parsing logic
  const sections: { [key: string]: string } = {};
  const headers = [
    "EMAIL SUBJECT LINES",
    "EMAIL BODY",
    "LINKEDIN OUTREACH",
    "COLD CALL SCRIPT",
    "FOLLOW-UP EMAIL SUBJECT LINES",
    "FOLLOW-UP EMAIL BODY"
  ];

  // Find all header positions
  const headerPositions = headers.map(header => {
    const regex = new RegExp(`\\s*(---\\s*)?${header}(\\s*---)?\\s*`);
    const match = text.match(regex);
    return match ? { header, index: match.index!, length: match[0].length } : null;
  }).filter(Boolean) as { header: string, index: number, length: number }[];

  // Extract insights (content before the first header)
  const firstHeaderIndex = headerPositions.length > 0 ? headerPositions[0].index : text.length;
  sections["insights"] = text.substring(0, firstHeaderIndex).trim();

  // Extract content between headers
  for (let i = 0; i < headerPositions.length; i++) {
    const current = headerPositions[i];
    const next = headerPositions[i + 1];
    const start = current.index + current.length;
    const end = next ? next.index : text.length;
    sections[current.header] = text.substring(start, end).trim();
  }

  const parseJsonSafe = (jsonString: string): string[] => {
    if (!jsonString) return ["Default Subject Line"];
    
    // Remove markdown code blocks if present
    let cleanedString = jsonString.replace(/```json\n?|```/g, '').trim();
    
    // Attempt to fix common JSON errors (like trailing commas) before parsing
    // This regex looks for a comma followed by closing bracket/brace and removes the comma
    cleanedString = cleanedString.replace(/,(\s*[}\]])/g, '$1');

    try {
      const parsed = JSON.parse(cleanedString);
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
        return parsed;
      } else {
         console.warn("Parsed JSON is not a string array:", parsed);
         return ["Default Subject Line"];
      }
    } catch (e) {
      console.error("Failed to parse JSON:", cleanedString, e);
      // Fallback: try to extract strings if it looks like a list but failed strict parsing
      // e.g., ["Subject 1", "Subject 2",]
      const matches = cleanedString.match(/"([^"]+)"/g);
      if (matches && matches.length > 0) {
          return matches.map(m => m.replace(/^"|"$/g, ''));
      }
      return ["Default Subject Line"];
    }
  };

  let insights = sections["insights"] || '';
  // Final cleanup for AI-specific markers
  insights = insights.replace('[INSIGHTS]', '').trim();

  const subjectLinesRaw = sections["EMAIL SUBJECT LINES"] || '[]';
  let email = sections["EMAIL BODY"] || '';
  const linkedinText = sections["LINKEDIN OUTREACH"] || '';
  const coldCallScript = sections["COLD CALL SCRIPT"] || '';
  const followUpSubjectLinesRaw = sections["FOLLOW-UP EMAIL SUBJECT LINES"] || '[]';
  const followUpEmailBody = sections["FOLLOW-UP EMAIL BODY"] || '';

  // Clean up potential AI errors
  // Remove duplicated outreach hook example if it exists anywhere in the insights
  const hookRegex = /\s*\**Outreach Hook Example\**\s*:?[\s\S]*?$/gmi;
  if (insights.match(hookRegex)) {
    insights = insights.replace(hookRegex, '');
  }

  let finalInsights = insights;

  let subjectLines: string[] = parseJsonSafe(subjectLinesRaw);
  if (subjectLines.length === 0) {
    subjectLines = ["Error: Could not generate subject lines"]; // Provide a helpful fallback
  }

  let followUpEmailSubjectLines: string[] = parseJsonSafe(followUpSubjectLinesRaw);
  if (followUpEmailSubjectLines.length === 0) {
    followUpEmailSubjectLines = ["Error: Could not generate subject lines"]; // Provide a helpful fallback
  }

  const greeting = contactFirstName ? `Hi ${contactFirstName},` : 'Hi,';
  email = `${greeting}\n\n${email}`;

  let linkedinConnectionNote = '';
  let linkedinFollowUpDm = '';

  if (linkedinText) {
    const connectionNoteMatch = linkedinText.match(/\*\*Linkedin Step 1 – Connection Note.*?\*\*\s*([\s\S]*?)(?=\*\*Linkedin Step 2 – Follow-Up DM|$)/);
    const followUpDmMatch = linkedinText.match(/\*\*Linkedin Step 2 – Follow-Up DM.*?\*\*\s*([\s\S]*)/);

    if (connectionNoteMatch) {
      linkedinConnectionNote = connectionNoteMatch[1].trim();
    }
    if (followUpDmMatch) {
      linkedinFollowUpDm = followUpDmMatch[1].trim();
    }
  }

  // Replace placeholders with actual data
  if (contactFirstName) {
    linkedinConnectionNote = linkedinConnectionNote.replace(/\[First Name\]/g, contactFirstName);
    linkedinFollowUpDm = linkedinFollowUpDm.replace(/\[First Name\]/g, contactFirstName);
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

      if (user && ghlContactId) {
      const { error: rpcError } = await supabase.rpc('create_company_and_outreach_plan', {
        p_user_id: user.id,
        p_ghl_contact_id: ghlContactId ?? null,
        p_company_name: insights.match(/\*\*Full Company Name:\*\*\s*(.*)/)?.[1]?.trim() || null,
        p_industry: insights.match(/\*\*Industry:\*\*\s*(.*)/)?.[1]?.trim() || null,
        p_website: url,
        p_summary: insights.match(/\*\*Summary:\*\*\s*(.*)/)?.[1]?.trim() || null,
        p_developments: insights.match(/\*\*Recent Developments:\*\*\s*(.*)/)?.[1]?.trim() || null,
        p_contact_first_name: contactFirstName,
        p_job_title: jobTitle,
        p_insights: finalInsights,
        p_email: email,
        p_email_subject_lines: JSON.stringify(subjectLines ?? []),
        p_linkedin_connection_note: linkedinConnectionNote,
        p_linkedin_follow_up_dm: linkedinFollowUpDm,
        p_cold_call_script: coldCallScript,
        p_follow_up_email_subject_lines: JSON.stringify(followUpEmailSubjectLines ?? []),
        p_follow_up_email_body: followUpEmailBody,
      });
  
      if (rpcError) {
        console.error('Error calling create_company_and_outreach_plan RPC:', rpcError);
      }
    }

  const stripMarkdown = (text: string) => {
    if (!text) return '';
    return text
      // Remove headers (e.g. ## Header)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold/italic (**text**, *text*, __text__, _text_)
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      // Remove links ([text](url)) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove images (![alt](url)) -> ''
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      // Remove blockquotes (> text)
      .replace(/^>\s+/gm, '')
      // Remove code blocks (```)
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code (`)
      .replace(/`([^`]+)`/g, '$1')
      // Remove horizontal rules (---, ***, ___)
      .replace(/^[-*_]{3,}\s*$/gm, '')
      // Remove unordered list markers (-, *, +) but keep the structure
      // We might want to keep the list structure but remove the bullet character if strict plain text
      // For emails, keeping a simple hyphen is usually okay, but let's standardize
      // .replace(/^[\s\t]*[-*+]\s+/gm, '') 
      
      // Clean up extra whitespace
      .trim();
  };

  const finalEmail = stripMarkdown(email);
  const finalFollowUpEmail = stripMarkdown(followUpEmailBody);

  return { 
    insights: finalInsights, 
    email: finalEmail, 
    subjectLines: JSON.stringify(subjectLines), 
    linkedinConnectionNote, 
    linkedinFollowUpDm, 
    coldCallScript, 
    followUpEmailSubjectLines: JSON.stringify(followUpEmailSubjectLines), 
    followUpEmailBody: finalFollowUpEmail 
  };
}
