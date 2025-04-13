
import { Note } from "@/types/note";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Mic, Pin, Archive, Trash, MoreVertical } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NoteCardProps {
  note: Note;
  listMode?: boolean;
  onClick: () => void;
  onPin: () => void;
  onDelete: () => void;
  onArchive: () => void;
}

const NoteCard = ({
  note,
  listMode = false,
  onClick,
  onPin,
  onDelete,
  onArchive,
}: NoteCardProps) => {
  const [showActions, setShowActions] = useState(false);
  
  const formattedDate = formatDistanceToNow(new Date(note.updatedAt || note.createdAt), {
    addSuffix: true,
    locale: fr,
  });
  
  // Préparer le contenu à afficher (limité en longueur)
  const displayContent = note.type === 'voice' && note.transcription
    ? note.transcription
    : note.content;
  
  const truncatedContent = displayContent.length > 150
    ? `${displayContent.substring(0, 150)}...`
    : displayContent;
  
  if (listMode) {
    return (
      <div
        onClick={onClick}
        className={cn(
          "note-card transition-all duration-200 hover:shadow-md rounded-lg border border-border",
          `bg-note-${note.color}`,
          note.pinned && "ring-2 ring-primary/50",
          "flex items-center gap-3 pr-2"
        )}
      >
        <div className="flex-1 min-w-0 p-3">
          <div className="flex items-center gap-2 mb-1">
            {note.type === 'voice' && (
              <Mic className="h-3.5 w-3.5 text-foreground/70" />
            )}
            <h3 className="font-medium truncate">{note.title}</h3>
            {note.pinned && (
              <Pin className="h-3.5 w-3.5 fill-foreground/70 text-foreground/70" />
            )}
          </div>
          <p className="text-sm text-foreground/80 line-clamp-1">{truncatedContent}</p>
          <p className="text-xs text-foreground/60 mt-1">{formattedDate}</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-foreground/10">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onPin();
            }}>
              <Pin className="mr-2 h-4 w-4" />
              {note.pinned ? "Désépingler" : "Épingler"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onArchive();
            }}>
              <Archive className="mr-2 h-4 w-4" />
              {note.archived ? "Désarchiver" : "Archiver"}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onTouchStart={() => setShowActions(true)}
      className={cn(
        "note-card relative group h-full p-4 rounded-lg border border-border",
        `bg-note-${note.color}`,
        note.pinned && "ring-2 ring-primary/50"
      )}
    >
      {note.pinned && (
        <Pin className="absolute top-2 right-2 h-4 w-4 fill-foreground/70 text-foreground/70" />
      )}
      
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-1">
          {note.type === 'voice' && (
            <Mic className="h-3.5 w-3.5 text-foreground/70" />
          )}
          <h3 className="font-medium truncate">{note.title}</h3>
        </div>
        
        <p className="text-sm text-foreground/80 line-clamp-4 flex-1">{truncatedContent}</p>
        
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-foreground/60">{formattedDate}</p>
          
          <div className={cn(
            "flex gap-0.5",
            showActions ? "opacity-100" : "opacity-0 lg:group-hover:opacity-100"
          )}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin();
              }}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-foreground/10"
            >
              <Pin className="h-3.5 w-3.5" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onArchive();
              }}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-foreground/10"
            >
              <Archive className="h-3.5 w-3.5" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-foreground/10 text-destructive"
            >
              <Trash className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
