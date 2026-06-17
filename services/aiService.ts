import { GoogleGenAI } from "@google/genai";
import { QuizQuestion, Course, FlashcardItem, ChatMessage } from "../types";

const AI_PROVIDER = import.meta.env.VITE_AI_PROVIDER || 'gemini';
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY || '';
const AI_MODEL = import.meta.env.VITE_AI_MODEL || '';

// ─── Utilitaires partagés ────────────────────────────────────────────────────

const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delayMs = 1500): Promise<T> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isOverloaded =
        error?.message?.includes('"code":503') ||
        error?.message?.includes('UNAVAILABLE') ||
        error?.status === 503;
      if (!isOverloaded || attempt === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
  throw new Error("Unreachable");
};

const safeParseJSON = (text: string) => {
  try {
    return JSON.parse(text.replace(/```json\s*|\s*```/g, "").trim());
  } catch {
    throw new Error("Impossible de parser la réponse de l'IA en JSON.");
  }
};

// ─── Provider Gemini ─────────────────────────────────────────────────────────

const geminiParts = (course: Course, prompt: string) => {
  if (course.fileData) {
    return [
      { inlineData: { mimeType: course.fileData.mimeType, data: course.fileData.data } },
      { text: prompt }
    ];
  }
  return [{ text: `${prompt}\n\nContenu du cours :\n${course.content?.substring(0, 30000) ?? ''}` }];
};

const geminiGenerate = (course: Course, prompt: string, system: string, schema: object, model: string) => {
  const ai = new GoogleGenAI({ apiKey: AI_API_KEY });
  return withRetry(() =>
    ai.models.generateContent({
      model,
      contents: { parts: geminiParts(course, prompt) },
      config: { responseMimeType: "application/json", responseSchema: schema as any, systemInstruction: system }
    })
  );
};

const geminiGenerateQuiz = async (course: Course): Promise<QuizQuestion[]> => {
  const model = AI_MODEL || 'gemini-2.5-flash';
  const response = await geminiGenerate(
    course,
    "Analyse ce cours et génère un quiz de 5 questions à choix multiples complexes. Les questions doivent tester la compréhension profonde. Réponds en Français.",
    "Tu es un tuteur expert créant des évaluations académiques.",
    {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "INTEGER" },
          question: { type: "STRING" },
          options: { type: "ARRAY", items: { type: "STRING" } },
          correctAnswer: { type: "INTEGER", description: "Index de la bonne réponse (0-3)" },
          explanation: { type: "STRING" }
        },
        required: ["id", "question", "options", "correctAnswer", "explanation"]
      }
    },
    model
  );
  if (response.text) return safeParseJSON(response.text) as QuizQuestion[];
  throw new Error("Échec de la génération du quiz.");
};

const geminiGenerateFlashcards = async (course: Course): Promise<FlashcardItem[]> => {
  const model = AI_MODEL || 'gemini-2.5-flash';
  const response = await geminiGenerate(
    course,
    "Crée un jeu de 12 flashcards de haute qualité pour maîtriser ce cours. Front: concept clé. Back: explication concise. Tag: catégorie. Langue: Français.",
    "Tu es un tuteur expert créant des fiches de mémorisation.",
    {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "INTEGER" },
          front: { type: "STRING" },
          back: { type: "STRING" },
          tag: { type: "STRING" }
        },
        required: ["id", "front", "back", "tag"]
      }
    },
    model
  );
  if (response.text) return safeParseJSON(response.text) as FlashcardItem[];
  throw new Error("Échec de la génération des flashcards.");
};

const geminiGetChatResponse = async (course: Course, _history: ChatMessage[], newMessage: string): Promise<string> => {
  const model = AI_MODEL || 'gemini-2.5-flash';
  const ai = new GoogleGenAI({ apiKey: AI_API_KEY });
  const prompt = `Question de l'étudiant: "${newMessage}"\n\nRéponds de manière pédagogique en te basant sur le cours fourni.`;
  const response = await withRetry(() =>
    ai.models.generateContent({
      model,
      contents: { parts: geminiParts(course, prompt) },
      config: { systemInstruction: "Tu es un assistant pédagogique personnel." }
    })
  );
  if (response.text) return response.text;
  throw new Error("Erreur de l'assistant.");
};

// ─── Provider OpenAI ─────────────────────────────────────────────────────────

const openaiRequest = async (system: string, user: string, jsonMode: boolean): Promise<string> => {
  const model = AI_MODEL || 'gpt-4o-mini';
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
  };

  const res = await withRetry(async () => {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${AI_API_KEY}` },
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      const msg = (err as any).error?.message || `OpenAI erreur ${r.status}`;
      // 503 → retry, autre → throw direct
      const e: any = new Error(msg);
      if (r.status === 503) e.status = 503;
      throw e;
    }
    return r.json();
  });

  return (res as any).choices[0].message.content;
};

const openaiCourseText = (course: Course): string => {
  if (course.fileData) {
    throw new Error(
      "Les fichiers PDF ne sont pas supportés avec OpenAI. Changez VITE_AI_PROVIDER=gemini ou collez le texte directement."
    );
  }
  return course.content?.substring(0, 30000) ?? '';
};

const openaiGenerateQuiz = async (course: Course): Promise<QuizQuestion[]> => {
  const text = openaiCourseText(course);
  const raw = await openaiRequest(
    "Tu es un tuteur expert. Réponds uniquement en JSON valide, en Français.",
    `Cours :\n${text}\n\nGénère un quiz de 5 questions. Format JSON : {"questions":[{"id":1,"question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"..."}]}`,
    true
  );
  const parsed = safeParseJSON(raw);
  return (parsed.questions ?? parsed) as QuizQuestion[];
};

const openaiGenerateFlashcards = async (course: Course): Promise<FlashcardItem[]> => {
  const text = openaiCourseText(course);
  const raw = await openaiRequest(
    "Tu es un tuteur expert. Réponds uniquement en JSON valide, en Français.",
    `Cours :\n${text}\n\nCrée 12 flashcards. Format JSON : {"cards":[{"id":1,"front":"concept","back":"explication","tag":"catégorie"}]}`,
    true
  );
  const parsed = safeParseJSON(raw);
  return (parsed.cards ?? parsed) as FlashcardItem[];
};

const openaiGetChatResponse = async (course: Course, _history: ChatMessage[], newMessage: string): Promise<string> => {
  const text = openaiCourseText(course);
  return openaiRequest(
    "Tu es un assistant pédagogique. Base-toi sur le cours fourni. Réponds en Français.",
    `Cours de référence :\n${text}\n\nQuestion : ${newMessage}`,
    false
  );
};

// ─── Router public ───────────────────────────────────────────────────────────

export const generateQuiz = (course: Course): Promise<QuizQuestion[]> => {
  switch (AI_PROVIDER) {
    case 'openai': return openaiGenerateQuiz(course);
    default:       return geminiGenerateQuiz(course);
  }
};

export const generateSummary = (course: Course): Promise<FlashcardItem[]> => {
  switch (AI_PROVIDER) {
    case 'openai': return openaiGenerateFlashcards(course);
    default:       return geminiGenerateFlashcards(course);
  }
};

export const getChatResponse = (course: Course, history: ChatMessage[], message: string): Promise<string> => {
  switch (AI_PROVIDER) {
    case 'openai': return openaiGetChatResponse(course, history, message);
    default:       return geminiGetChatResponse(course, history, message);
  }
};
