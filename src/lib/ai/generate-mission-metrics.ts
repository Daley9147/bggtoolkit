import { GoogleGenerativeAI } from '@google/generative-ai';
import { fetchUKNonProfitData } from '@/lib/charity-commission/api';
import { fetchNonProfitData } from '@/lib/propublica/api';
import { missionMetricsUkPrompt } from './prompts/mission-metrics-uk.prompt';
import { missionMetricsUsPrompt } from './prompts/mission-metrics-us.prompt';
import { fetchWebsiteContent } from './scraper';
import { MissionMetricsInput, MissionMetricsOutput } from './mission-metrics.types';

function parseJsonSafe(jsonString: string): any {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.warn("Failed to parse JSON. Raw string:", jsonString);
    console.warn("Parse Error:", e);
    return [];
  }
}

function stripMarkdown(text: string): string {
  // Remove code blocks like ```json ... ``` or just ``` ... ```
  return text.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
}

export async function generateMissionMetricsReport(input: MissionMetricsInput): Promise<MissionMetricsOutput> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  // 1. Fetch Financial Data
  console.log(`Fetching financial data for identifier: ${input.identifier || 'None'} (Country: ${input.country})`);
  let financialData: any = null;
  let financialSummary = "No financial data found or API unavailable.";

  if (input.identifier) {
    if (input.country === 'UK') {
      financialData = await fetchUKNonProfitData(input.identifier);
      if (financialData) {
        financialSummary = JSON.stringify(financialData.slice(0, 5)); // Last 5 years
      }
    } else if (input.country === 'US') {
       // ProPublica logic
      financialData = await fetchNonProfitData(input.identifier);
      if (financialData) {
         financialSummary = JSON.stringify(financialData); // ProPublica returns a single object for latest year
      }
    }
  }

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
  const basePrompt = input.country === 'US' ? missionMetricsUsPrompt : missionMetricsUkPrompt;
  const financialLabel = input.country === 'US' ? "ProPublica Financial Data (Latest Year)" : "Charity Commission Financial History (Last 5 Years)";

  const prompt = `
${basePrompt}

---
**INPUT DATA:**

**${financialLabel}:**
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
  
  // 6. Robust Parsing Logic (Double Bracket Strategy)
  // We look for [[HEADER]]
  
  const extractSection = (header: string, nextHeader: string | null) => {
    const startMarker = `[[${header}]]`;
    const startIndex = text.indexOf(startMarker);
    
    if (startIndex === -1) return "";
    
    // Start after the marker
    const contentStart = startIndex + startMarker.length;
    
    let contentEnd = text.length;
    
    if (nextHeader) {
      const nextMarker = `[[${nextHeader}]]`;
      const nextIndex = text.indexOf(nextMarker);
      if (nextIndex !== -1) {
        contentEnd = nextIndex;
      }
    }
    
    let content = text.substring(contentStart, contentEnd);
    
    // Clean up
    return content.replace(/---/g, '').trim();
  };

  const insights = extractSection("INSIGHTS", "EMAIL_SUBJECTS");
  const emailSubjectsRaw = extractSection("EMAIL_SUBJECTS", "EMAIL_BODY");
  const emailBody = extractSection("EMAIL_BODY", "LINKEDIN_MESSAGES");
  const linkedinMessages = extractSection("LINKEDIN_MESSAGES", "CALL_SCRIPT");
  const callScript = extractSection("CALL_SCRIPT", "FOLLOW_UP_SUBJECTS");
  const followUpSubjectsRaw = extractSection("FOLLOW_UP_SUBJECTS", "FOLLOW_UP_BODY");
  const followUpBody = extractSection("FOLLOW_UP_BODY", null);

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
    financialData: financialData
  };
}