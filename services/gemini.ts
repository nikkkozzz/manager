
import { GoogleGenAI } from "@google/genai";

// Initialization following @google/genai coding guidelines
export const getScoutReport = async (teamName: string, division: number) => {
  try {
    // Create instance inside the function using named parameter for apiKey
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Eres un ojeador de fútbol de clase mundial. Genera un breve análisis táctico (2-3 frases) para el equipo "${teamName}" en la División ${division}. Usa la búsqueda de Google para mencionar tendencias reales de fútbol o estrategias que podrían aplicarse a un club con este nombre o perfil. Debe ser inmersivo y profesional, y DEBE ESTAR COMPLETAMENTE EN ESPAÑOL.`,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    // Directly access .text property from GenerateContentResponse
    const text = response.text || "Informe no disponible en este momento. Nuestros ojeadores están de viaje.";
    
    // Extracting grounding chunks for display in the UI as required for Google Search grounding
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title,
        uri: chunk.web?.uri
    })).filter(Boolean) || [];

    return { text, sources };
  } catch (error) {
    console.error("Error en informe de ojeador:", error);
    return { text: "Error conectando con la red de ojeadores.", sources: [] };
  }
};
