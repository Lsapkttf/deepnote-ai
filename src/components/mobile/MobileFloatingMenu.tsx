
import React from 'react';
import { Mic, ImageIcon, Text, CheckSquare, ListTodo, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MobileFloatingMenuProps {
  view: "list" | "editor" | "recorder" | "transcription" | "chat" | "image" | "checklist";
  isMobile: boolean;
  handleNewVoiceNote: () => void;
  handleAddImage: () => void;
  handleNewTextNote: () => void;
  handleCreateChecklist: () => void;
  handleBackToList: () => void;
}

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
    { icon: <Pencil className="h-5 w-5" />, label: "Dessin", onClick: () => toast.info("Fonctionnalité de dessin en développement") },
  ];

  return (
    <div className="fixed right-4 bottom-20 flex flex-col gap-3 items-end">
      {actions.map((action, index) => (
        <Button
          key={index}
          className="rounded-full bg-amber-700/80 hover:bg-amber-800 h-14 w-14 shadow-lg"
          onClick={action.onClick}
        >
          {action.icon}
        </Button>
      ))}
      <Button
        className="rounded-full bg-amber-200 text-amber-900 hover:bg-amber-300 h-14 w-14 shadow-lg"
        onClick={handleBackToList}
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default MobileFloatingMenu;
