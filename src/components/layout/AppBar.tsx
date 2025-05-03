
import React from 'react';
import { Menu, ArrowLeft, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import SearchBar from '@/components/layout/SearchBar';
import { toast } from 'sonner';
import { signOut } from '@/services/authService';

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
    <div className="sticky top-0 z-10 flex items-center justify-between w-full px-4 h-16 border-b backdrop-blur-sm bg-background/80">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {view !== "list" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToList}
            className="mr-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <h1 className="text-lg font-bold">DeepNote</h1>
      </div>

      <div className="hidden md:block flex-1 max-w-sm mx-auto">
        <SearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="md:inline-flex h-9 w-9"
          onClick={() => setSettingsDialogOpen(true)}
        >
          <Settings className="h-5 w-5" />
        </Button>
        <UserMenuButton />
      </div>
    </div>
  );
};

// User Menu Button Component
const UserMenuButton = () => {
  const handleLogout = async () => {
    try {
      await signOut();
      // Redirection automatique se fera via l'écouteur d'état dans AuthContext
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion. Veuillez réessayer.");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={handleLogout}
    >
      <LogOut className="h-5 w-5" />
    </Button>
  );
};

export default AppBar;
