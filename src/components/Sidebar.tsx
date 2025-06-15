
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Archive,
  FileText,
  LogOut,
  PlusCircle,
  Settings,
  User,
} from "lucide-react";
import { signOut } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewTextNote: () => void;
  onNewVoiceNote: () => void;
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
  onOpenSettings: () => void;
}

const Sidebar = ({
  isOpen,
  onClose,
  onNewTextNote,
  onNewVoiceNote,
  onSelectCategory,
  selectedCategory,
  onOpenSettings,
}: SidebarProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  return (
    <>
      {/* Overlay pour mobile */}
      <div
        className={`
          fixed inset-0 z-10 bg-black/35 backdrop-blur-sm transition-opacity duration-200
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} md:hidden
        `}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`
          sidebar
          fixed inset-y-0 left-0 z-20 w-72 transform border-r bg-background transition-transform duration-200 ease-in-out md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          shadow-lg
        `}
        aria-label="Navigation latérale"
      >
        <div className="flex h-16 items-center border-b px-6 bg-background/80">
          <h2 className="text-lg font-bold">DeepNote</h2>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-3 md:hidden"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
        </div>

        <div className="p-4">
          <div className="flex flex-col space-y-1">
            <Button
              onClick={onNewTextNote}
              className="justify-start"
              variant="default"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouvelle note
            </Button>
            <Button
              onClick={onNewVoiceNote}
              className="justify-start"
              variant="outline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
              Transcription vocale
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-18rem)]">
          <div className="space-y-4 py-4">
            <div className="px-4 py-2">
              <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                Catégories
              </h2>
              <div className="space-y-1">
                <Button
                  variant={selectedCategory === "notes" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onSelectCategory("notes")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Toutes les notes
                </Button>
                <Button
                  variant={selectedCategory === "archive" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onSelectCategory("archive")}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="absolute bottom-0 w-full border-t p-4 bg-background/90">
          {user && (
            <div className="flex items-center space-x-2 rounded-md bg-muted p-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          )}
          <div className="flex flex-row space-x-2">
            {/* Paramètres et Déconnexion (optionnel/IA possible) */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={onOpenSettings}
            >
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
