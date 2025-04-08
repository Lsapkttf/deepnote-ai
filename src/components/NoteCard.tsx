
import { Note } from "@/types/note";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Pin, Mic, Archive, Trash } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onPin: () => void;
  onDelete: () => void;
  onArchive: () => void;
}

const NoteCard = ({ note, onClick, onPin, onDelete, onArchive }: NoteCardProps) => {
  const getPreviewText = () => {
    if (note.type === 'voice' && note.transcription) {
      return note.transcription;
    }
    return note.content;
  };

  return (
    <div 
      className={cn(
        "note-card group relative rounded-lg p-4 shadow-sm transition-all hover:shadow-md",
        `bg-note-${note.color}`,
        note.pinned && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      {note.pinned && (
        <div className="absolute top-2 right-2">
          <Pin className="h-4 w-4 fill-current" />
        </div>
      )}
      
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-lg truncate">{note.title || "Sans titre"}</h3>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPin(); }}>
              {note.pinned ? "Désépingler" : "Épingler"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive(); }}>
              <Archive className="h-4 w-4 mr-2" />
              Archiver
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-destructive focus:text-destructive"
            >
              <Trash className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="mt-2 text-sm line-clamp-3 min-h-[3rem]">{getPreviewText()}</div>
      
      <div className="mt-3 text-xs text-muted-foreground flex justify-between items-center">
        <span>
          {formatDistanceToNow(new Date(note.createdAt), { 
            addSuffix: true,
            locale: fr
          })}
        </span>
        
        {note.type === 'voice' && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Mic className="h-3 w-3 mr-1" />
            <span>Note vocale</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteCard;
