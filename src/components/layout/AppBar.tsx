
import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppBarProps {
  toggleSidebar: (e?: React.MouseEvent) => void;
  handleBackToList: () => void;
  view: "list" | "editor" | "recorder" | "transcription" | "chat" | "image" | "checklist";
  setSettingsDialogOpen: (open: boolean) => void;
  isMobile: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const AppBar: React.FC<AppBarProps> = ({
  toggleSidebar,
  handleBackToList,
  view,
  setSettingsDialogOpen,
  isMobile,
  searchQuery = '',
  onSearchChange = () => {}
}) => {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between w-full px-2 sm:px-4 h-16 border-b backdrop-blur-xl bg-background/90 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">DeepNote</h1>
      </div>
    </div>
  );
};

export default AppBar;
