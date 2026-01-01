import { GoogleGenAI } from "@google/genai";

/**
 * Service to handle all AI-powered tasks using the Gemini API.
 * Uses process.env.API_KEY which is injected by the environment.
 */

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not configured.");
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a professional literary translator. Translate the following text into ${targetLanguage}. Maintain the story's emotional tone, paragraph structure, and narrative style. Only return the translated text: \n\n ${text}`,
    });
    
    const result = response.text;
    if (!result) throw new Error("The AI returned an empty response.");
    return result;
  } catch (error: any) {
    console.error("Gemini Translation Error:", error);
    throw new Error(`Translation failed: ${error.message || 'Unknown error'}`);
  }
};

export const improveGrammar = async (text: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not configured.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a world-class editor. Please improve the grammar, punctuation, and flow of the following story text. Ensure the vocabulary is engaging but keep the original meaning and tone exactly as it is. Only return the corrected text: \n\n ${text}`,
    });
    
    const result = response.text;
    if (!result) throw new Error("The AI returned an empty response.");
    return result;
  } catch (error: any) {
    console.error("Gemini Grammar Error:", error);
    // Provide a more descriptive error message to the user
    throw new Error(`AI Editing failed: ${error.message || 'Check your internet connection or API quota.'}`);
  }
};
