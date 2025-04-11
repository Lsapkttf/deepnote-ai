
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Plus, Search, Menu, X, Settings } from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

interface MobileNavProps {
  onOpenSidebar: () => void;
  onNewTextNote: () => void;
  onNewVoiceNote: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const MobileNav = ({ 
  onOpenSidebar, 
  onNewTextNote, 
  onNewVoiceNote,
  searchQuery,
  onSearchChange
}: MobileNavProps) => {
  const [showSearch, setShowSearch] = useState(false);
  
  return (
    <>
      {showSearch ? (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b flex items-center h-16 px-4 animate-fade-in">
          <div className="relative w-full flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 mr-2" 
              onClick={() => {
                setShowSearch(false);
                onSearchChange("");
              }}
            >
              <X className="h-5 w-5" />
            </Button>
            <input
              type="text"
              placeholder="Rechercher dans les notes..."
              className="flex-1 h-10 bg-background/90 border rounded-full px-4 focus:outline-none focus:ring-1 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      ) : (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9" 
              onClick={onOpenSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Logo />
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9" 
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9" 
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Ajout d'une barre d'action fixe en bas de l'écran */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t flex items-center justify-around h-14 px-4">
        <Button 
          variant="ghost" 
          onClick={onNewTextNote}
          className="flex flex-col items-center justify-center h-12 w-16"
        >
          <Plus className="h-5 w-5 mb-1" />
          <span className="text-xs">Note</span>
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={onNewVoiceNote}
          className="flex flex-col items-center justify-center h-12 w-16"
        >
          <Mic className="h-5 w-5 mb-1" />
          <span className="text-xs">Vocal</span>
        </Button>
      </div>
    </>
  );
};

export default MobileNav;
