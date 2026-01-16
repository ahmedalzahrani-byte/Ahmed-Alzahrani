
import { GoogleGenAI, Type } from "@google/genai";
import { CityEvent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const fetchCityEvents = async (cityName: string): Promise<CityEvent[]> => {
  const prompt = `List 8 to 10 REAL, high-profile mega-project activities occurring EXCLUSIVELY in ${cityName}, Saudi Arabia for January 2026.

  GEOGRAPHIC FILTER:
  - RIYADH: Only projects in Riyadh (Qiddiya, Boulevard, KAFD).
  - JEDDAH: Only projects in Jeddah (Red Sea, Yacht Club, Al-Balad).
  - AL-ULA: Only projects in Al-Ula (Hegra, Maraya).
  - TABUK: Only NEOM projects (Sindalah, Trojena).

  UI STYLE:
  - Use brief, prestigious descriptions (max 60 words).
  - Ensure bookingUrl is EXACTLY: https://webook.com/en

  Format as JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              location: { type: Type.STRING },
              date: { type: Type.STRING },
              category: { type: Type.STRING },
              bookingUrl: { type: Type.STRING }
            },
            required: ["id", "title", "description", "location", "date", "category", "bookingUrl"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};
