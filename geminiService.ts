
import { GoogleGenAI } from "@google/genai";

// Standard initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing for Translation");
    return text;
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following text into ${targetLanguage}. Maintain the literary tone and formatting: \n\n ${text}`,
    });
    return response.text || text;
  } catch (error) {
    console.error("Translation Error:", error);
    return text;
  }
};

export const improveGrammar = async (text: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing for Grammar Improvement");
    return text;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Improve the grammar, flow, and vocabulary of the following story content while keeping the original meaning intact. Only return the improved text: \n\n ${text}`,
    });
    return response.text || text;
  } catch (error) {
    console.error("AI Grammar Error:", error);
    return text;
  }
};
