
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import NoteCard from "@/components/NoteCard";
import NoteEditor from "@/components/NoteEditor";
import VoiceRecorder from "@/components/VoiceRecorder";
import AIChat from "@/components/AIChat";
import SettingsDialog from "@/components/SettingsDialog";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";
import { Note, NoteColor } from "@/types/note";
import useNoteStore from "@/store/noteStore";
import { Plus, Mic, Loader2, Search, Filter, LayoutGrid, LayoutList, Menu, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { checkApiKey } from "@/services/aiService";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const {
    notes,
    currentNote,
    isRecording,
    chatMessages,
    aiAnalysis,
    isLoading,
    fetchNotes,
    fetchArchivedNotes,
    addNote,
    updateNote,
    deleteNote,
    archiveNote,
    setCurrentNote,
    togglePinNote,
    setIsRecording,
    addChatMessage,
    setAIAnalysis,
    clearChatMessages,
  } = useNoteStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<"list" | "editor" | "recorder" | "chat">("list");
  const [selectedCategory, setSelectedCategory] = useState("notes");
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const isMobile = useIsMobile();

  // Vérifier si la clé API est configurée
  useEffect(() => {
    const hasApiKey = checkApiKey();
    if (!hasApiKey) {
      setSettingsDialogOpen(true);
    }
    
    // Appliquer le mode sombre si configuré
    if (localStorage.getItem("darkMode") === "true") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Charger les notes depuis Supabase
  useEffect(() => {
    if (selectedCategory === 'archive') {
      fetchArchivedNotes();
    } else {
      fetchNotes();
    }
  }, [fetchNotes, fetchArchivedNotes, selectedCategory]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNewTextNote = () => {
    setCurrentNote(null);
    setView("editor");
    if (isMobile) setSidebarOpen(false);
  };

  const handleNewVoiceNote = () => {
    setView("recorder");
    if (isMobile) setSidebarOpen(false);
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    if (isMobile) setSidebarOpen(false);
  };

  const handleSaveNote = async (title: string, content: string, color: NoteColor) => {
    try {
      await addNote(title || "Sans titre", content, "text", color);
      setView("list");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    await updateNote(id, updates);
  };

  const handleTranscriptionComplete = async (transcription: string) => {
    try {
      const newNote = await addNote(
        "Note vocale",
        "",
        "voice",
        "yellow"
      );
      
      await updateNote(newNote.id, { transcription });
      setCurrentNote(newNote);
      setView("editor");
      
      toast.success("Transcription terminée");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la création de la note vocale");
    }
  };

  const handleNoteClick = (note: Note) => {
    setCurrentNote(note);
    setAIAnalysis(null);
    setView("editor");
  };

  const handleCancelRecording = () => {
    setView("list");
  };
  
  const handleStartChat = () => {
    clearChatMessages();
    setView("chat");
  };
  
  const handleSendMessage = (content: string, role: 'user' | 'assistant') => {
    addChatMessage(content, role);
  };

  const handleArchiveNote = async (id: string) => {
    await archiveNote(id);
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Revenir à la liste des notes lors de la recherche
    if (view !== "list") {
      setView("list");
    }
  };

  const filteredNotes = notes.filter(note => {
    // Filtre par catégorie
    if (selectedCategory === "notes" && note.archived) return false;
    if (selectedCategory === "recent") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(note.createdAt) >= oneWeekAgo && !note.archived;
    }
    if (selectedCategory === "archive" && !note.archived) return false;
    
    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query) ||
        (note.transcription && note.transcription.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Trier les notes pour afficher les épinglées en premier
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Composant de recherche personnalisé
  const SearchBar = () => (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Rechercher dans les notes..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 pr-4 w-full"
      />
      {searchQuery && (
        <button
          onClick={() => handleSearch("")}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  // Appbar personnalisée
  const AppBar = () => (
    <div className="flex items-center justify-between w-full px-4 h-14 border-b">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Logo />
      </div>

      <div className="hidden md:block flex-1 max-w-sm mx-auto">
        <SearchBar />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSettingsDialogOpen(true)}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <AppBar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onNewTextNote={handleNewTextNote}
          onNewVoiceNote={handleNewVoiceNote}
          onSelectCategory={handleSelectCategory}
          selectedCategory={selectedCategory}
        />
        
        <main className="flex-1 overflow-hidden md:ml-64">
          {view === "list" && (
            <div className="p-4 h-full flex flex-col overflow-hidden">
              <div className="md:hidden mb-4">
                <SearchBar />
              </div>
              
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold capitalize">
                  {searchQuery ? `Résultats pour "${searchQuery}"` :
                   selectedCategory === "notes" ? "Mes notes" : 
                   selectedCategory === "recent" ? "Notes récentes" : 
                   "Archive"}
                </h2>
                
                <div className="flex space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtres
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory("notes")}
                      >
                        Toutes les notes
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory("recent")}
                      >
                        Notes récentes
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory("archive")}
                      >
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <div className="flex border rounded-md overflow-hidden">
                    <Button 
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-none border-0"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-none border-0"
                    >
                      <LayoutList className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleNewVoiceNote}
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Note vocale
                  </Button>
                  
                  <Button 
                    size="sm"
                    onClick={handleNewTextNote}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle note
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-muted-foreground">Chargement des notes...</p>
                  </div>
                ) : sortedNotes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <p className="mb-4">
                      {searchQuery 
                        ? "Aucune note ne correspond à votre recherche"
                        : selectedCategory === "archive" 
                          ? "Aucune note archivée" 
                          : "Aucune note"}
                    </p>
                    {(selectedCategory !== "archive" && !searchQuery) && (
                      <div className="flex space-x-4">
                        <Button onClick={handleNewTextNote}>
                          <Plus className="h-4 w-4 mr-2" />
                          Nouvelle note
                        </Button>
                        <Button variant="outline" onClick={handleNewVoiceNote}>
                          <Mic className="h-4 w-4 mr-2" />
                          Note vocale
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={viewMode === "grid" 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                    : "flex flex-col gap-3"
                  }>
                    {sortedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        listMode={viewMode === "list"}
                        onClick={() => handleNoteClick(note)}
                        onPin={() => togglePinNote(note.id)}
                        onDelete={() => deleteNote(note.id)}
                        onArchive={() => handleArchiveNote(note.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {view === "editor" && (
            <NoteEditor
              note={currentNote}
              onSave={handleSaveNote}
              onUpdate={handleUpdateNote}
              onBack={() => setView("list")}
              aiAnalysis={aiAnalysis}
              setAIAnalysis={setAIAnalysis}
              onStartChat={handleStartChat}
            />
          )}
          
          {view === "recorder" && (
            <VoiceRecorder
              onTranscriptionComplete={handleTranscriptionComplete}
              onCancel={handleCancelRecording}
            />
          )}
          
          {view === "chat" && currentNote && (
            <AIChat
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              noteContent={currentNote.type === 'voice' && currentNote.transcription 
                ? currentNote.transcription 
                : currentNote.content}
              noteId={currentNote.id}
              onBack={() => setView("editor")}
            />
          )}
        </main>
      </div>
      
      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
    </div>
  );
};

export default Index;
