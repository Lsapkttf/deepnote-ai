
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause } from "lucide-react";
import { startRecording, stopRecording, RecordingState } from "@/services/audioService";
import { Progress } from "@/components/ui/progress";
import { transcribeAudio } from "@/services/aiService";
import { toast } from "@/components/ui/sonner";

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

  const handleTranscribe = async () => {
    if (!recordingState.audioChunks.length) {
      toast.error("Aucun enregistrement à transcrire");
      return;
    }
    
    setIsTranscribing(true);
    
    try {
      const audioBlob = new Blob(recordingState.audioChunks, { type: 'audio/wav' });
      const transcription = await transcribeAudio(audioBlob);
      
      if (transcription) {
        onTranscriptionComplete(transcription);
      } else {
        toast.error("La transcription n'a pas pu être générée");
      }
    } catch (error) {
      console.error("Erreur de transcription:", error);
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
    <div className="p-4 flex flex-col items-center">
      <div className="w-full max-w-md bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-center">Enregistrement vocal</h2>
        
        <div className="mb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            {recordingState.isRecording ? (
              <>
                <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse-recording"></div>
                <span className="text-sm">Enregistrement en cours...</span>
              </>
            ) : recordingState.audioURL ? (
              <span className="text-sm">Enregistrement terminé</span>
            ) : (
              <span className="text-sm">Prêt à enregistrer</span>
            )}
          </div>
          
          <div className="text-center text-xl font-mono">{formatTime(recordingTime)}</div>
          
          {recordingState.isRecording && (
            <Progress value={Math.min(recordingTime, 300) / 3} className="mt-2" />
          )}
        </div>
        
        <div className="flex justify-center space-x-4 mb-6">
          {!recordingState.isRecording && !recordingState.audioURL && (
            <Button 
              size="lg" 
              className="rounded-full bg-red-500 hover:bg-red-600 text-white"
              onClick={handleStartRecording}
            >
              <Mic className="h-5 w-5" />
            </Button>
          )}
          
          {recordingState.isRecording && (
            <Button 
              size="lg"
              variant="outline" 
              className="rounded-full border-red-500 text-red-500"
              onClick={handleStopRecording}
            >
              <Square className="h-5 w-5" />
            </Button>
          )}
          
          {!recordingState.isRecording && recordingState.audioURL && (
            <Button 
              size="lg"
              variant="outline" 
              className="rounded-full"
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
        
        <div className="flex space-x-2 justify-end">
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
            {isTranscribing ? "Transcription en cours..." : "Transcrire"}
            {isTranscribing && (
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                    fill="none"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;
