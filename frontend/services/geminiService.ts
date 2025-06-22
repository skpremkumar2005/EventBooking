
import { GoogleGenAI, GenerateContentResponse, GroundingChunk } from "@google/genai";

// Ensure API_KEY is accessed from environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set. AI features may not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" }); // Provide a fallback for type safety, but it won't work without a real key
const textModel = 'gemini-2.5-flash-preview-04-17';
const imageModel = 'imagen-3.0-generate-002';

interface VenueRecommendation {
  name: string;
  type: 'venue' | 'vendor'; // To distinguish between venues and vendors
  description: string;
  pros?: string[];
  cons?: string[];
}

interface AiRecommendations {
  recommendations: VenueRecommendation[];
  summary?: string;
  rawResponse?: string; // For debugging or additional info
}


export const getVenueRecommendations = async (eventType: string, location: string): Promise<AiRecommendations | { error: string }> => {
  if (!API_KEY) {
    return { error: "AI service is not configured. API key is missing." };
  }
  try {
    const prompt = `
      You are an expert event planning assistant.
      For an event of type "${eventType}" to be held in "${location}", please suggest:
      1. Up to 3 suitable venues.
      2. Up to 2-3 relevant vendors (e.g., caterers, decorators, photographers, entertainment) appropriate for this event type.

      For each suggestion (venue or vendor), provide:
      - Name
      - Type (venue or vendor)
      - A brief description (1-2 sentences)
      - 1-2 potential pros
      - 1-2 potential cons or considerations

      Format your response as a JSON object with a key "recommendations". 
      The "recommendations" value should be an array of objects, where each object has "name", "type", "description", "pros" (array of strings), and "cons" (array of strings).
      Example of a recommendation object:
      { "name": "The Grand Ballroom", "type": "venue", "description": "A spacious and elegant ballroom.", "pros": ["Large capacity", "Beautiful decor"], "cons": ["Can be expensive", "Limited parking"] }
      
      Provide a brief overall summary (1-2 sentences) under a "summary" key in the JSON object.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: textModel,
      contents: [{ role: "user", parts: [{text: prompt}] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.7, // Allow for some creativity
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as AiRecommendations; // Trusting the model to return this structure

    // Basic validation of parsed data structure (can be more robust)
    if (!parsedData.recommendations || !Array.isArray(parsedData.recommendations)) {
        throw new Error("AI response did not contain valid 'recommendations' array.");
    }
    
    return { ...parsedData, rawResponse: response.text };

  } catch (error) {
    console.error("Error getting venue recommendations from Gemini:", error);
    let errorMessage = "Failed to get AI recommendations. Please try again.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    if (typeof error === 'string' && error.includes("API key not valid")) {
        errorMessage = "The AI service API key is invalid. Please check the configuration.";
    }
    return { error: errorMessage };
  }
};


export const getRecentEventNews = async (topic: string): Promise<{ text: string; sources?: GroundingChunk[]; error?: string }> => {
  if (!API_KEY) {
    return { text: "", error: "AI service is not configured. API key is missing." };
  }
  try {
    const prompt = `Provide a brief update or news related to "${topic}" in the event industry. Focus on recent developments or trends.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: textModel,
      contents: [{role: "user", parts: [{text: prompt}]}],
      config: {
        tools: [{googleSearch: {}}], // Enable Google Search grounding
      },
    });

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = groundingMetadata?.groundingChunks?.filter(chunk => chunk.web) as GroundingChunk[] | undefined;

    return { text: response.text, sources };

  } catch (error) {
    console.error("Error getting recent event news from Gemini:", error);
    let errorMessage = "Failed to get recent event news. Please try again.";
     if (error instanceof Error) {
      errorMessage = error.message;
    }
    if (typeof error === 'string' && error.includes("API key not valid")) {
        errorMessage = "The AI service API key is invalid. Please check the configuration.";
    }
    return { text: "", error: errorMessage };
  }
};

export const generateEventImage = async (
  eventTitle: string,
  eventCategory: string
): Promise<{ imageUrl: string | null; error?: string }> => {
  if (!API_KEY) {
    return { imageUrl: null, error: "AI service is not configured. API key is missing." };
  }

  try {
    const prompt = `Generate a visually appealing and relevant event banner image for a "${eventCategory}" event titled "${eventTitle}". The image should be suitable for an event listing and capture the essence of a ${eventCategory}. Avoid including any text in the image.`;

    const response = await ai.models.generateImages({
      model: imageModel,
      prompt: prompt,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
      return { imageUrl: imageUrl };
    } else {
      console.error("No image generated or image data missing from AI response:", response);
      return { imageUrl: null, error: "AI failed to generate an image. No image data was returned." };
    }

  } catch (error) {
    console.error("Error generating event image with Gemini:", error);
    let errorMessage = "Failed to generate event image using AI. Please try again.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
     // Check for specific API key error messages if the error object might be a string or has specific properties
    if (typeof error === 'string' && error.toLowerCase().includes("api key not valid")) {
        errorMessage = "The AI service API key is invalid. Please check the configuration.";
    } else if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string' && (error as any).message.toLowerCase().includes("api key not valid")) {
        errorMessage = "The AI service API key is invalid. Please check the configuration.";
    }
    return { imageUrl: null, error: errorMessage };
  }
};
