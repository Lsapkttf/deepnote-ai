
import { useState, useEffect, useRef } from "react";
import { Note, NoteColor, AIAnalysis, ChatMessage } from "@/types/note";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyzeText } from "@/services/aiService";
import { toast } from "sonner";
import { 
  Save, 
  ArrowLeft, 
  BrainCircuit, 
  MessageCircle, 
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [color, setColor] = useState<NoteColor>("yellow");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisTab, setAnalysisTab] = useState("summary");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.type === 'voice' && note.transcription 
        ? note.transcription 
        : note.content);
      setColor(note.color);
    } else {
      setTitle("");
      setContent("");
      setColor("yellow");
    }
  }, [note]);

  const handleSave = () => {
    if (note) {
      onUpdate(note.id, { title, content, color });
      toast.success("Note mise à jour");
    } else {
      onSave(title, content, color);
      toast.success("Note créée");
    }
  };

  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast.error("Veuillez d'abord saisir du contenu à analyser");
      return;
    }

    try {
      setIsAnalyzing(true);
      toast.info("Analyse en cours...");
      
      const analysis = await analyzeText(content);
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

          <Textarea
            ref={textareaRef}
            placeholder="Contenu de la note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full flex-1 resize-none bg-transparent border-none focus-visible:ring-0 p-1"
          />
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
    </div>
  );
};

export default NoteEditor;
