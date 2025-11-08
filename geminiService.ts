import { GoogleGenAI, Type, Modality } from "@google/genai";
import { DetailedTranslationResult } from './types';

const wordSchema = {
  type: Type.OBJECT,
  properties: {
    pronunciation: {
      type: Type.STRING,
      description: "The phonetic pronunciation of the original source word."
    },
    meanings: {
      type: Type.ARRAY,
      description: "A list of the top 3-5 most common meanings, grouped by their part of speech.",
      items: {
        type: Type.OBJECT,
        properties: {
          partOfSpeech: {
            type: Type.STRING,
            description: "The grammatical part of speech (e.g., Noun, Verb, Adjective)."
          },
          translations: {
            type: Type.ARRAY,
            description: "A list of translated words for this part of speech.",
            items: {
              type: Type.STRING
            }
          }
        },
        required: ["partOfSpeech", "translations"]
      }
    }
  },
  required: ["pronunciation", "meanings"]
};

const phraseSchema = {
    type: Type.OBJECT,
    properties: {
        translation: {
            type: Type.STRING,
            description: "The most common translation of the phrase."
        }
    },
    required: ["translation"]
}

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  try {
    const ai = new GoogleGenAI({ apiKey });
    // A simple, low-cost request to check if the key is valid.
    await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'h', // minimal prompt to reduce cost
        config: { maxOutputTokens: 1 }
    });
    return true;
  } catch (error) {
    console.error("API Key validation failed:", error);
    return false;
  }
};


export const translateText = async (apiKey: string, text: string, sourceLang: string, targetLang: string, onInvalidApiKey: () => void): Promise<DetailedTranslationResult | null> => {
  if (!text.trim()) {
    return null;
  }
  
  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash';
  const isPhrase = text.includes(' ');

  try {
    const prompt = isPhrase
        ? `Translate the ${sourceLang} phrase "${text}" into ${targetLang}. Provide the most common translation. Format the output as a simple JSON object with a single key "translation".`
        : `Translate the ${sourceLang} word "${text}" into ${targetLang}. Provide the phonetic pronunciation of the original word. List the top 3-5 most common meanings, grouped by their part of speech (e.g., Noun, Verb). Format the output strictly as JSON.`;
    
    const schema = isPhrase ? phraseSchema : wordSchema;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    if (isPhrase) {
        return {
            pronunciation: '',
            meanings: [{
                partOfSpeech: 'Cümle',
                translations: [parsedJson.translation]
            }]
        }
    }
    return parsedJson as DetailedTranslationResult;
  } catch (error) {
    if (error instanceof Error && (error.message.includes("API key not valid") || error.message.includes("provide an API key") || error.message.includes("was not found"))) {
        onInvalidApiKey();
    }
    console.error("Error translating text or parsing JSON:", error);
    return null;
  }
};

export const getTextToSpeech = async (apiKey: string, text: string, langCode: string, onInvalidApiKey: () => void): Promise<string | null> => {
  if (!text.trim()) {
    return null;
  }
  
  const ai = new GoogleGenAI({ apiKey });
  const voiceName = langCode === 'tr' ? 'Kore' : 'Zephyr';

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voiceName }, 
                },
            },
        },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch(error) {
    if (error instanceof Error && (error.message.includes("API key not valid") || error.message.includes("provide an API key") || error.message.includes("was not found"))) {
        onInvalidApiKey();
    }
    console.error("Error generating speech:", error);
    return null;
  }
};
