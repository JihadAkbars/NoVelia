import { GoogleGenAI } from "@google/genai";

/**
 * Service to handle all AI-powered tasks using the Gemini API.
 * Uses process.env.API_KEY which is injected by the environment.
 */

const MODEL_NAME = 'gemini-flash-latest';

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  const rawKey = process.env.API_KEY;
  if (!rawKey) {
    throw new Error("Gemini API Key is missing. Please ensure process.env.API_KEY is configured.");
  }
  
  const apiKey = rawKey.trim();
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `You are a professional literary translator. Translate the following text into ${targetLanguage}. Maintain the story's emotional tone, paragraph structure, and narrative style. Only return the translated text: \n\n ${text}`,
    });
    
    const result = response.text;
    if (!result) throw new Error("The AI returned an empty response.");
    return result;
  } catch (error: any) {
    console.error("Gemini Translation Error:", error);
    const msg = error.message || '';
    if (msg.toLowerCase().includes('api key not valid') || msg.includes('403') || msg.toLowerCase().includes('invalid')) {
      throw new Error("The API key is invalid or restricted. Please verify it in your Google AI Studio dashboard and ensure the 'Generative Language API' is enabled for this key.");
    }
    throw new Error(`Translation failed: ${msg}`);
  }
};

export const improveGrammar = async (text: string): Promise<string> => {
  const rawKey = process.env.API_KEY;
  if (!rawKey) {
    throw new Error("Gemini API Key is missing. Please ensure process.env.API_KEY is configured.");
  }

  const apiKey = rawKey.trim();

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `You are a world-class editor. Please improve the grammar, punctuation, and flow of the following story text. Ensure the vocabulary is engaging but keep the original meaning and tone exactly as it is. Only return the corrected text: \n\n ${text}`,
    });
    
    const result = response.text;
    if (!result) throw new Error("The AI returned an empty response.");
    return result;
  } catch (error: any) {
    console.error("Gemini Grammar Error:", error);
    const msg = error.message || '';
    if (msg.toLowerCase().includes('api key not valid') || msg.includes('403') || msg.toLowerCase().includes('invalid')) {
      throw new Error("The API key is invalid or restricted. Please verify it in your Google AI Studio dashboard and ensure the 'Generative Language API' is enabled for this key.");
    }
    throw new Error(`AI Editing failed: ${msg}`);
  }
};
