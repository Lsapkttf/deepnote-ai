
import React from 'react';
import { Loader2 } from 'lucide-react';
import NoteCard from '@/components/NoteCard';
import FuturisticButton from '@/components/FuturisticButton';
import { Note } from '@/types/note';
import { Plus, Mic } from 'lucide-react';

interface NotesListProps {
  isLoading: boolean;
  notes: Note[];
  searchQuery: string;
  selectedCategory: string;
  viewMode: 'grid' | 'list';
  handleNoteClick: (note: Note) => void;
  togglePinNote: (id: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  handleArchiveNote: (id: string) => Promise<void>;
  handleNewTextNote: () => void;
  handleNewVoiceNote: () => void;
  isMobile: boolean;
}

const NotesList: React.FC<NotesListProps> = ({
  isLoading,
  notes,
  searchQuery,
  selectedCategory,
  viewMode,
  handleNoteClick,
  togglePinNote,
  deleteNote,
  handleArchiveNote,
  handleNewTextNote,
  handleNewVoiceNote,
  isMobile
}) => {
  // Sort notes - pinned notes first, then by date
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Chargement des notes...</p>
      </div>
    );
  }

  if (sortedNotes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
        <p className="mb-4">
          {searchQuery 
            ? "Aucune note ne correspond à votre recherche"
            : selectedCategory === "archive" 
              ? "Aucune note archivée" 
              : "Aucune note"}
        </p>
        {!isMobile && (selectedCategory !== "archive" && !searchQuery) && (
          <div className="flex space-x-4">
            <FuturisticButton gradient glow onClick={handleNewTextNote}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle note
            </FuturisticButton>
            <FuturisticButton variant="outline" onClick={handleNewVoiceNote}>
              <Mic className="h-4 w-4 mr-2" />
              Note vocale
            </FuturisticButton>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={viewMode === "grid" 
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
      : "flex flex-col gap-3"
    }>
      {sortedNotes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          listMode={viewMode === "list"}
          onClick={() => handleNoteClick(note)}
          onPin={() => togglePinNote(note.id)}
          onDelete={() => deleteNote(note.id)}
          onArchive={() => handleArchiveNote(note.id)}
        />
      ))}
    </div>
  );
};

export default NotesList;
