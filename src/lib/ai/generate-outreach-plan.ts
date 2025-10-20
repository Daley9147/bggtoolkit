import 'server-only';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';
import { caseStudies } from '@/lib/case-studies';
import { createClient } from '@/lib/supabase/server';
import { fetchNonProfitData } from '@/lib/propublica/api';
import { forProfitPrompt } from './prompts/for-profit.prompt';
import { nonProfitPrompt } from './prompts/non-profit.prompt';
import { vcBackedPrompt } from './prompts/vc-backed.prompt';
import { partnershipPrompt } from './prompts/partnership.prompt';

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
  ghlContactId?: string;
  organizationType: 'for-profit' | 'non-profit' | 'vc-backed' | 'partnership';
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
    ? 'gemini-2.5-pro' // NOTE: Using a placeholder for the pro model
    : 'gemini-2.5-flash';
  const model = genAI.getGenerativeModel({ model: modelName });

  // Validation
  if (organizationType === 'vc-backed' && !fundingAnnouncementUrl) {
    throw new Error('Funding Announcement URL is required for VC-Backed Startups');
  }
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

  let prompt;
  switch (organizationType) {
    case 'non-profit':
      prompt = nonProfitPrompt;
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

  const parseJsonSafe = (jsonString: string): any[] => {
    if (!jsonString) return [];
    const cleanedString = jsonString.replace(/```json\n?|```/g, '').trim();
    try {
      return JSON.parse(cleanedString);
    } catch (e) {
      console.error("Failed to parse JSON:", cleanedString);
      return [];
    }
  };

  let insights = sections["insights"] || '';
  // Final cleanup for AI-specific markers
  insights = insights.replace('[INSIGHTS]', '').trim();

  const subjectLinesRaw = sections["EMAIL SUBJECT LINES"] || '[]';
  let email = sections["EMAIL BODY"] || '';
  const linkedinText = sections["LINKED-IN OUTREACH"] || '';
  const coldCallScript = sections["COLD CALL SCRIPT"] || '';
  const followUpSubjectLinesRaw = sections["FOLLOW-UP EMAIL SUBJECT LINES"] || '[]';
  const followUpEmailBody = sections["FOLLOW-UP EMAIL BODY"] || '';

  // Clean up potential AI errors
  // Remove duplicated outreach hook example if it exists at the start of the insights
  const hookRegex = /^\s*\**Outreach Hook Example\**\s*:?[\s\S]*?\n\n/i;
  if (insights.trim().match(hookRegex)) {
    insights = insights.trim().replace(hookRegex, '');
  }

  let finalInsights = insights;
  if (organizationType === 'non-profit' && financialsText.includes('Total Revenue')) {
    const financialBlock = `**Key Financials (Annual):**\n${financialsText.trim()}`;
    finalInsights = `${financialBlock}\n\n---\n\n${insights}`;
  }

  let subjectLines: string[] = parseJsonSafe(subjectLinesRaw);
  if (subjectLines.length === 0) {
    subjectLines = ["", "", ""]; // Provide empty fallbacks
  }

  let followUpEmailSubjectLines: string[] = parseJsonSafe(followUpSubjectLinesRaw);
  if (followUpEmailSubjectLines.length === 0) {
    followUpEmailSubjectLines = ["", ""]; // Provide empty fallbacks
  }

  const greeting = contactFirstName ? `Hi ${contactFirstName},` : 'Hi,';
  email = `${greeting}\n\n${email}`;

  let linkedinConnectionNote = '';
  let linkedinFollowUpDm = '';

  const connectionNoteMatch = linkedinText.match(/\*\*Linkedin Step 1 – Connection Note\*\*\s*([\s\S]*?)\s*\*\*Linkedin Step 2/);
  if (connectionNoteMatch) {
    linkedinConnectionNote = connectionNoteMatch[1].trim();
  }

  const linkedinFollowUpDmMatch = linkedinText.match(/\*\*Linkedin Step 2 – Follow-Up DM\*\*\s*([\s\S]*)/);
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

    if (companyData && ghlContactId) {
          const { error: templateError } = await supabase
            .from('outreach_templates')
            .upsert(
              {
                company_id: companyData[0].id,
                contact_first_name: contactFirstName,
                job_title: jobTitle,
                insights: finalInsights,
                email,
                email_subject_lines: subjectLines,
                linkedin_connection_note: linkedinConnectionNote,
                linkedin_follow_up_dm: linkedinFollowUpDm,
                cold_call_script: coldCallScript,
                user_id: user.id,
                ghl_contact_id: ghlContactId,
                follow_up_email_subject_lines: followUpEmailSubjectLines,
                follow_up_email_body: followUpEmailBody,
              },
              { onConflict: 'ghl_contact_id, user_id' }
            );
    
          if (templateError) {
            console.error('Error upserting template data:', templateError);
          }
        }  }

  return { insights: finalInsights, email, subjectLines, linkedinConnectionNote, linkedinFollowUpDm, coldCallScript, followUpEmailSubjectLines, followUpEmailBody };
}
