
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Plus, Search, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import FuturisticButton from "@/components/FuturisticButton";

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
        <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b flex items-center h-16 px-4 animate-fade-in">
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
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b flex items-center justify-between h-16 px-4">
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
          </div>
        </div>
      )}
      
      {/* Boutons d'action rapide (FAB) */}
      <div className="fixed right-5 bottom-6 z-40 flex flex-col-reverse gap-3">
        <FuturisticButton
          onClick={onNewTextNote}
          size="lg"
          gradient
          glow
          className="h-14 w-14 rounded-full shadow-lg p-0"
        >
          <Plus className="h-6 w-6" />
        </FuturisticButton>
        
        <FuturisticButton
          onClick={onNewVoiceNote}
          size="lg"
          variant="outline"
          className="h-14 w-14 rounded-full shadow-lg bg-background/80 backdrop-blur-sm p-0"
        >
          <Mic className="h-6 w-6" />
        </FuturisticButton>
      </div>
    </>
  );
};

export default MobileNav;
