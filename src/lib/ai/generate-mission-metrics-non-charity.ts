import { GoogleGenerativeAI } from '@google/generativeai';
import { missionMetricsNonCharityPrompt } from './prompts/mission-metrics-non-charity.prompt';
import { fetchWebsiteContent } from './generate-outreach-plan';

interface MissionMetricsNonCharityInput {
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

export async function generateMissionMetricsNonCharityReport(input: MissionMetricsNonCharityInput): Promise<MissionMetricsOutput> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // 1. Fetch Website Content (Home Page)
  let websiteContent = "Website content not available.";
  if (input.websiteUrl) {
    try {
      console.log(`Fetching website content: ${input.websiteUrl}`);
      websiteContent = await fetchWebsiteContent(input.websiteUrl);
    } catch (e) {
      console.warn(`Failed to fetch website content for ${input.websiteUrl}:`, e);
    }
  }

  // 2. Fetch Specific URL Content (if provided)
  let specificUrlContent = "No specific article provided.";
  if (input.specificUrl) {
    try {
      console.log(`Fetching specific URL content: ${input.specificUrl}`);
      specificUrlContent = await fetchWebsiteContent(input.specificUrl);
    } catch (e) {
      console.warn(`Failed to fetch specific URL content for ${input.specificUrl}:`, e);
    }
  }

  // 3. Construct the Prompt
  const prompt = `
${missionMetricsNonCharityPrompt}

---
**INPUT DATA:**

**Website Content (Home Page/About):**
${websiteContent.slice(0, 10000)}

**Specific Article / Case Study Content:**
${specificUrlContent.slice(0, 5000)}

**User's Key Insight / Notes:**
${input.userInsight || "None provided."} 
  `;

  // 4. Call Gemini AI
  console.log("Sending non-charity prompt to Gemini...");
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  console.log("Gemini response received.");

  // 5. Parse the Output
  const extractBlock = (marker: string) => {
    const regex = new RegExp(`${marker.replace(/[.*+?^${}()|\[\]/g, '\\$&')}\s*\n([\s\S]*?)(?=\n---|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : "";
  };
  
  const insights = extractBlock("[INSIGHTS]");
  const emailSubjectsRaw = extractBlock("[EMAIL SUBJECTS]");
  const emailBody = extractBlock("[EMAIL BODY]");
  const linkedinMessages = extractBlock("[LINKEDIN MESSAGES]");
  const callScript = extractBlock("[CALL SCRIPT]");
  const followUpSubjectsRaw = extractBlock("[FOLLOW-UP SUBJECTS]");
  const followUpBody = extractBlock("[FOLLOW-UP BODY]");

  // Parse JSON arrays
  const emailSubjectLines = parseJsonSafe(stripMarkdown(emailSubjectsRaw));
  const followUpSubjectLines = parseJsonSafe(stripMarkdown(followUpSubjectsRaw));

  return {
    insights,
    emailSubjectLines,
    emailBody,
    linkedinMessages,
    callScript,
    followUpSubjectLines,
    followUpBody,
  };
}
