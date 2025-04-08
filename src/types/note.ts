
export type NoteType = 'text' | 'voice';
export type NoteColor = 'yellow' | 'red' | 'green' | 'blue' | 'purple' | 'orange';

export interface Note {
  id: string;
  title: string;
  content: string;
  transcription?: string;
  summary?: string;
  type: NoteType;
  color: NoteColor;
  audioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  pinned: boolean;
  archived: boolean;
}

export interface AIAnalysis {
  summary: string;
  keyPoints: string[];
  sentiment: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
