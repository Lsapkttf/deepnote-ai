
import React from 'react';
import { Mic, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileActionButtonsProps {
  view: "list" | "editor" | "recorder" | "transcription" | "chat" | "image" | "checklist";
  setView: React.Dispatch<React.SetStateAction<"list" | "editor" | "recorder" | "transcription" | "chat" | "image" | "checklist">>;
  handleNewTextNote: () => void;
}

const MobileActionButtons: React.FC<MobileActionButtonsProps> = ({
  view,
  setView,
  handleNewTextNote
}) => {
  if (view !== "list") return null;
  
  return (
    <div className="fixed right-4 bottom-20 flex flex-col gap-3 items-end">
      <Button
        className="rounded-full bg-amber-600 hover:bg-amber-700 h-14 w-14 shadow-lg"
        onClick={() => setView("transcription")}
      >
        <Mic className="h-6 w-6" />
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
