import { GoogleGenAI, Type } from "@google/genai";

/**
 * Obtiene un informe detallado con jugadores reales recomendados.
 */
export const getScoutReport = async (teamName: string, division: number, scoutLevel: number = 3) => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    return { 
      text: "Error: No se ha detectado la API KEY.", 
      players: [] 
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Actúa como un Director Deportivo experto. Analiza el mercado para el equipo "${teamName}" (División ${division}).
    
    TAREA:
    1. Redacta un análisis táctico breve de la situación actual del fútbol en la región.
    2. Recomienda 3 jugadores REALES que encajarían en el club.
    3. Para cada jugador indica: Nombre, Posición (POR, DEF, MED, DEL), Edad, Motivo y Valor Estimado.
    
    Responde estrictamente en formato JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  pos: { type: Type.STRING },
                  age: { type: Type.NUMBER },
                  reason: { type: Type.STRING },
                  estimatedValue: { type: Type.NUMBER }
                },
                required: ["name", "pos", "age", "reason", "estimatedValue"]
              }
            }
          },
          required: ["analysis", "recommendations"]
        }
      },
    });

    const data = JSON.parse(response.text);
    return {
      text: data.analysis,
      players: data.recommendations
    };
  } catch (error) {
    console.error("Error en scout service:", error);
    return { 
      text: "Hubo un error en las comunicaciones globales. Usando base de datos de emergencia.", 
      players: [
        { name: "Santi Comesaña", pos: "MED", age: 27, reason: "Equilibrio y trabajo.", estimatedValue: 8000000 },
        { name: "Aleix García", pos: "MED", age: 26, reason: "Visión de juego.", estimatedValue: 18000000 },
        { name: "Bryan Zaragoza", pos: "DEL", age: 22, reason: "Velocidad y regate.", estimatedValue: 12000000 }
      ] 
    };
  }
};