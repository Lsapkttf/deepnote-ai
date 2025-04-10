
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
  listMode?: boolean; // Added this property
}

const NoteCard = ({ note, onClick, onPin, onDelete, onArchive, listMode = false }: NoteCardProps) => {
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
        note.pinned && "ring-2 ring-primary",
        listMode && "flex flex-row items-center gap-4"
      )}
      onClick={onClick}
    >
      {note.pinned && (
        <div className={cn("absolute top-2 right-2", listMode && "static mr-2")}>
          <Pin className="h-4 w-4 fill-current" />
        </div>
      )}
      
      <div className={cn(
        "flex justify-between items-start", 
        listMode && "flex-1"
      )}>
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
      
      <div className={cn(
        "mt-2 text-sm line-clamp-3 min-h-[3rem]",
        listMode && "hidden md:block md:w-1/3"
      )}>
        {getPreviewText()}
      </div>
      
      <div className={cn(
        "mt-3 text-xs text-muted-foreground flex justify-between items-center",
        listMode && "ml-auto"
      )}>
        <span>
          {formatDistanceToNow(new Date(note.createdAt), { 
            addSuffix: true,
            locale: fr
          })}
        </span>
        
        {note.type === 'voice' && (
          <div className="flex items-center text-xs text-muted-foreground ml-3">
            <Mic className="h-3 w-3 mr-1" />
            <span>Note vocale</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteCard;
