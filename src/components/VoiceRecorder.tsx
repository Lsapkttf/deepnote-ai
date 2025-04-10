
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import FuturisticButton from "@/components/FuturisticButton";
import { Mic, Square, Play, Pause, Save, X } from "lucide-react";
import { RecordingState } from "@/services/audioService";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
  onCancel: () => void;
}

const VoiceRecorder = ({ onTranscriptionComplete, onCancel }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [maxDuration] = useState(120); // 2 minutes max
  const [transcription, setTranscription] = useState("");
  
  // Web Speech API References
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Initialize Web Speech API
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR'; // Définir la langue sur le français
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        
        if (finalTranscript) {
          setTranscription(prev => prev + finalTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Erreur de reconnaissance vocale:", event.error);
        toast.error("Erreur de reconnaissance vocale");
      };
    } else {
      toast.error("La reconnaissance vocale n'est pas supportée par votre navigateur");
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    let interval: number;
    
    if (isRecording) {
      interval = window.setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            handleStopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, maxDuration]);

  useEffect(() => {
    if (audioUrl) {
      audioElementRef.current = new Audio(audioUrl);
      
      audioElementRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      
      return () => {
        if (audioElementRef.current) {
          audioElementRef.current.removeEventListener('ended', () => {
            setIsPlaying(false);
          });
        }
      };
    }
  }, [audioUrl]);

  const handleStartRecording = async () => {
    try {
      setRecordingTime(0);
      setTranscription("");
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = audioChunks;
      
      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });
      
      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Arrêter la reconnaissance vocale à la fin de l'enregistrement audio
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      });
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Démarrer la reconnaissance vocale en temps réel
      if (recognitionRef.current) {
        recognitionRef.current.start();
        toast.success("Reconnaissance vocale démarrée");
      }
      
      toast.success("Enregistrement démarré");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      toast.error("Impossible d'accéder au microphone");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Arrêter tous les flux audio
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      // Arrêter la reconnaissance vocale
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      setIsRecording(false);
      toast.success("Enregistrement terminé");
    }
  };

  const togglePlayback = () => {
    if (!audioElementRef.current) return;
    
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSaveNote = () => {
    if (transcription.trim()) {
      onTranscriptionComplete(transcription);
    } else {
      toast.error("Aucune transcription disponible");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 flex flex-col items-center justify-center h-full">
      <Card className="w-full max-w-lg shadow-lg border-border">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-xl font-semibold text-center flex items-center justify-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            Enregistrement Vocal
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6 pb-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-center space-x-2">
              {isRecording ? (
                <>
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="font-medium">Enregistrement en cours...</span>
                  </span>
                </>
              ) : audioUrl ? (
                <span className="font-medium">Enregistrement terminé</span>
              ) : (
                <span className="font-medium">Prêt à enregistrer</span>
              )}
            </div>
            
            <div className="text-center text-3xl font-mono font-semibold">
              {formatTime(recordingTime)}
            </div>
            
            {isRecording && (
              <>
                <Progress value={(recordingTime / maxDuration) * 100} className="h-2" />
                <div className="text-xs text-muted-foreground text-center">
                  Temps restant: {formatTime(maxDuration - recordingTime)}
                </div>
              </>
            )}
            
            <div className="flex justify-center space-x-4 my-4">
              {!isRecording && !audioUrl && (
                <FuturisticButton
                  gradient
                  glow 
                  size="lg" 
                  className="rounded-full w-16 h-16 text-white"
                  onClick={handleStartRecording}
                >
                  <Mic className="h-6 w-6" />
                </FuturisticButton>
              )}
              
              {isRecording && (
                <Button 
                  size="lg"
                  variant="outline" 
                  className="rounded-full w-16 h-16 border-red-500 text-red-500"
                  onClick={handleStopRecording}
                >
                  <Square className="h-6 w-6" />
                </Button>
              )}
              
              {!isRecording && audioUrl && (
                <Button 
                  size="lg"
                  variant="outline" 
                  className="rounded-full w-12 h-12"
                  onClick={togglePlayback}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
              )}
            </div>

            {(isRecording || transcription) && (
              <div className="mt-2">
                <label className="block text-sm font-medium mb-2">
                  Transcription en temps réel:
                </label>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 overflow-y-auto h-32 text-sm">
                  {transcription || "Parlez pour voir la transcription apparaître ici..."}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-4"
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          
          {(audioUrl && transcription) && (
            <FuturisticButton
              gradient
              onClick={handleSaveNote}
              className="px-4"
            >
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </FuturisticButton>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default VoiceRecorder;
