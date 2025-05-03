
import { useState, useMemo } from 'react';
import { Note } from '@/types/note';

export const useNotesFiltering = (notes: Note[], selectedCategory: string, searchQuery: string) => {
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      if (selectedCategory === "notes" && note.archived) return false;
      if (selectedCategory === "recent") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return new Date(note.createdAt) >= oneWeekAgo && !note.archived;
      }
      if (selectedCategory === "archive" && !note.archived) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          note.title.toLowerCase().includes(query) || 
          note.content.toLowerCase().includes(query) ||
          (note.transcription && note.transcription.toLowerCase().includes(query))
        );
      }
      
      return true;
    });
  }, [notes, selectedCategory, searchQuery]);

  return filteredNotes;
};
