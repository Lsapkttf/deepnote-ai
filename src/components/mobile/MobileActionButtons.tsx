
import React from 'react';
import { Mic, Plus, Image, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileActionButtonsProps {
  view: "list" | "editor" | "recorder" | "transcription" | "chat" | "image" | "checklist";
  setView: React.Dispatch<React.SetStateAction<"list" | "editor" | "recorder" | "transcription" | "chat" | "image" | "checklist">>;
  handleNewTextNote: () => void;
  handleNewVoiceNote: () => void;
  handleAddImage: () => void;
  handleCreateChecklist: () => void;
}

const buttonBase = "rounded-full shadow-xl transition duration-150 hover:scale-105 active:scale-95 focus-visible:ring-4 focus-visible:ring-primary/60 focus:ring-offset-2";
const iconBase = "h-6 w-6";
const mainFabClass = "h-16 w-16 bg-primary text-white hover:bg-primary/90 animate-fab-pulse border-2 border-white";

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
    <div className="fixed right-4 bottom-5 sm:bottom-7 flex flex-col gap-4 items-end z-[80]">
      <Button
        className={cn(buttonBase, "bg-amber-600 hover:bg-amber-700 h-14 w-14")}
        onClick={handleNewVoiceNote}
        aria-label="Nouvelle note vocale"
      >
        <Mic className={iconBase} />
      </Button>
      <Button
        className={cn(buttonBase, "bg-blue-600 hover:bg-blue-700 h-14 w-14")}
        onClick={handleAddImage}
        aria-label="Ajouter une image"
      >
        <Image className={iconBase} />
      </Button>
      <Button
        className={cn(buttonBase, "bg-green-600 hover:bg-green-700 h-14 w-14")}
        onClick={handleCreateChecklist}
        aria-label="Créer une liste"
      >
        <CheckSquare className={iconBase} />
      </Button>
      <Button
        className={cn(buttonBase, mainFabClass, "flex items-center justify-center")}
        onClick={handleNewTextNote}
        aria-label="Nouvelle note de texte"
        style={{ boxShadow: "0 8px 24px rgba(50,50,100,0.10), 0 2px 4px rgba(0,0,40,0.14)" }}
      >
        <Plus className="h-8 w-8" />
      </Button>
    </div>
  );
};

export default MobileActionButtons;
