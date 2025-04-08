
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Note, NoteColor, ChatMessage, AIAnalysis } from '../types/note';

interface NoteState {
  notes: Note[];
  currentNote: Note | null;
  isRecording: boolean;
  chatMessages: ChatMessage[];
  aiAnalysis: AIAnalysis | null;
  
  // Actions
  addNote: (title: string, content: string, type: 'text' | 'voice', color?: NoteColor, audioUrl?: string) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setCurrentNote: (note: Note | null) => void;
  togglePinNote: (id: string) => void;
  setIsRecording: (isRecording: boolean) => void;
  addChatMessage: (content: string, role: 'user' | 'assistant') => void;
  setAIAnalysis: (analysis: AIAnalysis | null) => void;
  clearChatMessages: () => void;
}

const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  currentNote: null,
  isRecording: false,
  chatMessages: [],
  aiAnalysis: null,
  
  addNote: (title, content, type, color = 'yellow', audioUrl) => {
    const newNote: Note = {
      id: uuidv4(),
      title,
      content,
      type,
      color,
      audioUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      pinned: false
    };
    
    set((state) => ({
      notes: [newNote, ...state.notes],
      currentNote: newNote,
    }));
    
    return newNote;
  },
  
  updateNote: (id, updates) => {
    set((state) => ({
      notes: state.notes.map(note => 
        note.id === id 
          ? { ...note, ...updates, updatedAt: new Date() } 
          : note
      ),
      currentNote: state.currentNote?.id === id 
        ? { ...state.currentNote, ...updates, updatedAt: new Date() } 
        : state.currentNote
    }));
  },
  
  deleteNote: (id) => {
    set((state) => ({
      notes: state.notes.filter(note => note.id !== id),
      currentNote: state.currentNote?.id === id ? null : state.currentNote
    }));
  },
  
  setCurrentNote: (note) => {
    set(() => ({ currentNote: note, chatMessages: [] }));
  },
  
  togglePinNote: (id) => {
    set((state) => ({
      notes: state.notes.map(note => 
        note.id === id ? { ...note, pinned: !note.pinned } : note
      ),
      currentNote: state.currentNote?.id === id 
        ? { ...state.currentNote, pinned: !state.currentNote.pinned } 
        : state.currentNote
    }));
  },
  
  setIsRecording: (isRecording) => {
    set(() => ({ isRecording }));
  },
  
  addChatMessage: (content, role) => {
    const newMessage: ChatMessage = {
      id: uuidv4(),
      content,
      role,
      timestamp: new Date()
    };
    
    set((state) => ({
      chatMessages: [...state.chatMessages, newMessage]
    }));
  },
  
  setAIAnalysis: (analysis) => {
    set(() => ({ aiAnalysis: analysis }));
  },
  
  clearChatMessages: () => {
    set(() => ({ chatMessages: [] }));
  }
}));

export default useNoteStore;
