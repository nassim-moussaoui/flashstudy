
import { GoogleGenAI } from "@google/genai";
import { QuizQuestion, Course, FlashcardItem, ChatMessage } from "../types";

/**
 * Helper to construct parts based on course type (Text or File).
 */
const getCourseContentParts = (course: Course, prompt: string) => {
  const parts: any[] = [];
  
  if (course.fileData) {
    parts.push({
      inlineData: {
        mimeType: course.fileData.mimeType,
        data: course.fileData.data
      }
    });
    parts.push({ text: prompt });
  } else if (course.content) {
    parts.push({ 
      text: `${prompt}\n\nCourse Content:\n${course.content.substring(0, 30000)}` 
    });
  }
  
  return parts;
};

/**
 * Helper to retry a request when the model is temporarily overloaded (503).
 */
const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delayMs = 1500): Promise<T> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isOverloaded = error?.message?.includes('"code":503') || error?.message?.includes('UNAVAILABLE');
      if (!isOverloaded || attempt === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
  throw new Error("Unreachable");
};

/**
 * Helper to safely parse JSON from model output.
 */
const safeParseJSON = (text: string) => {
  try {
    const cleanText = text.replace(/```json\s*|\s*```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("JSON Parse Error:", error);
    throw new Error("Failed to parse model response as JSON.");
  }
};

/**
 * 1. Generate Quiz
 */
export const generateQuiz = async (course: Course): Promise<QuizQuestion[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await withRetry(() => ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: getCourseContentParts(course, "Analyse ce cours et génère un quiz de 5 questions à choix multiples complexes. Les questions doivent tester la compréhension profonde. Réponds en Français.")
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "INTEGER" },
            question: { type: "STRING" },
            options: {
              type: "ARRAY",
              items: { type: "STRING" }
            },
            correctAnswer: { type: "INTEGER", description: "Index de la bonne réponse (0-3)" },
            explanation: { type: "STRING" }
          },
          required: ["id", "question", "options", "correctAnswer", "explanation"],
        }
      },
      systemInstruction: "Tu es un tuteur expert créant des évaluations académiques.",
    }
  }));

  if (response.text) {
    return safeParseJSON(response.text) as QuizQuestion[];
  }
  throw new Error("Failed to generate quiz content.");
};

/**
 * 2. Generate Flashcards (Summary)
 */
export const generateSummary = async (course: Course): Promise<FlashcardItem[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Crée un jeu de 12 flashcards de haute qualité pour maîtriser ce cours.
    - Front: Concept clé, terme spécifique ou question.
    - Back: Explication claire et concise ou réponse.
    - Tag: Catégorie de la carte.
    - Langue: Français.
  `;
  
  const response = await withRetry(() => ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: getCourseContentParts(course, prompt)
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "INTEGER" },
            front: { type: "STRING" },
            back: { type: "STRING" },
            tag: { type: "STRING" }
          },
          required: ["id", "front", "back", "tag"],
        }
      },
      systemInstruction: "Tu es un tuteur expert créant des fiches de mémorisation.",
    }
  }));

  if (response.text) {
    return safeParseJSON(response.text) as FlashcardItem[];
  }
  throw new Error("Failed to generate flashcards.");
};

/**
 * 3. Chat with Course
 */
export const getChatResponse = async (course: Course, history: ChatMessage[], newMessage: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Question de l'étudiant: "${newMessage}"\n\nRéponds de manière pédagogique en te basant sur le cours fourni.`;

  const response = await withRetry(() => ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: getCourseContentParts(course, prompt)
    },
    config: {
      systemInstruction: "Tu es un assistant pédagogique personnel.",
    }
  }));

  if (response.text) {
    return response.text;
  }
  throw new Error("Erreur assistant.");
};
