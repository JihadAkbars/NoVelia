
import { GoogleGenAI } from "@google/genai";

// Safety check for process.env to prevent ReferenceErrors in browser
const getApiKey = () => {
  try {
    return process.env.API_KEY;
  } catch (e) {
    return undefined;
  }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("Gemini API Key is missing in environment");
    throw new Error("AI Key not found. Please ensure the API_KEY environment variable is set.");
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following story content into ${targetLanguage}. Keep the paragraph structure and literary tone: \n\n ${text}`,
    });
    
    if (!response.text) throw new Error("No response from AI");
    return response.text;
  } catch (error: any) {
    console.error("Translation Error:", error.message);
    throw new Error("Gemini AI Translation failed: " + error.message);
  }
};

export const improveGrammar = async (text: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("Gemini API Key is missing in environment");
    throw new Error("AI Key not found. Please ensure the API_KEY environment variable is set.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Improve the grammar, flow, and vocabulary of this story content. Maintain the original tone and meaning. Only return the corrected text, no meta-comments: \n\n ${text}`,
    });
    
    if (!response.text) throw new Error("No response from AI");
    return response.text;
  } catch (error: any) {
    console.error("AI Grammar Error:", error.message);
    throw new Error("Gemini AI Editing failed: " + error.message);
  }
};
