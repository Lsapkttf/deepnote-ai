
import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import NoteEditor from "@/components/NoteEditor";
import RealTimeTranscription from "@/components/RealTimeTranscription";
import AIChat from "@/components/AIChat";
import SettingsDialog from "@/components/SettingsDialog";
import MobileNav from "@/components/MobileNav";
import { Note, AIAnalysis } from "@/types/note";
import useNoteStore from "@/store/noteStore";
import { Plus, Mic } from "lucide-react";
import { checkApiKey } from "@/services/aiService";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

// Import refactored components
import AppBar from "@/components/layout/AppBar";
import NotesList from "@/components/notes/NotesList";
import NoteFilters from "@/components/filters/NoteFilters";
import MobileActionButtons from "@/components/mobile/MobileActionButtons";
import MobileFloatingMenu from "@/components/mobile/MobileFloatingMenu";
import { useNotesFiltering } from "@/hooks/useNotesFiltering";

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
  const [view, setView] = useState<"list" | "editor" | "recorder" | "transcription" | "chat" | "image" | "checklist">("list");
  const [selectedCategory, setSelectedCategory] = useState("notes");
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const isMobile = useIsMobile();
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasApiKey = checkApiKey();
    if (!hasApiKey) {
      // Set the API key from localStorage instead of showing the dialog
      localStorage.setItem("geminiApiKey", "AIzaSyAdOinCnHfqjOyk6XBbTzQkR_IOdRvlliU");
    }
    
    if (localStorage.getItem("darkMode") === "true") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (selectedCategory === 'archive') {
      fetchArchivedNotes();
    } else {
      fetchNotes();
    }
  }, [fetchNotes, fetchArchivedNotes, selectedCategory]);

  // Fermer la sidebar lorsqu'on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Si la sidebar est ouverte et le clic est à l'extérieur de la sidebar
      if (sidebarOpen && mainRef.current && !event.composedPath().includes(document.querySelector('.sidebar') as EventTarget)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [sidebarOpen]);

  const toggleSidebar = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleNewTextNote = () => {
    setCurrentNote(null);
    setView("editor");
  };

  const handleNewVoiceNote = () => {
    setView("recorder");
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSaveNote = async (title: string, content: string, color: string) => {
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
    if (view !== "list") {
      setView("list");
    }
  };

  const handleAddAIContentToNote = (content: string) => {
    if (currentNote) {
      const updatedContent = currentNote.content + "\n\n" + content;
      updateNote(currentNote.id, { content: updatedContent });
      setView("editor");
    }
  };

  // Fonction pour gérer l'ajout d'une image
  const handleAddImage = () => {
    // Temporairement pour l'exemple
    toast.info("Fonctionnalité d'ajout d'image en développement");
    // Puis on pourrait rediriger vers l'éditeur avec un mode spécifique
    if (currentNote) {
      setView("editor");
    } else {
      const createNewImageNote = async () => {
        const newNote = await addNote(
          "Note avec image",
          "<p>Insérez une image ici...</p>",
          "image",
          "blue"
        );
        setCurrentNote(newNote);
        setView("editor");
      };
      createNewImageNote();
    }
  };

  // Fonction pour créer une liste de tâches
  const handleCreateChecklist = () => {
    const checklistTemplate = `
      <h2>Liste de tâches</h2>
      <ul>
        <li><input type="checkbox"> Tâche 1</li>
        <li><input type="checkbox"> Tâche 2</li>
        <li><input type="checkbox"> Tâche 3</li>
      </ul>
    `;
    
    const createNewChecklist = async () => {
      const newNote = await addNote(
        "Liste de tâches",
        checklistTemplate,
        "text",
        "green"
      );
      setCurrentNote(newNote);
      setView("editor");
    };
    
    createNewChecklist();
  };

  // Use the custom hook for notes filtering
  const filteredNotes = useNotesFiltering(notes, selectedCategory, searchQuery);

  const handleBackToList = () => {
    setView("list");
  };

  const handleNewTranscription = () => {
    setView("transcription");
  };

  const handleCancelTranscription = () => {
    setView("list");
  };

  // Convert aiAnalysis to string for NoteEditor component and handle type conversion
  const formattedAnalysis = aiAnalysis ? 
    typeof aiAnalysis === 'string' ? aiAnalysis : JSON.stringify(aiAnalysis) 
    : null;
  
  // Wrapper for the setAIAnalysis function to handle type conversion
  const handleSetAnalysis = (analysis: string | null) => {
    if (analysis === null) {
      setAIAnalysis(null);
    } else {
      try {
        // Try to parse the string as JSON to convert it back to AIAnalysis
        const parsedAnalysis = JSON.parse(analysis) as AIAnalysis;
        setAIAnalysis(parsedAnalysis);
      } catch (error) {
        // If parsing fails, create a simple AIAnalysis object
        const simpleAnalysis: AIAnalysis = {
          summary: analysis,
          keyPoints: [],
          sentiment: "neutral"
        };
        setAIAnalysis(simpleAnalysis);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {!isMobile && (
        <AppBar 
          toggleSidebar={toggleSidebar}
          handleBackToList={handleBackToList}
          view={view}
          setSettingsDialogOpen={setSettingsDialogOpen}
          isMobile={isMobile}
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
        />
      )}
      
      {isMobile && (
        <MobileNav 
          onOpenSidebar={toggleSidebar}
          onNewTextNote={handleNewTextNote}
          onNewVoiceNote={handleNewTranscription}
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          onOpenSettings={() => setSettingsDialogOpen(true)}
        />
      )}
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          onNewTextNote={handleNewTextNote}
          onNewVoiceNote={handleNewTranscription}
          onSelectCategory={handleSelectCategory}
          selectedCategory={selectedCategory}
          onOpenSettings={() => setSettingsDialogOpen(true)}
        />
        
        <main ref={mainRef} className={`flex-1 overflow-hidden ${isMobile ? 'pt-0' : ''} md:ml-72`}>
          {view === "list" && (
            <div className="p-4 h-full flex flex-col overflow-hidden">
              <div className="md:hidden mb-4">
                {/* Mobile search bar would go here */}
              </div>
              
              <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-xl font-bold capitalize">
                  {searchQuery ? `Résultats pour "${searchQuery}"` :
                   selectedCategory === "notes" ? "Mes notes" : 
                   selectedCategory === "recent" ? "Notes récentes" : 
                   "Archive"}
                </h2>
                
                <NoteFilters 
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  handleNewTranscription={handleNewTranscription}
                  handleNewTextNote={handleNewTextNote}
                  isMobile={isMobile}
                />
              </div>
              
              <div className="flex-1 overflow-auto pb-20 md:pb-4">
                <NotesList
                  isLoading={isLoading}
                  notes={filteredNotes}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  viewMode={viewMode}
                  handleNoteClick={handleNoteClick}
                  togglePinNote={togglePinNote}
                  deleteNote={deleteNote}
                  handleArchiveNote={handleArchiveNote}
                  handleNewTextNote={handleNewTextNote}
                  handleNewVoiceNote={handleNewVoiceNote}
                  isMobile={isMobile}
                />
              </div>
            </div>
          )}
          
          {view === "editor" && (
            <NoteEditor
              note={currentNote}
              onSave={handleSaveNote}
              onUpdate={handleUpdateNote}
              onBack={handleBackToList}
              aiAnalysis={formattedAnalysis}
              setAIAnalysis={handleSetAnalysis}
              onStartChat={handleStartChat}
            />
          )}
          
          {view === "transcription" && (
            <RealTimeTranscription
              onSave={handleTranscriptionComplete}
              onCancel={handleCancelTranscription}
            />
          )}
          
          {view === "chat" && currentNote && (
            <AIChat
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              noteContent={currentNote.content}
              noteId={currentNote.id}
              onBack={() => setView("editor")}
              onAddToNote={handleAddAIContentToNote}
            />
          )}
        </main>
      </div>
      
      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
      
      <MobileActionButtons 
        view={view}
        setView={setView}
        handleNewTextNote={handleNewTextNote}
      />
      
      <MobileFloatingMenu 
        view={view}
        isMobile={isMobile}
        handleNewVoiceNote={handleNewVoiceNote}
        handleAddImage={handleAddImage}
        handleNewTextNote={handleNewTextNote}
        handleCreateChecklist={handleCreateChecklist}
        handleBackToList={handleBackToList}
      />
    </div>
  );
};

export default Index;
