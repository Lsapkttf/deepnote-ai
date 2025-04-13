
import { useState, useEffect, useRef } from "react";
import { Note, NoteColor, AIAnalysis, ChatMessage } from "@/types/note";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyzeText, chatWithAI } from "@/services/aiService";
import { toast } from "sonner";
import RichTextEditor from "./RichTextEditor";
import { 
  Save, 
  ArrowLeft, 
  BrainCircuit, 
  MessageCircle, 
  MoreVertical,
  FileCode,
  Wand2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import AIChat from "./AIChat";

interface NoteEditorProps {
  note: Note | null;
  onSave: (title: string, content: string, color: NoteColor) => void;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onBack: () => void;
  aiAnalysis: AIAnalysis | null;
  setAIAnalysis: (analysis: AIAnalysis | null) => void;
  onStartChat: () => void;
}

const NoteEditor = ({
  note,
  onSave,
  onUpdate,
  onBack,
  aiAnalysis,
  setAIAnalysis,
  onStartChat
}: NoteEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [richContent, setRichContent] = useState("");
  const [color, setColor] = useState<NoteColor>("yellow");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisTab, setAnalysisTab] = useState("summary");
  const [isAiPromptOpen, setIsAiPromptOpen] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [isProcessingPrompt, setIsProcessingPrompt] = useState(false);
  const [editorMode, setEditorMode] = useState<"plain" | "rich">("plain");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      const noteContent = note.type === 'voice' && note.transcription 
        ? note.transcription 
        : note.content;
      setContent(noteContent);
      setRichContent(noteContent);
      setColor(note.color);
    } else {
      setTitle("");
      setContent("");
      setRichContent("");
      setColor("yellow");
    }
  }, [note]);

  const handleSave = () => {
    const finalContent = editorMode === "rich" ? richContent : content;
    
    if (note) {
      onUpdate(note.id, { title, content: finalContent, color });
      toast.success("Note mise à jour");
    } else {
      onSave(title, finalContent, color);
      toast.success("Note créée");
    }
  };

  const handleAnalyze = async () => {
    const textToAnalyze = editorMode === "rich" ? richContent : content;
    
    if (!textToAnalyze.trim()) {
      toast.error("Veuillez d'abord saisir du contenu à analyser");
      return;
    }

    try {
      setIsAnalyzing(true);
      toast.info("Analyse en cours...");
      
      const analysis = await analyzeText(textToAnalyze);
      setAIAnalysis(analysis);
      
      toast.success("Analyse terminée");
    } catch (error) {
      console.error("Erreur d'analyse:", error);
      toast.error("Erreur lors de l'analyse du texte");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleColorChange = (newColor: NoteColor) => {
    setColor(newColor);
  };
  
  const handleAIGenerate = async () => {
    if (!promptText.trim()) {
      toast.error("Veuillez saisir une demande pour l'IA");
      return;
    }
    
    setIsProcessingPrompt(true);
    
    try {
      const currentText = editorMode === "rich" ? richContent : content;
      const prompt = `Sur la base de cette note existante: "${currentText}"\n\nVoici ma demande: ${promptText}\n\nGénérer du contenu qui complète ma note existante. Réponds uniquement avec le contenu à ajouter, sans phrases d'introduction ou de conclusion.`;
      
      const response = await chatWithAI(prompt, currentText, note?.id);
      
      if (editorMode === "rich") {
        // Pour le mode riche, on ajoute le contenu généré à la fin
        setRichContent(prev => prev + "\n\n" + response);
      } else {
        // Pour le mode texte simple, on ajoute aussi à la fin
        setContent(prev => prev + "\n\n" + response);
      }
      
      // Sauvegarder automatiquement la note après l'ajout du contenu IA
      if (note) {
        const updatedContent = editorMode === "rich" 
          ? richContent + "\n\n" + response 
          : content + "\n\n" + response;
        
        onUpdate(note.id, { 
          content: updatedContent
        });
        toast.success("Contenu IA ajouté et note mise à jour");
      } else {
        toast.success("Contenu IA ajouté");
      }
      
      // Fermer la boîte de dialogue
      setIsAiPromptOpen(false);
      setPromptText("");
      
    } catch (error) {
      console.error("Erreur de génération:", error);
      toast.error("Erreur lors de la génération du contenu");
    } finally {
      setIsProcessingPrompt(false);
    }
  };

  const menuClassName = isMobile 
    ? "flex-wrap overflow-x-auto gap-1 pb-1 px-1 justify-start" 
    : "overflow-x-auto pb-2";

  return (
    <div className={`h-full flex flex-col bg-note-${color}/20 ${isMobile ? 'pb-14' : ''}`}>
      <div className="p-2 pb-0 mb-2 flex items-center justify-between overflow-x-auto">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>

        <div className={`flex items-center space-x-1 ${menuClassName}`}>
          {isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 whitespace-nowrap"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setEditorMode(editorMode === "plain" ? "rich" : "plain")}>
                  <FileCode className="h-4 w-4 mr-2" />
                  {editorMode === "plain" ? "Éditeur enrichi" : "Éditeur simple"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsAiPromptOpen(true)}>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Générer avec IA
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAnalyze} disabled={isAnalyzing}>
                  <BrainCircuit className="h-4 w-4 mr-2" />
                  {isAnalyzing ? "Analyse..." : "Analyser"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onStartChat}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat IA
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditorMode(editorMode === "plain" ? "rich" : "plain")}
                className="h-8 px-2"
              >
                <FileCode className="h-4 w-4 mr-1" />
                {editorMode === "plain" ? "Éditeur enrichi" : "Éditeur simple"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAiPromptOpen(true)}
                className="h-8 px-2"
              >
                <Wand2 className="h-4 w-4 mr-1" />
                Générer avec IA
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="h-8 px-2"
              >
                <BrainCircuit className="h-4 w-4 mr-1" />
                {isAnalyzing ? "Analyse..." : "Analyser"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onStartChat}
                className="h-8 px-2"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Chat IA
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8">
                    <div className={`w-5 h-5 rounded-full bg-note-${color}`} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <div className="grid grid-cols-3 gap-1 p-1">
                    {["yellow", "red", "green", "blue", "purple", "orange"].map(
                      (c) => (
                        <button
                          key={c}
                          className={`w-8 h-8 rounded-full bg-note-${c} hover:ring-2 hover:ring-offset-2 hover:ring-offset-background hover:ring-primary transition-all`}
                          onClick={() => handleColorChange(c as NoteColor)}
                        />
                      )
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="default" size="sm" onClick={handleSave} className="h-8 px-2">
                <Save className="h-4 w-4 mr-1" />
                Enregistrer
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col overflow-hidden">
        <div className={`flex-1 bg-note-${color} rounded-lg p-4 overflow-hidden flex flex-col`}>
          <Input
            placeholder="Titre de la note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium mb-2 bg-transparent border-none focus-visible:ring-0 p-1 w-full"
          />

          {editorMode === "plain" ? (
            <textarea
              ref={textareaRef}
              placeholder="Contenu de la note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full flex-1 resize-none bg-transparent border-none focus-visible:ring-0 p-1"
            />
          ) : (
            <RichTextEditor 
              value={richContent}
              onChange={setRichContent}
              className="flex-1"
            />
          )}
        </div>

        {aiAnalysis && (
          <div className="mt-4 bg-card rounded-lg border shadow-sm">
            <div className="p-3 pb-0">
              <h3 className="font-semibold mb-2 flex items-center">
                <BrainCircuit className="h-4 w-4 mr-2" />
                Analyse IA
              </h3>
            </div>
            
            <Tabs defaultValue="summary" value={analysisTab} onValueChange={setAnalysisTab}>
              <div className="px-3">
                <TabsList className="w-full">
                  <TabsTrigger value="summary" className="flex-1">Résumé</TabsTrigger>
                  <TabsTrigger value="keyPoints" className="flex-1">Points clés</TabsTrigger>
                  <TabsTrigger value="sentiment" className="flex-1">Sentiment</TabsTrigger>
                </TabsList>
              </div>
              
              <ScrollArea className="h-[200px] p-3">
                <TabsContent value="summary" className="mt-0 px-3">
                  <p className="whitespace-pre-line">{aiAnalysis.summary}</p>
                </TabsContent>
                
                <TabsContent value="keyPoints" className="mt-0 px-3">
                  <ul className="list-disc list-inside space-y-1">
                    {aiAnalysis.keyPoints.map((point, index) => (
                      <li key={index} className="pl-2">{point}</li>
                    ))}
                  </ul>
                </TabsContent>
                
                <TabsContent value="sentiment" className="mt-0 px-3">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${
                      aiAnalysis.sentiment === 'positif' 
                        ? 'bg-green-500' 
                        : aiAnalysis.sentiment === 'négatif'
                          ? 'bg-red-500'
                          : 'bg-gray-500'
                    }`}></div>
                    <span className="capitalize">{aiAnalysis.sentiment}</span>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        )}
      </div>
      
      {/* Dialogue pour la génération IA */}
      <Dialog open={isAiPromptOpen} onOpenChange={setIsAiPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Générer du contenu avec l'IA</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Décrivez ce que vous souhaitez que l'IA ajoute à votre note.
            </p>
            <textarea
              className="w-full min-h-[100px] p-3 border rounded-md"
              placeholder="Ex: Ajoute une liste des avantages et inconvénients, Développe l'idée du paragraphe 2, Suggère une conclusion..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              disabled={isProcessingPrompt}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAiPromptOpen(false)}
              disabled={isProcessingPrompt}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleAIGenerate}
              disabled={!promptText.trim() || isProcessingPrompt}
            >
              {isProcessingPrompt ? "Génération en cours..." : "Générer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NoteEditor;
