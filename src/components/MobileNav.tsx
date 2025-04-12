
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, Settings, Plus } from "lucide-react";
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
      
      {/* Floating action button for new notes */}
      <Button 
        variant="default" 
        size="icon" 
        className="fixed right-6 bottom-6 shadow-md h-14 w-14 rounded-full z-50"
        onClick={onNewTextNote}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </>
  );
};

export default MobileNav;
