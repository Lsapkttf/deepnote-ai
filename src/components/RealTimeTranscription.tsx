
import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Save, X } from "lucide-react";
import { toast } from "sonner";
import FuturisticButton from "@/components/FuturisticButton";

interface RealTimeTranscriptionProps {
  onSave: (transcription: string) => void;
  onCancel: () => void;
}

const RealTimeTranscription: React.FC<RealTimeTranscriptionProps> = ({ 
  onSave, 
  onCancel 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Vérifier si la Web Speech API est supportée
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      toast.error("Votre navigateur ne supporte pas la reconnaissance vocale");
    }

    // Nettoyer lors du démontage du composant
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configuration pour le français et transcription continue
      recognitionRef.current.lang = 'fr-FR';
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        toast.info("Écoute en cours...");
      };
      
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        let final = finalTranscript;
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            final += " " + transcript;
          } else {
            interim += " " + transcript;
          }
        }
        
        setInterimTranscript(interim);
        setFinalTranscript(final);
      };
      
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Erreur de reconnaissance vocale:", event.error);
        
        if (event.error === 'not-allowed') {
          toast.error("L'accès au microphone a été refusé");
        } else if (event.error === 'no-speech') {
          // Pas d'erreur à afficher ici car c'est commun
        } else {
          toast.error(`Erreur: ${event.error}`);
        }
      };
      
      recognitionRef.current.onend = () => {
        // Ne pas réinitialiser l'écoute si elle a été arrêtée intentionnellement
        if (isListening) {
          // Redémarrer la reconnaissance pour qu'elle soit continue
          recognitionRef.current?.start();
        }
      };
      
      recognitionRef.current.start();
    } catch (error) {
      console.error("Erreur lors de l'initialisation de la reconnaissance vocale:", error);
      toast.error("Impossible d'initialiser la reconnaissance vocale");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast.success("Écoute terminée");
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSave = () => {
    onSave(finalTranscript.trim());
  };

  const handleReset = () => {
    setInterimTranscript("");
    setFinalTranscript("");
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">🎙️ Transcription vocale</h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
          <Card className="p-6 max-w-lg w-full">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Navigateur non compatible</h3>
              <p className="text-muted-foreground mb-4">
                Votre navigateur ne prend pas en charge l'API Web Speech pour la reconnaissance vocale.
              </p>
              <p className="text-sm text-muted-foreground">
                Essayez avec Chrome, Edge ou Safari pour une meilleure expérience.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h2 className="text-xl font-bold">🎙️ Transcription vocale</h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <Card className="p-6 mb-6 shadow-sm">
          <div className="flex flex-col items-center justify-center">
            <div className="relative mb-4">
              <div 
                className={`h-32 w-32 rounded-full flex items-center justify-center ${
                  isListening 
                    ? "bg-red-100 dark:bg-red-900 recording-pulse" 
                    : "bg-muted"
                }`}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-full w-full rounded-full"
                  onClick={toggleListening}
                >
                  {isListening ? (
                    <MicOff className="h-16 w-16 text-red-500" />
                  ) : (
                    <Mic className="h-16 w-16 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="text-center text-muted-foreground mt-2 mb-6">
              <p>
                {isListening
                  ? "Appuyez pour arrêter la transcription"
                  : "Appuyez pour commencer la transcription"}
              </p>
              <p className="text-sm mt-1">
                Parlez clairement en français
              </p>
            </div>
            
            <div className="w-full">
              <h3 className="font-semibold mb-2">Transcription en cours</h3>
              <div className="bg-muted p-4 rounded-md min-h-16 mb-4">
                <p className="whitespace-pre-wrap italic text-muted-foreground">
                  {interimTranscript || "..."}
                </p>
              </div>
              
              <h3 className="font-semibold mb-2">Transcription finale</h3>
              <div className="bg-muted p-4 rounded-md min-h-32 mb-4 max-h-64 overflow-y-auto">
                <p className="whitespace-pre-wrap">
                  {finalTranscript || "La transcription finale apparaîtra ici..."}
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        <div className="flex justify-end space-x-3">
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={!finalTranscript && !interimTranscript}
          >
            <X className="h-4 w-4 mr-2" />
            Effacer
          </Button>
          
          <FuturisticButton
            onClick={handleSave}
            disabled={!finalTranscript}
            gradient
            glow
          >
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </FuturisticButton>
        </div>
      </div>
    </div>
  );
};

export default RealTimeTranscription;
