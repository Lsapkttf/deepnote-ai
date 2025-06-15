
import React from "react";
import { Menu, Search, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";

interface FuturisticAppBarProps {
  onMenuClick?: () => void;
  onSearch?: (query: string) => void;
  onSettingsClick?: () => void;
  userName?: string;
}

const FuturisticAppBar: React.FC<FuturisticAppBarProps> = ({
  onMenuClick,
  onSearch,
  onSettingsClick,
  userName,
}) => {
  return (
    <header className="futuristic-appbar flex items-center justify-between px-4 py-2 sticky top-0 z-30 animate-flyin">
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-accent-neon"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <Logo size="md" withText />
      </div>
      <div className="flex-1 mx-4 hidden md:flex">
        <input
          className="futuristic-input w-full max-w-xs ml-auto"
          type="text"
          placeholder="Recherche futuriste…"
          onChange={e => onSearch?.(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="text-accent-neon"
          onClick={onSettingsClick}
        >
          <Settings className="h-5 w-5" />
        </Button>
        <div className="ml-1 px-3 py-1 bg-accent-neon/10 rounded-full flex items-center gap-2 min-w-[90px]">
          <User className="h-5 w-5 text-accent-neon" />
          <span className="font-futuristic text-xs text-accent-neon font-bold">{userName ?? "Invité"}</span>
        </div>
      </div>
    </header>
  );
};
export default FuturisticAppBar;
