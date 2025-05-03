
export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'voice' | 'image';
  color: NoteColor;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
  pinned?: boolean;
  transcription?: string;
  audioUrl?: string;
}

export type NoteColor = 'yellow' | 'red' | 'green' | 'blue' | 'purple' | 'orange';

export interface AppSettings {
  darkMode: boolean;
  language: 'fr' | 'en';
  notifications: boolean;
  autoSave: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIAnalysis {
  summary: string;
  keyPoints: string[];
  sentiment: string;
}
