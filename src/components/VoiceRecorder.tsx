
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import FuturisticButton from "@/components/FuturisticButton";
import { Mic, Square, Play, Pause, Save, X } from "lucide-react";
import { startRecording, stopRecording, RecordingState } from "@/services/audioService";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
  onCancel: () => void;
}

const VoiceRecorder = ({ onTranscriptionComplete, onCancel }: VoiceRecorderProps) => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    audioURL: null,
    mediaRecorder: null,
    audioChunks: []
  });
  
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [manualTranscription, setManualTranscription] = useState("");
  const [maxDuration] = useState(120); // 2 minutes max
  
  useEffect(() => {
    let interval: number;
    
    if (recordingState.isRecording) {
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
  }, [recordingState.isRecording, maxDuration]);

  useEffect(() => {
    if (recordingState.audioURL) {
      const audio = new Audio(recordingState.audioURL);
      setAudioElement(audio);
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      
      return () => {
        audio.removeEventListener('ended', () => {
          setIsPlaying(false);
        });
      };
    }
  }, [recordingState.audioURL]);

  const handleStartRecording = async () => {
    setRecordingTime(0);
    setManualTranscription("");
    await startRecording(recordingState, setRecordingState);
  };

  const handleStopRecording = () => {
    stopRecording(recordingState, setRecordingState);
  };

  const togglePlayback = () => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  const handleSaveNote = () => {
    if (manualTranscription.trim()) {
      onTranscriptionComplete(manualTranscription);
    } else {
      toast.error("Veuillez ajouter une transcription avant de sauvegarder");
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
              {recordingState.isRecording ? (
                <>
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="font-medium">Enregistrement en cours...</span>
                  </span>
                </>
              ) : recordingState.audioURL ? (
                <span className="font-medium">Enregistrement terminé</span>
              ) : (
                <span className="font-medium">Prêt à enregistrer</span>
              )}
            </div>
            
            <div className="text-center text-3xl font-mono font-semibold">
              {formatTime(recordingTime)}
            </div>
            
            {recordingState.isRecording && (
              <>
                <Progress value={(recordingTime / maxDuration) * 100} className="h-2" />
                <div className="text-xs text-muted-foreground text-center">
                  Temps restant: {formatTime(maxDuration - recordingTime)}
                </div>
              </>
            )}
            
            <div className="flex justify-center space-x-4 my-4">
              {!recordingState.isRecording && !recordingState.audioURL && (
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
              
              {recordingState.isRecording && (
                <Button 
                  size="lg"
                  variant="outline" 
                  className="rounded-full w-16 h-16 border-red-500 text-red-500"
                  onClick={handleStopRecording}
                >
                  <Square className="h-6 w-6" />
                </Button>
              )}
              
              {!recordingState.isRecording && recordingState.audioURL && (
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

            {recordingState.audioURL && (
              <div className="mt-2">
                <label className="block text-sm font-medium mb-2">
                  Transcription manuelle:
                </label>
                <Textarea
                  placeholder="Écrivez ici ce que vous avez dit dans l'enregistrement..."
                  className="resize-none h-32"
                  value={manualTranscription}
                  onChange={(e) => setManualTranscription(e.target.value)}
                />
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
          
          {recordingState.audioURL && (
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
