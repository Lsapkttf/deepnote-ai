
import React from 'react';
import { Mic, ImageIcon, Text, CheckSquare, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MobileFloatingMenuProps {
  view: "list" | "editor" | "recorder" | "transcription" | "chat" | "image" | "checklist";
  isMobile: boolean;
  handleNewVoiceNote: () => void;
  handleAddImage: () => void;
  handleNewTextNote: () => void;
  handleCreateChecklist: () => void;
  handleBackToList: () => void;
}

const fabChild = "rounded-full shadow-lg h-14 w-14 flex items-center justify-center bg-background/90 dark:bg-background/70 hover:scale-105 active:scale-95 border border-border transition";
const fabAnim = "transition duration-200 animate-fade-in-up";

const MobileFloatingMenu: React.FC<MobileFloatingMenuProps> = ({
  view,
  isMobile,
  handleNewVoiceNote,
  handleAddImage,
  handleNewTextNote,
  handleCreateChecklist,
  handleBackToList
}) => {
  if (view !== "editor" || !isMobile) return null;

  const actions = [
    { icon: <Mic className="h-5 w-5" />, label: "Audio", onClick: () => handleNewVoiceNote() },
    { icon: <ImageIcon className="h-5 w-5" />, label: "Image", onClick: () => handleAddImage() },
    { icon: <Text className="h-5 w-5" />, label: "Texte", onClick: () => handleNewTextNote() },
    { icon: <CheckSquare className="h-5 w-5" />, label: "Liste", onClick: () => handleCreateChecklist() },
    { icon: <Pencil className="h-5 w-5" />, label: "Dessin", onClick: () => toast.info("Bientôt le mode dessin !") },
  ];

  return (
    <div className="fixed right-4 bottom-5 flex flex-col gap-3 items-end z-[100]">
      {actions.map((action, index) => (
        <Button
          key={index}
          className={cn(fabChild, fabAnim, "bg-muted backdrop-blur-sm hover:bg-accent/60")}
          onClick={action.onClick}
          style={{ animationDelay: `${index * 70}ms` } as any}
        >
          {action.icon}
        </Button>
      ))}
      <Button
        className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-100 hover:bg-amber-300 h-14 w-14 shadow-xl border border-border transition"
        onClick={handleBackToList}
        aria-label="Retour"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default MobileFloatingMenu;
