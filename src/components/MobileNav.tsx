
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
  Bell,
  User,
  LogOut,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/services/authService";
import { toast } from "sonner";

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
      // Close sidebar after selection on mobile
    }
  };

  return (
    <div className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-sm border-b">
      <div className="container flex items-center gap-2 py-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="pl-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 flex flex-col">
            <SheetHeader className="pl-6 pr-8 py-4 border-b">
              <SheetTitle className="flex items-center gap-2">
                <img src="/icons/icon-192x192.png" alt="Logo" className="w-7 h-7" />
                DeepNote
              </SheetTitle>
              <SheetDescription>
                Accédez rapidement à vos notes
              </SheetDescription>
            </SheetHeader>
            
            <div className="flex flex-col flex-1 overflow-auto py-2">
              <div className="px-2 space-y-1">
                <Button
                  variant={activeFilter === "all" ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleFilterClick("all")}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Notes
                </Button>
                
                <Button
                  variant={activeFilter === "pinned" ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleFilterClick("pinned")}
                >
                  <Pin className="mr-2 h-4 w-4" />
                  Épinglées
                </Button>
                
                <Button
                  variant={activeFilter === "archived" ? "secondary" : "ghost"}
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => handleFilterClick("archived")}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archives
                </Button>
              </div>
              
              <div className="mt-6 px-3">
                <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground">Étiquettes</h3>
                <div className="space-y-1">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Bell className="mr-2 h-4 w-4" />
                    Rappels
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 px-3">
                <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground">Application</h3>
                <div className="space-y-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => navigate("/subscription")}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Abonnement
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={onOpenSettings}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-950/30"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </Button>
                </div>
              </div>
            </div>
            
            <SheetFooter className="p-4 border-t mt-auto">
              <div className="w-full flex items-center justify-between">
                {user ? (
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm truncate">{user.email}</span>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => navigate('/auth')}>
                    Se connecter
                  </Button>
                )}
              </div>
            </SheetFooter>
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
            className="flex-1 justify-start text-muted-foreground"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            Rechercher...
          </Button>
        )}

        <Button variant="ghost" size="icon" className="rounded-full" onClick={onNewTextNote}>
          <Plus className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={onNewVoiceNote}>
          <Mic className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MobileNav;
