
import { GoogleGenAI, Type } from "@google/genai";

// Em produção, use variáveis de ambiente seguras.
// Para teste local/browser, você pode colar a chave aqui ou deixar vazio para usar o modo offline.

const getEnvVar = (key: string, fallback: string) => {
    try {
        return (import.meta as any)?.env?.[key] || fallback;
    } catch (e) {
        return fallback;
    }
};

const API_KEY = getEnvVar('VITE_GEMINI_API_KEY', ''); 

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateProposalDescription = async (
  eventName: string,
  clientName: string,
  serviceType: string
): Promise<string> => {
  if (!API_KEY) {
    // Fallback gracioso se não houver chave API
    return Promise.resolve(`Proposta personalizada para ${clientName} referente ao evento ${eventName} (${serviceType}). (Descrição gerada offline - Configure a API Key para usar IA)`);
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
    return "Não foi possível gerar a descrição pela IA no momento.";
  }
};

export const extractProposalFromText = async (text: string): Promise<{
    clientName?: string;
    eventName?: string;
    date?: string;
    serviceType?: string;
}> => {
    // Função de extração local (Regex) caso a IA falhe ou não esteja configurada
    const extractLocally = (t: string) => {
        const nameMatch = t.match(/(?:sou|chamo|aqui é|fala com) (?:o|a)?\s?([A-Z][a-z]+)/i);
        const typeMatch = t.match(/(dj|fotografia|decoração|iluminação|som|banda|casamento|15 anos)/i);
        const dateMatch = t.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/); // Parser simples DD/MM
        
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
