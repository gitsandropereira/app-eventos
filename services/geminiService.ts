import { GoogleGenAI, Type } from "@google/genai";

// Assume API_KEY is set in the environment
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY not found in environment variables. Gemini service will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateProposalDescription = async (
  eventName: string,
  clientName: string,
  serviceType: string
): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve(`Descrição para o evento ${eventName} com ${clientName}, serviço de ${serviceType}. (Modo offline: API Key não configurada)`);
  }
  
  const prompt = `Crie uma breve descrição profissional e amigável para uma proposta de evento. A proposta é para o cliente "${clientName}" para o evento "${eventName}". O serviço principal é "${serviceType}". Foque em transmitir profissionalismo e entusiasmo. Responda em português do Brasil.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text || "";
  } catch (error) {
    console.error("Error generating proposal description:", error);
    return "Não foi possível gerar a descrição. Por favor, tente novamente.";
  }
};

export const extractProposalFromText = async (text: string): Promise<{
    clientName?: string;
    eventName?: string;
    date?: string;
    serviceType?: string;
}> => {
    // Heuristic Fallback (Local Parsing) if API is not available or fails
    // This is a simple simulation of what the AI would do
    const extractLocally = (t: string) => {
        const nameMatch = t.match(/(?:sou|chamo|aqui é|fala com) (?:o|a)?\s?([A-Z][a-z]+)/i);
        const typeMatch = t.match(/(dj|fotografia|decoração|iluminação|som|banda|casamento|15 anos)/i);
        const dateMatch = t.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/); // Simple DD/MM date parser
        
        let parsedDate = '';
        if (dateMatch) {
            const year = dateMatch[3] ? (dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3]) : new Date().getFullYear();
            parsedDate = `${year}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`;
        }

        return {
            clientName: nameMatch ? nameMatch[1] : '',
            eventName: typeMatch ? `Evento de ${typeMatch[1]}` : 'Novo Evento',
            serviceType: typeMatch ? typeMatch[1] : '',
            date: parsedDate || new Date().toISOString().split('T')[0]
        };
    };

    if (!API_KEY) {
        return extractLocally(text);
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Extraia as seguintes informações do texto: nome do cliente, nome do evento (ex: Casamento, Aniversário), data (formato YYYY-MM-DD, assuma ano atual se não especificado) e tipo de serviço (DJ, Fotografia, etc). Texto: "${text}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        clientName: { type: Type.STRING },
                        eventName: { type: Type.STRING },
                        date: { type: Type.STRING },
                        serviceType: { type: Type.STRING }
                    }
                }
            }
        });

        const json = JSON.parse(response.text || "{}");
        return json;

    } catch (error) {
        console.error("AI Extraction failed, using fallback", error);
        return extractLocally(text);
    }
};