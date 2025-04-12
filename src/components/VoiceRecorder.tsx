
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, Loader2, Play, X, Save } from "lucide-react";
import { startRecording, stopRecording, RecordingState } from "@/services/audioService";
import { transcribeWithWhisper } from "@/services/whisperService";
import AudioWaveform from "@/components/AudioWaveform";
import FuturisticButton from "@/components/FuturisticButton";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
  onCancel: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptionComplete, onCancel }) => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    audioURL: null,
    mediaRecorder: null,
    audioChunks: [],
    duration: 0,
    audioLevel: 0
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // Nettoyage à la fermeture du composant
  useEffect(() => {
    return () => {
      if (recordingState.isRecording) {
        stopRecording(recordingState, setRecordingState);
      }
      
      if (recordingState.audioURL) {
        URL.revokeObjectURL(recordingState.audioURL);
      }
    };
  }, []);

  // Gérer le timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (recordingState.isRecording) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setTimeElapsed(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordingState.isRecording]);

  const handleStartRecording = useCallback(async () => {
    try {
      console.log("Démarrage de l'enregistrement");
      toast.info("Démarrage de l'enregistrement...");
      
      await startRecording(
        recordingState, 
        (newState) => {
          console.log("Mise à jour de l'état d'enregistrement:", newState.isRecording);
          setRecordingState(newState);
        },
        (level) => {
          setRecordingState(prev => ({ ...prev, audioLevel: level }));
        }
      );
    } catch (error) {
      console.error("Erreur lors du démarrage de l'enregistrement:", error);
      toast.error("Impossible de démarrer l'enregistrement");
    }
  }, [recordingState]);

  const handleStopRecording = useCallback(async () => {
    try {
      console.log("Arrêt de l'enregistrement");
      toast.info("Arrêt de l'enregistrement...");
      
      stopRecording(recordingState, (newState) => {
        console.log("Enregistrement arrêté, nouvel état:", newState);
        setRecordingState(newState);
      });
    } catch (error) {
      console.error("Erreur lors de l'arrêt de l'enregistrement:", error);
      toast.error("Erreur lors de l'arrêt de l'enregistrement");
    }
  }, [recordingState]);

  const handleTranscribeAudio = async () => {
    if (!recordingState.audioChunks.length) {
      toast.error("Aucun enregistrement à transcrire");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const audioBlob = new Blob(recordingState.audioChunks, { 
        type: recordingState.mediaRecorder?.mimeType || 'audio/webm' 
      });
      
      console.log("Transcription de l'audio, taille du blob:", audioBlob.size);
      const result = await transcribeWithWhisper(audioBlob);
      console.log("Transcription terminée:", result);
      
      setTranscription(result);
    } catch (error) {
      console.error("Erreur lors de la transcription:", error);
      toast.error("Erreur lors de la transcription audio");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveTranscription = () => {
    onTranscriptionComplete(transcription);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h2 className="text-xl font-bold">🎙️ Note vocale</h2>
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
                  recordingState.isRecording 
                    ? "bg-red-100 dark:bg-red-900 recording-pulse" 
                    : "bg-muted"
                }`}
              >
                {recordingState.isRecording ? (
                  <Square 
                    className="h-16 w-16 text-red-500" 
                    onClick={handleStopRecording} 
                  />
                ) : (
                  <Mic 
                    className="h-16 w-16 text-muted-foreground" 
                    onClick={handleStartRecording} 
                  />
                )}
              </div>
              {recordingState.isRecording && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                  {formatTime(timeElapsed)}
                </div>
              )}
            </div>
            
            {recordingState.isRecording ? (
              <div className="w-full h-20 mt-4">
                <AudioWaveform 
                  audioLevel={recordingState.audioLevel}
                  isRecording={recordingState.isRecording}
                  color="#ef4444"
                  barCount={32}
                />
              </div>
            ) : (
              <>
                {recordingState.audioURL ? (
                  <div className="mt-4 w-full">
                    <audio 
                      src={recordingState.audioURL} 
                      controls 
                      className="w-full" 
                    />
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground mt-6">
                    <p>Appuyez sur le micro pour commencer l'enregistrement</p>
                    <p className="text-sm mt-2">
                      Parlez clairement et nous transcrirons votre message
                    </p>
                  </div>
                )}
              </>
            )}
            
            {recordingState.audioURL && !transcription && !isProcessing && (
              <FuturisticButton 
                className="mt-6" 
                onClick={handleTranscribeAudio}
                disabled={isProcessing}
                gradient
                glow
              >
                <Play className="h-4 w-4 mr-2" />
                Transcrire l'audio
              </FuturisticButton>
            )}
            
            {isProcessing && (
              <div className="flex flex-col items-center justify-center mt-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-muted-foreground">Transcription en cours...</p>
              </div>
            )}
          </div>
        </Card>
        
        {transcription && (
          <Card className="p-6 shadow-sm">
            <h3 className="font-semibold mb-2">✨ Transcription</h3>
            <div className="bg-muted p-4 rounded-md mb-4 max-h-64 overflow-y-auto">
              <p className="whitespace-pre-wrap">{transcription}</p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setTranscription("")}
              >
                <X className="h-4 w-4 mr-2" />
                Effacer
              </Button>
              <Button 
                onClick={handleSaveTranscription}
              >
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </Card>
        )}
      </div>
      
      {recordingState.isRecording && (
        <div className="p-4 border-t flex justify-center">
          <Button 
            variant="destructive" 
            size="lg"
            onClick={handleStopRecording}
            className="px-6"
          >
            <Square className="h-4 w-4 mr-2" />
            Arrêter l'enregistrement
          </Button>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
