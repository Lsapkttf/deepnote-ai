
import React from 'react';
import { Mic, Plus, Image, ListTodo, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NoteColor } from '@/types/note';

interface MobileActionButtonsProps {
  view: "list" | "editor" | "recorder" | "transcription" | "chat" | "image" | "checklist";
  setView: React.Dispatch<React.SetStateAction<"list" | "editor" | "recorder" | "transcription" | "chat" | "image" | "checklist">>;
  handleNewTextNote: () => void;
  handleNewVoiceNote: () => void;
  handleAddImage: () => void;
  handleCreateChecklist: () => void;
}

const MobileActionButtons: React.FC<MobileActionButtonsProps> = ({
  view,
  setView,
  handleNewTextNote,
  handleNewVoiceNote,
  handleAddImage,
  handleCreateChecklist
}) => {
  if (view !== "list") return null;
  
  return (
    <div className="fixed right-4 bottom-20 flex flex-col gap-3 items-end">
      <Button
        className="rounded-full bg-amber-600 hover:bg-amber-700 h-14 w-14 shadow-lg"
        onClick={handleNewVoiceNote}
      >
        <Mic className="h-6 w-6" />
      </Button>

      <Button
        className="rounded-full bg-blue-600 hover:bg-blue-700 h-14 w-14 shadow-lg"
        onClick={handleAddImage}
      >
        <Image className="h-6 w-6" />
      </Button>

      <Button
        className="rounded-full bg-green-600 hover:bg-green-700 h-14 w-14 shadow-lg"
        onClick={handleCreateChecklist}
      >
        <CheckSquare className="h-6 w-6" />
      </Button>
      
      <Button
        className="rounded-full bg-primary hover:bg-primary/90 h-14 w-14 shadow-lg"
        onClick={handleNewTextNote}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default MobileActionButtons;
