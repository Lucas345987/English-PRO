import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PronunciationResult {
  text: string;
  ipa: string;
  meaning: string;
  examples: string[];
}

export async function getPronunciationAndMeaning(text: string): Promise<PronunciationResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following English text for a Portuguese-speaking language learner. Provide its phonetic transcription (IPA), meaning/definition in Portuguese, and a couple of example sentences in English (with their Portuguese translations). Text: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: "The original text in English.",
          },
          ipa: {
            type: Type.STRING,
            description: "The phonetic transcription (IPA) of the text.",
          },
          meaning: {
            type: Type.STRING,
            description: "The meaning or definition of the text in Portuguese.",
          },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
            description: "2-3 example sentences using the text in English, followed by their Portuguese translation.",
          },
        },
        required: ["text", "ipa", "meaning", "examples"],
      },
    },
  });

  const jsonStr = response.text?.trim() || "{}";
  return JSON.parse(jsonStr) as PronunciationResult;
}

export async function generateSpeech(text: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say the following text in English: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("Failed to generate audio");
  }
  return base64Audio;
}

export async function translateText(text: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate the following English text to Brazilian Portuguese. Only return the translation, nothing else.\n\nText: ${text}`,
  });
  return response.text || '';
}

export interface QuizQuestion {
  type: 'multiple_choice' | 'typing';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export async function generateQuestions(topic: string, level: string): Promise<QuizQuestion[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 5 English questions about the topic '${topic}' for a Portuguese-speaking English learner at the '${level}' level. 
    Include a mix of multiple-choice questions ("multiple_choice") and fill-in-the-blank/typing questions ("typing").
    The questions MUST be in English to test their knowledge. The explanation for the correct answer MUST be in Portuguese.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: {
              type: Type.STRING,
              description: "The type of question: 'multiple_choice' or 'typing'.",
            },
            question: {
              type: Type.STRING,
              description: "The question text in English. For 'typing' questions, use '___' to indicate where the user should type the answer.",
            },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: "An array of 4 possible answers in English. ONLY include this if type is 'multiple_choice'.",
            },
            correctAnswer: {
              type: Type.STRING,
              description: "The correct answer. For 'multiple_choice', it must exactly match one of the options. For 'typing', it should be the exact word or short phrase to type.",
            },
            explanation: {
              type: Type.STRING,
              description: "A short explanation in Portuguese of why the answer is correct.",
            },
          },
          required: ["type", "question", "correctAnswer", "explanation"],
        },
      },
    },
  });

  const jsonStr = response.text?.trim() || "[]";
  return JSON.parse(jsonStr) as QuizQuestion[];
}
