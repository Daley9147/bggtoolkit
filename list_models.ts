import { GoogleGenerativeAI } from '@google/generative-ai';

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy model init to access client? No, need to look at SDK.
    // Actually the SDK doesn't expose listModels directly on the client instance in some versions, 
    // but usually it is separate or we can try a known stable model to just check connectivity.
    // However, the error message itself suggested: "Call ListModels to see the list of available models".
    // I will try to use the raw API or a specific SDK method if available. 
    // Let's try to assume the SDK has a ModelService or similar.
    
    // In strict GoogleGenerativeAI SDK usage:
    // There isn't a direct `listModels` on the main class in some versions.
    // But we can try to fetch it via REST if SDK fails.
    
    // Let's try a simple fetch to the API endpoint which is what the SDK does under the hood.
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("Available Models:", JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
