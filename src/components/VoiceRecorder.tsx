
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, Loader2 } from "lucide-react";
import { startRecording, stopRecording, RecordingState } from "@/services/audioService";
import { Progress } from "@/components/ui/progress";
import { transcribeAudio } from "@/services/aiService";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [partialTranscription, setPartialTranscription] = useState("");
  const [finalTranscription, setFinalTranscription] = useState("");

  useEffect(() => {
    let interval: number;
    
    if (recordingState.isRecording) {
      interval = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordingState.isRecording]);

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
    setPartialTranscription("");
    setFinalTranscription("");
    await startRecording(recordingState, setRecordingState);
  };

  const handleStopRecording = () => {
    stopRecording(recordingState, setRecordingState);
    
    // Start auto-transcription after stopping
    setTimeout(() => {
      handleTranscribe();
    }, 500);
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

  const handleTranscribe = async () => {
    if (!recordingState.audioChunks.length) {
      toast.error("Aucun enregistrement à transcrire");
      return;
    }
    
    setIsTranscribing(true);
    setPartialTranscription("Transcription en cours...");
    
    try {
      const audioBlob = new Blob(recordingState.audioChunks, { type: 'audio/wav' });
      const transcription = await transcribeAudio(audioBlob);
      
      if (transcription) {
        setFinalTranscription(transcription);
        onTranscriptionComplete(transcription);
      } else {
        setPartialTranscription("");
        toast.error("La transcription n'a pas pu être générée");
      }
    } catch (error) {
      console.error("Erreur de transcription:", error);
      setPartialTranscription("");
      toast.error("Erreur lors de la transcription");
    } finally {
      setIsTranscribing(false);
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
              <Progress value={Math.min(recordingTime, 300) / 3} className="h-2" />
            )}
            
            <div className="flex justify-center space-x-4 my-4">
              {!recordingState.isRecording && !recordingState.audioURL && (
                <Button 
                  size="lg" 
                  className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleStartRecording}
                >
                  <Mic className="h-6 w-6" />
                </Button>
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

            {(partialTranscription || finalTranscription) && (
              <div className="mt-4 p-4 rounded-md bg-muted/40 max-h-[200px] overflow-y-auto">
                <h3 className="text-sm font-medium mb-2">Transcription:</h3>
                <p className="text-sm whitespace-pre-line">
                  {finalTranscription || partialTranscription}
                </p>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Annuler
          </Button>
          
          <Button
            onClick={handleTranscribe}
            disabled={!recordingState.audioURL || isTranscribing}
            className="relative"
          >
            {isTranscribing ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Transcription...
              </span>
            ) : finalTranscription ? "Utiliser cette transcription" : "Transcrire"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VoiceRecorder;
