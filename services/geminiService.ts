import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  // Use environment variable or fallback to the provided key
  const apiKey = process.env.API_KEY || "vck_83sJ1goV8b41pN4plX77DdJZuedc4z1OWhL3gWDDeiFMfRMtsn4Kh3pI";
  
  if (!apiKey) {
    console.error("Gemini API Key is missing.");
    return null;
  }
  
  return new GoogleGenAI({ apiKey });
};

export const GeminiService = {
  generateSynopsis: async (title: string, genre: string): Promise<string> => {
    const client = getClient();
    if (!client) throw new Error("API Key not found");

    try {
      const prompt = `Write a short, engaging synopsis (max 100 words) for a ${genre} novel titled "${title}". Make it intriguing for readers.`;
      
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      return response.text || "Could not generate synopsis.";
    } catch (error) {
      console.error("Gemini Error:", error);
      throw error;
    }
  },

  improveContent: async (content: string): Promise<string> => {
    const client = getClient();
    if (!client) throw new Error("API Key not found");

    try {
      // Using gemini-3-pro-preview for higher quality editing
      const prompt = `You are an expert literary editor. Your task is to improve the grammar, flow, and readability of the following story segment.
      
      Guidelines:
      1. Correct all grammatical, spelling, and punctuation errors.
      2. Enhance sentence structure for better flow and pacing, making it sound more professional.
      3. Strictly maintain the original author's voice, tone, and style.
      4. Do not change the plot, characters, or key details.
      5. Return ONLY the edited content. Do not include any explanations, markdown code blocks, or conversational text.

      Original Content:
      ${content}`;
      
      const response = await client.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });

      return response.text || content;
    } catch (error) {
      console.error("Gemini Error:", error);
      throw error;
    }
  },

  translate: async (text: string, targetLanguage: string, isHtml: boolean = false): Promise<string> => {
    const client = getClient();
    if (!client) {
      console.warn("Translation skipped: No API Key available.");
      return text;
    }
    if (!text) return "";

    try {
      let prompt;
      if (isHtml) {
        prompt = `Translate the following HTML content to ${targetLanguage}.
        IMPORTANT:
        1. PRESERVE all HTML tags (like <p>, <strong>, <mark>, <br>) exactly as they are.
        2. Only translate the human-readable text content inside the tags.
        3. Do NOT add markdown formatting (like \`\`\`html).
        4. Return ONLY the raw translated HTML string.
        
        Content to translate:
        ${text}`;
      } else {
        prompt = `Translate the following text to ${targetLanguage}. Return only the translated text. Text: "${text}"`;
      }

      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      return response.text || text;
    } catch (error) {
      console.error("Translation Error:", error);
      return text;
    }
  }
};
