
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Save, X, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import AudioWaveform from "./AudioWaveform";

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
  onCancel: () => void;
}

const VoiceRecorder = ({ onTranscriptionComplete, onCancel }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const initializeSpeechRecognition = () => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        toast.error("La reconnaissance vocale n'est pas prise en charge par votre navigateur");
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR';
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscription((prev) => {
          // Ajouter seulement le texte final pour éviter les répétitions
          if (finalTranscript) {
            return (prev + finalTranscript).trim() + ' ';
          }
          // Afficher temporairement le texte intérimaire
          return prev;
        });
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Erreur de reconnaissance vocale:", event.error);
        if (event.error === 'network') {
          toast.error("Erreur réseau. Vérifiez votre connexion internet.");
        } else if (event.error === 'not-allowed') {
          toast.error("L'accès au microphone a été refusé");
        } else {
          toast.error(`Erreur de reconnaissance vocale: ${event.error}`);
        }
      };
    };

    initializeSpeechRecognition();
    
    // Nettoyage
    return () => {
      stopRecording();
    };
  }, []);

  const setupAudioAnalyser = async () => {
    try {
      // Demander la permission d'accéder au microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      
      // Configurer l'AudioContext et l'AnalyserNode
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      // Mettre à jour le niveau audio régulièrement
      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Calculer le niveau audio moyen
          const average = Array.from(dataArray)
            .slice(0, 20) // Utiliser les fréquences les plus basses (voix humaine)
            .reduce((acc, val) => acc + val, 0) / 20;
          
          // Normaliser entre 0 et 100 avec un facteur d'amélioration
          setAudioLevel(Math.min(100, average * 1.8));
        }
      };
      
      const intervalId = setInterval(updateAudioLevel, 50);
      timerRef.current = intervalId;
      
      return stream;
    } catch (error) {
      console.error("Erreur d'accès au microphone:", error);
      toast.error("Impossible d'accéder au microphone");
      return null;
    }
  };

  const startRecording = async () => {
    setTranscription("");
    setRecordingDuration(0);
    setIsRecording(true);
    
    const stream = await setupAudioAnalyser();
    if (!stream) return;
    
    // Configurer le MediaRecorder
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.start();
    
    // Démarrer la reconnaissance vocale
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        
        // Mettre à jour la durée d'enregistrement
        const startTime = Date.now();
        const interval = setInterval(() => {
          const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
          setRecordingDuration(elapsedTime);
        }, 1000);
        
        // Stocker l'intervalle pour le nettoyage ultérieur
        timerRef.current = interval;
        
        toast.success("Enregistrement démarré");
      } catch (error) {
        console.error("Erreur au démarrage de la reconnaissance vocale:", error);
        toast.error("Erreur au démarrage de la reconnaissance vocale");
        stopRecording();
      }
    }
  };

  const stopRecording = () => {
    // Arrêter la reconnaissance vocale
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Erreur lors de l'arrêt de la reconnaissance vocale:", e);
      }
    }
    
    // Nettoyer les intervalles
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Fermer l'AudioContext
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(e => {
        console.error("Erreur lors de la fermeture de l'AudioContext:", e);
      });
      audioContextRef.current = null;
    }
    
    // Arrêter le MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Libérer le flux audio
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsRecording(false);
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      setIsProcessing(true);
      stopRecording();
      
      // Simuler un petit délai pour le traitement de la transcription finale
      setTimeout(() => {
        setIsProcessing(false);
        
        if (transcription.trim()) {
          toast.success("Transcription terminée");
        } else {
          toast.error("Aucun texte n'a été reconnu");
        }
      }, 1000);
    } else {
      await startRecording();
    }
  };

  const handleSave = () => {
    if (transcription.trim()) {
      onTranscriptionComplete(transcription.trim());
    } else {
      toast.error("Aucun contenu à enregistrer");
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <Card className="max-w-md mx-auto w-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>Enregistrement vocal</span>
            <span className="text-sm font-normal text-muted-foreground">
              {formatTime(recordingDuration)}
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center gap-4 py-6">
            <AudioWaveform 
              audioLevel={audioLevel} 
              isRecording={isRecording}
              color="#f4b400"
            />
            
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              className={`h-16 w-16 rounded-full transition-all duration-300 ${isRecording ? 'animate-pulse' : ''}`}
              onClick={handleToggleRecording}
              disabled={isProcessing}
            >
              {isRecording ? (
                <Square className="h-6 w-6" />
              ) : isProcessing ? (
                <Activity className="h-6 w-6 animate-pulse" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
            
            <div className="w-full mt-2">
              {isRecording && (
                <Progress value={audioLevel} className="h-2" />
              )}
            </div>
          </div>
          
          <div className={`rounded-lg border p-3 min-h-32 max-h-64 overflow-y-auto transition-all duration-200 ${transcription ? 'bg-card' : 'bg-muted/30'}`}>
            {transcription ? (
              <p className="whitespace-pre-wrap">{transcription}</p>
            ) : (
              <p className="text-muted-foreground text-center italic">
                {isRecording 
                  ? "Parlez maintenant..." 
                  : "Appuyez sur le microphone pour commencer l'enregistrement"}
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between gap-2 pt-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="w-1/2"
          >
            <X className="mr-2 h-4 w-4" />
            Annuler
          </Button>
          
          <Button 
            disabled={!transcription.trim() || isRecording || isProcessing}
            onClick={handleSave}
            className="w-1/2"
          >
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VoiceRecorder;
