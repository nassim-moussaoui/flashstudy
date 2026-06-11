// types.ts

export enum ContentType {
  QUIZ = 'QUIZ',
  SUMMARY = 'SUMMARY' // Used for Flashcards
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  explanation: string;
}

export interface FlashcardItem {
  id: number;
  front: string; // The concept or question
  back: string;  // The definition or answer
  tag: string;   // Category (e.g., "Date", "Concept", "Personnage")
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface GeneratedContent {
  id: string;
  courseId: string;
  type: ContentType;
  title: string;
  createdAt: number;
  data: QuizQuestion[] | FlashcardItem[] | string; // Removed MindMapNode
}

export interface Folder {
  id: string;
  name: string;
  created_at?: string;
}

export interface Course {
  id: string;
  folderId?: string; // Optional linkage to a folder
  title: string;
  subject: string;
  color: string;
  createdAt: number;
  content?: string; 
  fileData?: {
    mimeType: string;
    data: string; // Base64 string
    fileName: string;
  };
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string; // YYYY-MM-DD
  updated_at?: string;
  email?: string;
}