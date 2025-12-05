import { GoogleGenerativeAI } from '@google/generative-ai';
import { fetchUKNonProfitData } from '@/lib/charity-commission/api';
import { missionMetricsUkPrompt } from './prompts/mission-metrics-uk.prompt';
import { fetchWebsiteContent } from './generate-outreach-plan';

interface MissionMetricsInput {
  charityNumber: string;
  websiteUrl: string;
  specificUrl?: string; // URL for specific article/case study
  userInsight?: string;
}

export interface MissionMetricsOutput {
  insights: string;
  emailSubjectLines: string[];
  emailBody: string;
  linkedinMessages: string;
  callScript: string;
  followUpSubjectLines: string[];
  followUpBody: string;
  financialData: any; // Raw data from Charity Commission
}

function parseJsonSafe(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.warn("Failed to parse JSON, returning raw string or empty array:", e);
    return [];
  }
}

function stripMarkdown(text: string): string {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
}

export async function generateMissionMetricsReport(input: MissionMetricsInput): Promise<MissionMetricsOutput> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Using the new model

  // 1. Fetch Financial Data
  console.log(`Fetching financial data for charity number: ${input.charityNumber}`);
  const financialData = await fetchUKNonProfitData(input.charityNumber);
  const financialSummary = financialData 
    ? JSON.stringify(financialData.slice(0, 5)) // Last 5 years
    : "No financial data found or API unavailable.";

  // 2. Fetch Website Content (Home Page)
  let websiteContent = "Website content not available.";
  if (input.websiteUrl) {
    try {
      console.log(`Fetching website content: ${input.websiteUrl}`);
      websiteContent = await fetchWebsiteContent(input.websiteUrl);
    } catch (e) {
      console.warn(`Failed to fetch website content for ${input.websiteUrl}:`, e);
    }
  }

  // 3. Fetch Specific URL Content (if provided)
  let specificUrlContent = "No specific article provided.";
  if (input.specificUrl) {
    try {
      console.log(`Fetching specific URL content: ${input.specificUrl}`);
      specificUrlContent = await fetchWebsiteContent(input.specificUrl);
    } catch (e) {
      console.warn(`Failed to fetch specific URL content for ${input.specificUrl}:`, e);
    }
  }

  // 4. Construct the Prompt
  const prompt = `
${missionMetricsUkPrompt}

---
**INPUT DATA:**

**Charity Commission Financial History (Last 5 Years):**
${financialSummary}

**Website Content (Home Page/About):**
${websiteContent.slice(0, 8000)}

**Specific Article / Case Study Content:**
${specificUrlContent.slice(0, 5000)}

**User's Key Insight / Notes:**
${input.userInsight || "None provided."} 
  `;

  // 5. Call Gemini AI
  console.log("Sending prompt to Gemini...");
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  console.log("Gemini response received.");

  // 6. Parse the Output
  // The prompt enforces specific markers. We split by them.
  const sections = text.split(/---/);
  
  // Helper to find content by section header (approximate match)
  const findSection = (header: string) => {
    const index = sections.findIndex(s => s.toUpperCase().includes(header));
    if (index !== -1 && index + 1 < sections.length) {
      return sections[index + 1].trim();
    }
    return "";
  };

  // We need to match the markers defined in the prompt:
  // [INSIGHTS], EMAIL SUBJECT LINES, [EMAIL SUBJECTS], EMAIL BODY, [EMAIL BODY], etc.
  
  // A more robust way given the prompt structure:
  // The output structure is:
  // [INSIGHTS] block
  // ---
  // EMAIL SUBJECT LINES header
  // ---
  // [EMAIL SUBJECTS] block
  // ... and so on.
  
  // Let's create a map based on known markers in the prompt.
  const markers = [
    "[INSIGHTS]",
    "EMAIL SUBJECT LINES", // Header, next block is content
    "[EMAIL SUBJECTS]",
    "EMAIL BODY",
    "[EMAIL BODY]",
    "LINKEDIN OUTREACH",
    "[LINKEDIN MESSAGES]",
    "COLD CALL SCRIPT",
    "[CALL SCRIPT]",
    "FOLLOW-UP EMAIL SUBJECT LINES",
    "[FOLLOW-UP SUBJECTS]",
    "FOLLOW-UP EMAIL BODY",
    "[FOLLOW-UP BODY]"
  ];

  // Simple parser based on order or regex might be brittle if AI hallucinates markers.
  // Let's try to extract by splitting the full text by the markers directly.
  
  let insights = "";
  let emailSubjectLines: string[] = [];
  let emailBody = "";
  let linkedinMessages = "";
  let callScript = "";
  let followUpSubjectLines: string[] = [];
  let followUpBody = "";

  // Regex extraction is safer than simple split if markers are unique
  const extractBlock = (marker: string) => {
    const regex = new RegExp(`${marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n([\\s\\S]*?)(?=\\n---|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : "";
  };
  
  // Note: The prompt uses specific markers for the content blocks.
  // [INSIGHTS] -> Content
  // EMAIL SUBJECT LINES -> Header
  // ---
  // [EMAIL SUBJECTS] -> Content
  
  insights = extractBlock("[INSIGHTS]");
  const emailSubjectsRaw = extractBlock("[EMAIL SUBJECTS]");
  emailBody = extractBlock("[EMAIL BODY]");
  linkedinMessages = extractBlock("[LINKEDIN MESSAGES]");
  callScript = extractBlock("[CALL SCRIPT]");
  const followUpSubjectsRaw = extractBlock("[FOLLOW-UP SUBJECTS]");
  followUpBody = extractBlock("[FOLLOW-UP BODY]");

  // Parse JSON arrays
  emailSubjectLines = parseJsonSafe(stripMarkdown(emailSubjectsRaw));
  followUpSubjectLines = parseJsonSafe(stripMarkdown(followUpSubjectsRaw));

  return {
    insights,
    emailSubjectLines,
    emailBody,
    linkedinMessages,
    callScript,
    followUpSubjectLines,
    followUpBody,
    financialData: financialData // Return raw data for frontend display if needed
  };
}
