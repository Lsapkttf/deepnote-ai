
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Save, X, Activity, Volume2 } from "lucide-react";
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
  
  // Références pour gérer les ressources
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  // Fonction pour initialiser la reconnaissance vocale
  const initSpeechRecognition = () => {
    try {
      if (typeof window === 'undefined') return false;
      
      // Vérifier la disponibilité de l'API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error("La reconnaissance vocale n'est pas supportée par votre navigateur");
        return false;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';
      
      let finalTranscript = '';
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Mettre à jour la transcription affichée
        setTranscription(finalTranscript + interimTranscript);
        console.log("Transcription mise à jour:", finalTranscript + interimTranscript);
      };
      
      recognition.onerror = (event: any) => {
        console.error("Erreur de reconnaissance vocale:", event.error);
        if (event.error === 'not-allowed') {
          toast.error("L'accès au microphone a été refusé");
        }
      };
      
      recognition.onend = () => {
        // Redémarrer la reconnaissance si toujours en enregistrement
        if (isRecording) {
          try {
            recognition.start();
            console.log("Reconnaissance redémarrée");
          } catch (e) {
            console.error("Erreur au redémarrage de la reconnaissance:", e);
          }
        }
      };
      
      recognitionRef.current = recognition;
      return true;
    } catch (error) {
      console.error("Erreur d'initialisation de la reconnaissance vocale:", error);
      toast.error("Erreur d'initialisation de la reconnaissance vocale");
      return false;
    }
  };

  // Configurer l'analyseur audio pour visualiser les niveaux
  const setupAudioAnalyser = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Configurer le MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm' 
          : 'audio/mp4'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      
      return { analyser, mediaRecorder };
    } catch (error) {
      console.error("Erreur d'accès au microphone:", error);
      toast.error("Impossible d'accéder au microphone");
      return null;
    }
  };

  // Démarrer l'enregistrement
  const startRecording = async () => {
    // Réinitialiser les états
    setTranscription("");
    setRecordingDuration(0);
    setIsRecording(true);
    audioChunksRef.current = [];
    
    // Initialiser la reconnaissance vocale
    const recognitionInitialized = initSpeechRecognition();
    
    // Configurer l'analyseur audio
    const setup = await setupAudioAnalyser();
    if (!setup) {
      setIsRecording(false);
      return;
    }
    
    const { analyser, mediaRecorder } = setup;
    
    // Démarrer la reconnaissance vocale
    if (recognitionInitialized && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        console.log("Reconnaissance vocale démarrée");
      } catch (e) {
        console.error("Erreur au démarrage de la reconnaissance:", e);
      }
    }
    
    // Démarrer l'enregistrement audio
    mediaRecorder.start(1000);
    console.log("Enregistrement audio démarré");
    
    // Mettre à jour le niveau audio régulièrement
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const updateAudioLevel = () => {
      if (analyser && isRecording) {
        analyser.getByteFrequencyData(dataArray);
        
        // Calculer le niveau audio moyen
        const average = Array.from(dataArray)
          .slice(0, 20)
          .reduce((acc, val) => acc + val, 0) / 20;
        
        // Normaliser entre 0 et 100
        setAudioLevel(Math.min(100, average * 2));
      }
    };
    
    const audioLevelInterval = setInterval(updateAudioLevel, 50);
    
    // Mettre à jour la durée d'enregistrement
    const startTime = Date.now();
    const durationInterval = setInterval(() => {
      setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    // Stocker les références pour le nettoyage
    timerRef.current = {
      audioLevel: audioLevelInterval,
      duration: durationInterval
    } as any;
    
    toast.success("Enregistrement démarré");
  };

  // Arrêter l'enregistrement
  const stopRecording = () => {
    setIsProcessing(true);
    
    // Arrêter la reconnaissance vocale
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log("Reconnaissance vocale arrêtée");
      } catch (e) {
        console.error("Erreur lors de l'arrêt de la reconnaissance:", e);
      }
    }
    
    // Arrêter les intervalles
    if (timerRef.current) {
      if ((timerRef.current as any).audioLevel) clearInterval((timerRef.current as any).audioLevel);
      if ((timerRef.current as any).duration) clearInterval((timerRef.current as any).duration);
    }
    
    // Arrêter l'enregistrement audio
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      console.log("Enregistrement audio arrêté");
      
      // Finaliser la transcription
      setTimeout(() => {
        setIsProcessing(false);
        setIsRecording(false);
        
        if (transcription.trim()) {
          toast.success("Transcription terminée");
        } else {
          // Fallback si la transcription est vide
          const fallbackText = "Note vocale " + new Date().toLocaleString();
          setTranscription(fallbackText);
          toast.info("Transcription automatique générée");
        }
      }, 1000);
    }
    
    // Nettoyer les ressources audio
    cleanupAudioResources();
  };

  // Nettoyer les ressources audio
  const cleanupAudioResources = () => {
    // Arrêter et libérer le flux audio
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Fermer le contexte audio
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.error("Erreur lors de la fermeture du contexte audio:", e);
      }
      audioContextRef.current = null;
    }
    
    // Réinitialiser l'analyseur
    analyserRef.current = null;
  };

  // Nettoyer les ressources lors du démontage du composant
  useEffect(() => {
    return () => {
      // Arrêter l'enregistrement si en cours
      if (isRecording) {
        stopRecording();
      }
      
      // Nettoyer les ressources
      cleanupAudioResources();
    };
  }, []);

  // Gérer le basculement de l'enregistrement
  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  // Enregistrer la transcription
  const handleSave = () => {
    if (transcription.trim()) {
      onTranscriptionComplete(transcription.trim());
    } else {
      toast.error("Aucun contenu à enregistrer");
    }
  };

  // Formater le temps d'enregistrement
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <Card className="max-w-md mx-auto w-full shadow-lg">
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
              color="#6d28d9"
            />
            
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              className={`h-16 w-16 rounded-full transition-all duration-300 ${isRecording ? 'animate-pulse shadow-lg' : 'shadow-md'}`}
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
            disabled={(!transcription.trim() && !isProcessing) || isRecording}
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
