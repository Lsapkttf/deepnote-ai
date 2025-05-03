
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
  Plus,
  Mic,
  Search,
  Settings,
  Menu,
  Home,
  Archive,
  Pin,
  User,
  LogOut,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/services/authService";
import { toast } from "sonner";
import UserMenu from "./UserMenu";

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
  activeFilter,
  onFilterChange,
}: MobileNavProps) => {
  const isMobile = useIsMobile();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  if (!isMobile) return null;

  const handleFilterClick = (filter: string) => {
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <div className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-sm border-b">
      <div className="flex items-center justify-between py-2 px-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSidebar}
            className="rounded-full"
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
            >
              Rechercher dans vos notes
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!isSearchOpen && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onOpenSettings} 
                className="rounded-full"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <UserMenu />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
