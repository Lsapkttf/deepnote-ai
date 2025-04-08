
import { useState, useEffect } from "react";
import { Note, NoteColor, AIAnalysis } from "@/types/note";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { analyzeText } from "@/services/aiService";
import { toast } from "sonner";
import { CirclePlus, Save, SquarePen, MessageCircle, ArrowLeft, BrainCircuit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.type === 'voice' && note.transcription 
        ? note.transcription 
        : note.content);
      setColor(note.color);
    } else {
      // Réinitialiser les champs si aucune note n'est sélectionnée
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
      const analysis = await analyzeText(content);
      setAIAnalysis(analysis);
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

  return (
    <div className={`p-4 h-full flex flex-col bg-note-${color}/20`}>
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            <BrainCircuit className="h-4 w-4 mr-2" />
            {isAnalyzing ? "Analyse en cours..." : "Analyser avec IA"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={onStartChat}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat IA
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
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

          <Button variant="default" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </div>

      <div className={`flex-1 bg-note-${color} rounded-lg p-4 overflow-auto`}>
        <Input
          placeholder="Titre de la note"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-medium mb-2 bg-transparent border-none focus-visible:ring-0 p-1 w-full"
        />

        <Textarea
          placeholder="Contenu de la note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-[calc(100%-50px)] resize-none bg-transparent border-none focus-visible:ring-0 p-1"
        />
      </div>

      {aiAnalysis && (
        <div className="mt-4 p-4 bg-card rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center">
            <BrainCircuit className="h-4 w-4 mr-2" />
            Analyse IA
          </h3>
          
          <div className="mb-3">
            <h4 className="text-sm font-medium text-muted-foreground">Résumé</h4>
            <p>{aiAnalysis.summary}</p>
          </div>
          
          <div className="mb-3">
            <h4 className="text-sm font-medium text-muted-foreground">Points clés</h4>
            <ul className="list-disc list-inside">
              {aiAnalysis.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Sentiment</h4>
            <p className="capitalize">{aiAnalysis.sentiment}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteEditor;
