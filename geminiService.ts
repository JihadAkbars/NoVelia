
import { GoogleGenAI } from "@google/genai";

/**
 * Service to handle all AI-powered tasks using the Gemini API.
 * Uses process.env.API_KEY which is injected by the environment.
 */

// Recommended model for basic text tasks per guidelines
const TEXT_MODEL = 'gemini-3-flash-preview';

/**
 * Diagnostic function to verify if the API Key and Generative Language API are correctly configured.
 */
export const testAiConnection = async (): Promise<boolean> => {
  const apiKey = process.env.API_KEY?.trim();
  if (!apiKey) throw new Error("API Key is missing in the environment.");

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: "Respond with the word 'Connected'.",
    });
    return response.text?.trim().toLowerCase().includes('connected') || false;
  } catch (error: any) {
    console.error("AI Connection Test Failed:", error);
    throw error;
  }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  const apiKey = process.env.API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please ensure the API_KEY environment variable is configured.");
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `You are a professional literary translator. Translate the following text into ${targetLanguage}. Maintain the story's emotional tone, paragraph structure, and narrative style. Only return the translated text: \n\n ${text}`,
    });
    
    const result = response.text;
    if (!result) throw new Error("The AI returned an empty response.");
    return result;
  } catch (error: any) {
    console.error("Gemini Translation Error:", error);
    const msg = error.message || '';
    if (msg.includes('403') || msg.toLowerCase().includes('location not supported')) {
      throw new Error("Gemini is not available in your current region or the API key lacks permissions.");
    }
    if (msg.includes('400') || msg.toLowerCase().includes('invalid')) {
      throw new Error("Invalid API Key. Please check your Google AI Studio settings.");
    }
    throw new Error(`Translation failed: ${msg}`);
  }
};

export const improveGrammar = async (text: string): Promise<string> => {
  const apiKey = process.env.API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please ensure the API_KEY environment variable is configured.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `You are a world-class editor. Please improve the grammar, punctuation, and flow of the following story text. Ensure the vocabulary is engaging but keep the original meaning and tone exactly as it is. Only return the corrected text: \n\n ${text}`,
    });
    
    const result = response.text;
    if (!result) throw new Error("The AI returned an empty response.");
    return result;
  } catch (error: any) {
    console.error("Gemini Grammar Error:", error);
    const msg = error.message || '';
    if (msg.includes('403') || msg.toLowerCase().includes('location not supported')) {
      throw new Error("Gemini is not available in your current region or the API key lacks permissions.");
    }
    throw new Error(`AI Editing failed: ${msg}`);
  }
};
