export type NoteColor = "yellow" | "red" | "green" | "blue" | "purple" | "orange";

export interface Note {
  id: string;
  title: string;
  content: string;
  transcription?: string;
  type: 'text' | 'voice';
  color: NoteColor;
  pinned: boolean;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface AIAnalysis {
  summary: string;
  keyPoints: string[];
  sentiment: 'positif' | 'négatif' | 'neutre';
}

export interface AppSettings {
  apiKey: string;
  darkMode: boolean;
  language: "fr" | "en";
  notifications?: boolean;
  autoSave?: boolean;
}
