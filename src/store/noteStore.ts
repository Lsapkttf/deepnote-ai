
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
  fetchArchivedNotes: () => Promise<void>;
  addNote: (title: string, content: string, type: 'text' | 'voice' | 'image', color?: NoteColor, audioUrl?: string) => Promise<Note>;
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
      console.log("Chargement des notes...");
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.log("Aucun utilisateur connecté");
        set({ notes: [], isLoading: false });
        return;
      }
      
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('archived', false)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error("Erreur lors du chargement des notes");
        console.error("Erreur lors du chargement des notes:", error);
        return;
      }
      
      console.log(`${data?.length || 0} notes chargées`);
      
      // Conversion des dates pour chaque note
      const notesWithDates = data ? data.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content || "",
        transcription: note.transcription || undefined,
        type: note.type as 'text' | 'voice',
        color: note.color as NoteColor,
        pinned: note.pinned || false,
        archived: note.archived || false,
        createdAt: new Date(note.created_at),
        updatedAt: new Date(note.updated_at)
      })) : [];
      
      set({ notes: notesWithDates });
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement des notes");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchArchivedNotes: async () => {
    set({ isLoading: true });
    try {
      console.log("Chargement des notes archivées...");
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.log("Aucun utilisateur connecté");
        set({ notes: [], isLoading: false });
        return;
      }
      
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('archived', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error("Erreur lors du chargement des notes archivées");
        console.error("Erreur lors du chargement des notes archivées:", error);
        return;
      }
      
      console.log(`${data?.length || 0} notes archivées chargées`);
      
      // Conversion des dates pour chaque note
      const notesWithDates = data ? data.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content || "",
        transcription: note.transcription || undefined,
        type: note.type as 'text' | 'voice',
        color: note.color as NoteColor,
        pinned: note.pinned || false,
        archived: note.archived || false,
        createdAt: new Date(note.created_at),
        updatedAt: new Date(note.updated_at)
      })) : [];
      
      set({ notes: notesWithDates });
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement des notes archivées");
    } finally {
      set({ isLoading: false });
    }
  },
  
  addNote: async (title, content, type, color = 'yellow', audioUrl) => {
    try {
      console.log("Création d'une nouvelle note:", { title, type, color });
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast.error("Vous devez être connecté pour créer une note");
        throw new Error("Non authentifié");
      }
      
      const newNoteData = {
        title,
        content,
        type,
        color,
        pinned: false,
        archived: false,
        user_id: userData.user.id
      };
      
      const { data, error } = await supabase
        .from('notes')
        .insert([newNoteData])
        .select()
        .single();
      
      if (error) {
        toast.error("Erreur lors de la création de la note");
        console.error("Erreur lors de la création de la note:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("Aucune donnée retournée après l'insertion");
      }
      
      console.log("Note créée avec succès:", data.id);
      
      // Conversion des dates
      const noteWithDates: Note = {
        id: data.id,
        title: data.title,
        content: data.content || "",
        transcription: data.transcription || undefined,
        type: data.type as 'text' | 'voice' | 'image',
        color: data.color as NoteColor,
        pinned: !!data.pinned,
        archived: !!data.archived,
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
      console.log("Mise à jour de la note:", id, updates);
      
      // Get current user to verify ownership
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast.error("Vous devez être connecté pour modifier une note");
        throw new Error("Non authentifié");
      }
      
      // Verify ownership before updating
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select('user_id')
        .eq('id', id)
        .single();
      
      if (noteError || !noteData) {
        toast.error("Note introuvable");
        console.error("Erreur lors de la vérification de la note:", noteError);
        return;
      }
      
      if (noteData.user_id !== userData.user.id) {
        toast.error("Vous n'êtes pas autorisé à modifier cette note");
        return;
      }
      
      // Conversion du format des données pour Supabase
      const supabaseUpdates: any = { ...updates };
      
      // Convertir les noms de propriétés dans le format attendu par Supabase
      if (updates.createdAt) supabaseUpdates.created_at = updates.createdAt;
      if (updates.updatedAt) supabaseUpdates.updated_at = updates.updatedAt;
      
      // Supprimer les propriétés qui ne sont pas présentes dans la table Supabase
      delete supabaseUpdates.createdAt;
      delete supabaseUpdates.updatedAt;
      
      const { error } = await supabase
        .from('notes')
        .update({
          ...supabaseUpdates,
          updated_at: new Date()
        })
        .eq('id', id);
      
      if (error) {
        toast.error("Erreur lors de la mise à jour de la note");
        console.error("Erreur lors de la mise à jour de la note:", error);
        return;
      }
      
      console.log("Note mise à jour avec succès");
      
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
      console.log("Suppression de la note:", id);
      
      // Get current user to verify ownership
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast.error("Vous devez être connecté pour supprimer une note");
        throw new Error("Non authentifié");
      }
      
      // Verify ownership before deleting
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select('user_id')
        .eq('id', id)
        .single();
      
      if (noteError || !noteData) {
        toast.error("Note introuvable");
        console.error("Erreur lors de la vérification de la note:", noteError);
        return;
      }
      
      if (noteData.user_id !== userData.user.id) {
        toast.error("Vous n'êtes pas autorisé à supprimer cette note");
        return;
      }
      
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error("Erreur lors de la suppression de la note");
        console.error("Erreur lors de la suppression de la note:", error);
        return;
      }
      
      console.log("Note supprimée avec succès");
      
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
    console.log("Note actuelle définie:", note?.id);
    set(() => ({ currentNote: note, chatMessages: [] }));
  },
  
  togglePinNote: async (id) => {
    const note = get().notes.find(note => note.id === id);
    if (!note) return;
    
    try {
      console.log(`${note.pinned ? "Désépinglage" : "Épinglage"} de la note:`, id);
      
      // Get current user to verify ownership
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast.error("Vous devez être connecté pour modifier une note");
        throw new Error("Non authentifié");
      }
      
      // Verify ownership before updating
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select('user_id')
        .eq('id', id)
        .single();
      
      if (noteError || !noteData) {
        toast.error("Note introuvable");
        console.error("Erreur lors de la vérification de la note:", noteError);
        return;
      }
      
      if (noteData.user_id !== userData.user.id) {
        toast.error("Vous n'êtes pas autorisé à modifier cette note");
        return;
      }
      
      const { error } = await supabase
        .from('notes')
        .update({ pinned: !note.pinned })
        .eq('id', id);
      
      if (error) {
        toast.error("Erreur lors de l'épinglage de la note");
        console.error("Erreur lors de l'épinglage de la note:", error);
        return;
      }
      
      console.log(`Note ${note.pinned ? "désépinglée" : "épinglée"} avec succès`);
      
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
      console.log("Archivage de la note:", id);
      
      // Get current user to verify ownership
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast.error("Vous devez être connecté pour archiver une note");
        throw new Error("Non authentifié");
      }
      
      // Verify ownership before updating
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select('user_id')
        .eq('id', id)
        .single();
      
      if (noteError || !noteData) {
        toast.error("Note introuvable");
        console.error("Erreur lors de la vérification de la note:", noteError);
        return;
      }
      
      if (noteData.user_id !== userData.user.id) {
        toast.error("Vous n'êtes pas autorisé à archiver cette note");
        return;
      }
      
      const { error } = await supabase
        .from('notes')
        .update({ archived: true })
        .eq('id', id);
      
      if (error) {
        toast.error("Erreur lors de l'archivage de la note");
        console.error("Erreur lors de l'archivage de la note:", error);
        return;
      }
      
      console.log("Note archivée avec succès");
      
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
    console.log("Ajout d'un message au chat:", { role, contentLength: content.length });
    
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
    console.log("Définition de l'analyse IA:", analysis ? "présent" : "nulle");
    set(() => ({ aiAnalysis: analysis }));
  },
  
  clearChatMessages: () => {
    console.log("Effacement des messages du chat");
    set(() => ({ chatMessages: [] }));
  }
}));

export default useNoteStore;
