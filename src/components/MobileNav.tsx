
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  onOpenSidebar: () => void;
  onNewTextNote: () => void;
  onNewVoiceNote: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSettings: () => void;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
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
    <nav className="sticky top-0 z-[70] w-full backdrop-blur-lg bg-background/80 border-b">
      <div className="flex items-center justify-between py-2 px-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSidebar}
            className="rounded-full focus-visible:ring-2"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          {isSearchOpen ? (
            <Input
              placeholder="Rechercher dans vos notes"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 h-9"
              autoFocus
              onBlur={() => setIsSearchOpen(false)}
            />
          ) : (
            <Button
              variant="ghost"
              className="justify-start text-muted-foreground h-9 px-3"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Ouvrir recherche"
            >
              Rechercher dans vos notes
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MobileNav;
