
import React from "react";
import { Home, Archive, Star, Settings, LogOut, Plus, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

interface FuturisticSidebarProps {
  onNewNote?: () => void;
  onNewVoice?: () => void;
  onNavigate?: (key: string) => void;
  onSettings?: () => void;
  onLogout?: () => void;
  selectedKey?: string;
}

const navLinks = [
  { key: "all", label: "Toutes les notes", icon: <Home className="h-5 w-5" /> },
  { key: "archive", label: "Archive", icon: <Archive className="h-5 w-5" /> },
  { key: "starred", label: "Épinglées", icon: <Star className="h-5 w-5" /> },
];

const FuturisticSidebar: React.FC<FuturisticSidebarProps> = ({
  onNewNote,
  onNewVoice,
  onNavigate,
  onSettings,
  onLogout,
  selectedKey
}) => {
  return (
    <aside className="futuristic-sidebar flex flex-col h-full justify-between p-5 w-[250px] min-w-[220px] border-0 animate-flyin transition-all z-30">
      <div>
        <Logo size="md" withText={false} />
        <div className="mt-6 space-y-1">
          {navLinks.map(link => (
            <Button
              key={link.key}
              variant={selectedKey === link.key ? "secondary" : "ghost"}
              className={`w-full justify-start rounded-lg ${selectedKey === link.key ? "bg-accent-neon/20" : ""} transition`}
              onClick={() => onNavigate && onNavigate(link.key)}
            >
              {link.icon}
              <span className="ml-2 font-futuristic text-base">{link.label}</span>
            </Button>
          ))}
        </div>
        <div className="mt-8 mb-2 flex flex-col gap-2">
          <Button
            variant="default"
            className="futuristic-btn"
            onClick={onNewNote}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle note
          </Button>
          <Button
            variant="secondary"
            className="futuristic-btn"
            onClick={onNewVoice}
          >
            <Mic className="h-4 w-4 mr-2" />
            Saisie vocale
          </Button>
        </div>
      </div>
      <div className="pt-5 border-t border-accent/30">
        <Button
          variant="ghost"
          className="w-full flex justify-start text-accent-neon hover:bg-accent-neon/10"
          onClick={onSettings}
        >
          <Settings className="h-4 w-4 mr-2" />
          Paramètres
        </Button>
        <Button
          variant="destructive"
          className="w-full flex justify-start mt-2"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
};

export default FuturisticSidebar;
