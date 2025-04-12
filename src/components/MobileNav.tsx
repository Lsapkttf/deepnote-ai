
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Plus, Search, Menu, X, Settings, Home } from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

interface MobileNavProps {
  onOpenSidebar: () => void;
  onNewTextNote: () => void;
  onNewVoiceNote: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSettings?: () => void;
}

const MobileNav = ({ 
  onOpenSidebar, 
  onNewTextNote, 
  onNewVoiceNote,
  searchQuery,
  onSearchChange,
  onOpenSettings
}: MobileNavProps) => {
  const [showSearch, setShowSearch] = useState(false);
  
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b flex items-center h-16 px-4">
        {showSearch ? (
          <div className="relative w-full flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 mr-2 shrink-0" 
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
        ) : (
          <>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 shrink-0" 
                onClick={onOpenSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Logo />
            </div>
            
            <div className="flex items-center gap-1 ml-auto">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9" 
                onClick={() => setShowSearch(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
              <ThemeToggle />
              {onOpenSettings && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9" 
                  onClick={onOpenSettings}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Barre d'actions flottante en bas de l'écran - position fixed améliorée */}
      <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4">
        <div className="flex items-center bg-background/95 backdrop-blur-md shadow-xl border rounded-full px-2 py-1 w-auto max-w-full">
          <Button 
            variant="ghost" 
            onClick={onNewVoiceNote}
            className="flex items-center justify-center h-12 w-12 rounded-full"
            aria-label="Créer une note vocale"
          >
            <Mic className="h-5 w-5" />
          </Button>
          
          <div className="mx-1 h-10 w-px bg-border"></div>
          
          <Button 
            variant="default"
            onClick={onNewTextNote}
            className="flex items-center justify-center h-12 w-12 rounded-full bg-primary hover:bg-primary/90"
            aria-label="Créer une nouvelle note"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
