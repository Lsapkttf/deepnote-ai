
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import FuturisticButton from "@/components/FuturisticButton";
import { Mic, Square, Save, X, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
  onCancel: () => void;
}

const VoiceRecorder = ({ onTranscriptionComplete, onCancel }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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
        if (finalTranscript) {
          return prev + finalTranscript;
        }
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
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const setupAudioAnalyser = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          
          const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
          
          setAudioLevel(Math.min(100, average * 1.2));
        }
      };
      
      const intervalId = setInterval(updateAudioLevel, 100);
      timerRef.current = intervalId;
      
      return stream;
    } catch (error) {
      console.error("Erreur d'accès au microphone:", error);
      toast.error("Impossible d'accéder au microphone");
      return null;
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      
      setIsRecording(false);
      
      if (transcription.trim()) {
        toast.success("Transcription terminée");
      }
    } else {
      setTranscription("");
      setRecordingDuration(0);
      
      const stream = await setupAudioAnalyser();
      if (!stream) return;
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.start();
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
          
          const startTime = Date.now();
          const interval = setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            setRecordingDuration(elapsedTime);
          }, 1000);
          
          timerRef.current = interval;
        } catch (error) {
          console.error("Erreur au démarrage de la reconnaissance vocale:", error);
          toast.error("Erreur au démarrage de la reconnaissance vocale");
        }
      }
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

  const generateWaveform = () => {
    return (
      <div className="flex items-center justify-center gap-1 h-10">
        {Array.from({ length: 12 }).map((_, index) => {
          const height = isRecording 
            ? Math.max(4, Math.min(30, audioLevel / 3 * Math.sin((index + 1) * (Date.now() % 1000) / 1000)))
            : 4;
          
          return (
            <div
              key={index}
              className="w-1 bg-primary rounded-full transition-all duration-100"
              style={{ height: `${height}px` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <Card className="max-w-md mx-auto w-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span>Enregistrement vocal</span>
            <span className="text-sm font-normal text-muted-foreground">
              {formatTime(recordingDuration)}
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center gap-6 py-8">
            <div className="relative">
              <FuturisticButton
                size="lg"
                gradient={isRecording}
                glow={isRecording}
                variant={isRecording ? "default" : "outline"}
                className={`h-20 w-20 rounded-full transition-all duration-300 ${isRecording ? 'animate-pulse' : ''}`}
                onClick={handleToggleRecording}
              >
                {isRecording ? (
                  <Square className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </FuturisticButton>
              
              {isRecording && (
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  {generateWaveform()}
                </div>
              )}
            </div>
            
            <div className="w-full">
              {isRecording && (
                <Progress value={audioLevel} className="h-1.5" />
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
        
        <CardFooter className="flex justify-between gap-2">
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="w-1/2"
          >
            <X className="mr-2 h-4 w-4" />
            Annuler
          </Button>
          
          <Button 
            disabled={!transcription.trim()}
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
