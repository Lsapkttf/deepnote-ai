
import { Note } from "@/types/note";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Pin, Mic } from "lucide-react";
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
}

const NoteCard = ({ note, onClick, onPin, onDelete }: NoteCardProps) => {
  const getPreviewText = () => {
    if (note.type === 'voice' && note.transcription) {
      return note.transcription;
    }
    return note.content;
  };

  return (
    <div 
      className={cn(
        "note-card cursor-pointer relative",
        `note-card-${note.color}`
      )}
      onClick={onClick}
    >
      {note.pinned && (
        <div className="absolute top-2 right-2">
          <Pin className="h-4 w-4 fill-current" />
        </div>
      )}
      
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{note.title || "Sans titre"}</h3>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPin(); }}>
              {note.pinned ? "Désépingler" : "Épingler"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }}>
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="mt-2 text-sm line-clamp-3">{getPreviewText()}</div>
      
      <div className="mt-3 text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(note.createdAt), { 
          addSuffix: true,
          locale: fr
        })}
      </div>
      
      {note.type === 'voice' && (
        <div className="mt-2 text-xs flex items-center text-muted-foreground">
          <Mic className="h-3 w-3 mr-1" />
          <span>Note vocale</span>
        </div>
      )}
    </div>
  );
};

export default NoteCard;
