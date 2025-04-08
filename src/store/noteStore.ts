
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Note, NoteColor, ChatMessage, AIAnalysis } from '../types/note';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NoteState {
  notes: Note[];
  currentNote: Note | null;
  isRecording: boolean;
  chatMessages: ChatMessage[];
  aiAnalysis: AIAnalysis | null;
  isLoading: boolean;
  
  // Actions
  fetchNotes: () => Promise<void>;
  addNote: (title: string, content: string, type: 'text' | 'voice', color?: NoteColor, audioUrl?: string) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setCurrentNote: (note: Note | null) => void;
  togglePinNote: (id: string) => Promise<void>;
  archiveNote: (id: string) => Promise<void>;
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
  isLoading: false,
  
  fetchNotes: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('archived', false)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error("Erreur lors du chargement des notes");
        console.error("Erreur lors du chargement des notes:", error);
        return;
      }
      
      // Conversion des dates pour chaque note
      const notesWithDates = data.map(note => ({
        ...note,
        createdAt: new Date(note.created_at),
        updatedAt: new Date(note.updated_at),
      }));
      
      set({ notes: notesWithDates });
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement des notes");
    } finally {
      set({ isLoading: false });
    }
  },
  
  addNote: async (title, content, type, color = 'yellow', audioUrl) => {
    try {
      const newNote = {
        title,
        content,
        type,
        color,
        audioUrl,
        pinned: false,
        archived: false
      };
      
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: newNote.title,
          content: newNote.content,
          type: newNote.type,
          color: newNote.color,
          pinned: newNote.pinned,
          archived: newNote.archived
        }])
        .select()
        .single();
      
      if (error) {
        toast.error("Erreur lors de la création de la note");
        console.error("Erreur lors de la création de la note:", error);
        throw error;
      }
      
      // Conversion des dates
      const noteWithDates = {
        ...data,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
      
      set((state) => ({
        notes: [noteWithDates, ...state.notes],
        currentNote: noteWithDates
      }));
      
      toast.success("Note créée avec succès");
      return noteWithDates;
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la création de la note");
      throw error;
    }
  },
  
  updateNote: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          ...updates,
          updated_at: new Date()
        })
        .eq('id', id);
      
      if (error) {
        toast.error("Erreur lors de la mise à jour de la note");
        console.error("Erreur lors de la mise à jour de la note:", error);
        return;
      }
      
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
      
      toast.success("Note mise à jour avec succès");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise à jour de la note");
    }
  },
  
  deleteNote: async (id) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error("Erreur lors de la suppression de la note");
        console.error("Erreur lors de la suppression de la note:", error);
        return;
      }
      
      set((state) => ({
        notes: state.notes.filter(note => note.id !== id),
        currentNote: state.currentNote?.id === id ? null : state.currentNote
      }));
      
      toast.success("Note supprimée avec succès");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression de la note");
    }
  },
  
  setCurrentNote: (note) => {
    set(() => ({ currentNote: note, chatMessages: [] }));
  },
  
  togglePinNote: async (id) => {
    const note = get().notes.find(note => note.id === id);
    if (!note) return;
    
    try {
      const { error } = await supabase
        .from('notes')
        .update({ pinned: !note.pinned })
        .eq('id', id);
      
      if (error) {
        toast.error("Erreur lors de l'épinglage de la note");
        console.error("Erreur lors de l'épinglage de la note:", error);
        return;
      }
      
      set((state) => ({
        notes: state.notes.map(note => 
          note.id === id ? { ...note, pinned: !note.pinned } : note
        ),
        currentNote: state.currentNote?.id === id 
          ? { ...state.currentNote, pinned: !state.currentNote.pinned } 
          : state.currentNote
      }));
      
      toast.success(note.pinned ? "Note désépinglée" : "Note épinglée");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'épinglage de la note");
    }
  },
  
  archiveNote: async (id) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ archived: true })
        .eq('id', id);
      
      if (error) {
        toast.error("Erreur lors de l'archivage de la note");
        console.error("Erreur lors de l'archivage de la note:", error);
        return;
      }
      
      set((state) => ({
        notes: state.notes.filter(note => note.id !== id),
        currentNote: state.currentNote?.id === id ? null : state.currentNote
      }));
      
      toast.success("Note archivée avec succès");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'archivage de la note");
    }
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
