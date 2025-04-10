
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Search, Settings, X, BrainCircuit } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  toggleSidebar: () => void;
  onSearch: (query: string) => void;
  onOpenSettings: () => void;
}

const Header = ({ toggleSidebar, onSearch, onOpenSettings }: HeaderProps) => {
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    onSearch("");
  };

  return (
    <header className="border-b sticky top-0 z-30 bg-background">
      <div className="flex h-16 items-center px-4 sm:justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden md:flex items-center">
            <BrainCircuit className="h-6 w-6 mr-2 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">DeepNote</h1>
          </div>
          <div className="flex md:hidden items-center ml-2">
            <BrainCircuit className="h-5 w-5 mr-1 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">DeepNote</h1>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          {searchActive ? (
            <form
              onSubmit={handleSearchSubmit}
              className="relative w-full max-w-sm mx-4"
            >
              <Input
                type="search"
                placeholder="Rechercher des notes..."
                className="w-full pl-9 pr-10"
                value={searchQuery}
                onChange={handleSearchChange}
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={handleClearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </form>
          ) : (
            <Button
              variant="outline"
              size="icon"
              className="hidden md:flex"
              onClick={() => setSearchActive(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Aide</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                    <div className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="#"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            Bienvenue dans DeepNote
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Un outil de prise de notes avec des fonctionnalités IA pour améliorer votre productivité.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <Button variant="ghost" size="icon" onClick={onOpenSettings}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="md:hidden flex items-center justify-between px-4 pb-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setSearchActive(true)}
        >
          <Search className="h-4 w-4 mr-2" />
          Rechercher des notes...
        </Button>
      </div>
    </header>
  );
};

export default Header;
