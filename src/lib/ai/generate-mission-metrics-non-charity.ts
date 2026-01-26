import { GoogleGenerativeAI } from '@google/generative-ai';
import { missionMetricsNonCharityPrompt } from './prompts/mission-metrics-non-charity.prompt';
import { fetchWebsiteContent } from './generate-outreach-plan';
import { MissionMetricsNonCharityInput, MissionMetricsOutput } from './mission-metrics.types';

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

export async function generateMissionMetricsNonCharityReport(input: MissionMetricsNonCharityInput): Promise<MissionMetricsOutput> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

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

  // 5. Robust Parsing Logic (Double Bracket Strategy)
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
  };
}
