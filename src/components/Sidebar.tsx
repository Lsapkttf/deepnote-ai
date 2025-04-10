
import { cn } from "@/lib/utils";
import FuturisticButton from "@/components/FuturisticButton";
import { Separator } from "@/components/ui/separator";
import { SquarePen, Mic, ArchiveIcon, Clock, BookOpen, X } from "lucide-react";
import { useEffect, useRef } from "react";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewTextNote: () => void;
  onNewVoiceNote: () => void;
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

const Sidebar = ({ 
  isOpen, 
  onClose,
  onNewTextNote, 
  onNewVoiceNote, 
  onSelectCategory, 
  selectedCategory 
}: SidebarProps) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Fermer la sidebar quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 z-40 h-full pt-16 transition-transform duration-300 ease-in-out",
          isOpen 
            ? "translate-x-0" 
            : "-translate-x-full",
          "bg-sidebar dark:bg-sidebar md:translate-x-0 border-r border-sidebar-border w-72 flex flex-col shadow-lg"
        )}
      >
        <div className="absolute top-3 right-3 md:hidden">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 mt-4">
          <div className="mb-6 flex justify-center">
            <Logo size="lg" variant="sidebar" />
          </div>
          
          <div className="flex flex-col space-y-3">
            <FuturisticButton
              gradient
              glow
              className="justify-start w-full"
              onClick={() => {
                onNewTextNote();
                if (window.innerWidth < 768) onClose();
              }}
            >
              <SquarePen className="h-4 w-4 mr-2" />
              Nouvelle note
            </FuturisticButton>
            
            <FuturisticButton
              variant="outline"
              className="justify-start w-full border border-sidebar-border bg-sidebar-accent/30 hover:bg-sidebar-accent"
              onClick={() => {
                onNewVoiceNote();
                if (window.innerWidth < 768) onClose();
              }}
            >
              <Mic className="h-4 w-4 mr-2" />
              Note vocale
            </FuturisticButton>
          </div>
        </div>
        
        <Separator className="bg-sidebar-border/50" />
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h2 className="mb-3 px-3 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">Catégories</h2>
            <nav className="space-y-1">
              <SidebarItem 
                icon={BookOpen} 
                label="Notes" 
                isActive={selectedCategory === 'notes'} 
                onClick={() => {
                  onSelectCategory('notes');
                  if (window.innerWidth < 768) onClose();
                }}
              />
              <SidebarItem 
                icon={Clock} 
                label="Récentes" 
                isActive={selectedCategory === 'recent'} 
                onClick={() => {
                  onSelectCategory('recent');
                  if (window.innerWidth < 768) onClose();
                }}
              />
              <SidebarItem 
                icon={ArchiveIcon} 
                label="Archive" 
                isActive={selectedCategory === 'archive'} 
                onClick={() => {
                  onSelectCategory('archive');
                  if (window.innerWidth < 768) onClose();
                }}
              />
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, isActive, onClick }: SidebarItemProps) => {
  return (
    <button
      className={cn(
        "flex items-center w-full py-2.5 px-3 rounded-md transition-colors",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 mr-3" />
      <span className="text-sm font-medium">{label}</span>
      
      {isActive && (
        <div className="ml-auto w-1.5 h-6 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500" />
      )}
    </button>
  );
};

export default Sidebar;
