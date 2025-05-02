import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Plus,
  Mic,
  Search,
  Settings,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";

interface MobileNavProps {
  onOpenSidebar: () => void;
  onNewTextNote: () => void;
  onNewVoiceNote: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSettings: () => void;
}

const MobileNav = ({
  onOpenSidebar,
  onNewTextNote,
  onNewVoiceNote,
  searchQuery,
  onSearchChange,
  onOpenSettings,
}: MobileNavProps) => {
  const isMobile = useIsMobile();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  if (!isMobile) return null;

  return (
    <div className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-sm border-b">
      <div className="container flex items-center gap-2 py-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="pl-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetHeader className="pl-6 pr-8">
              <SheetTitle>DeepNote</SheetTitle>
              <SheetDescription>
                Accédez rapidement à vos notes et paramètres.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>

        {isSearchOpen ? (
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1"
            autoFocus
            onBlur={() => setIsSearchOpen(false)}
          />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            Rechercher dans les notes...
          </Button>
        )}

        <Button variant="ghost" size="sm" onClick={onNewTextNote}>
          <Plus className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onNewVoiceNote}>
          <Mic className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <UserMenu />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onOpenSettings}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
