
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SquarePen, Mic, ArchiveIcon, Clock, BookOpen } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onNewTextNote: () => void;
  onNewVoiceNote: () => void;
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

const Sidebar = ({ 
  isOpen, 
  onNewTextNote, 
  onNewVoiceNote, 
  onSelectCategory, 
  selectedCategory 
}: SidebarProps) => {
  return (
    <div
      className={cn(
        "fixed top-0 left-0 z-40 h-full pt-16 transition-transform",
        isOpen 
          ? "translate-x-0" 
          : "-translate-x-full",
        "bg-sidebar md:translate-x-0 border-r w-64 flex flex-col"
      )}
    >
      <div className="p-4">
        <div className="flex flex-col space-y-2">
          <Button
            variant="default"
            className="justify-start bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onNewTextNote}
          >
            <SquarePen className="h-4 w-4 mr-2" />
            Nouvelle note
          </Button>
          
          <Button
            variant="outline"
            className="justify-start"
            onClick={onNewVoiceNote}
          >
            <Mic className="h-4 w-4 mr-2" />
            Note vocale
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <nav className="space-y-1">
            <SidebarItem 
              icon={BookOpen} 
              label="Notes" 
              isActive={selectedCategory === 'notes'} 
              onClick={() => onSelectCategory('notes')}
            />
            <SidebarItem 
              icon={Clock} 
              label="Récentes" 
              isActive={selectedCategory === 'recent'} 
              onClick={() => onSelectCategory('recent')}
            />
            <SidebarItem 
              icon={ArchiveIcon} 
              label="Archive" 
              isActive={selectedCategory === 'archive'} 
              onClick={() => onSelectCategory('archive')}
            />
          </nav>
        </div>
      </div>
    </div>
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
        "flex items-center w-full py-2 px-3 rounded-md transition-colors",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 mr-3" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export default Sidebar;
