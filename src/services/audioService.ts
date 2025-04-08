
import { toast } from "@/components/ui/sonner";

export interface RecordingState {
  isRecording: boolean;
  audioURL: string | null;
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
}

export const startRecording = async (
  state: RecordingState,
  setRecordingState: (state: RecordingState) => void
): Promise<void> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];

    mediaRecorder.addEventListener("dataavailable", (event) => {
      audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const audioURL = URL.createObjectURL(audioBlob);
      
      setRecordingState({
        ...state,
        isRecording: false,
        audioURL,
        audioChunks
      });
    });

    mediaRecorder.start();
    
    setRecordingState({
      isRecording: true,
      audioURL: null,
      mediaRecorder,
      audioChunks
    });
    
    toast.success("Enregistrement démarré");
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error);
    toast.error("Impossible d'accéder au microphone");
  }
};

export const stopRecording = (
  state: RecordingState,
  setRecordingState: (state: RecordingState) => void
): void => {
  if (state.mediaRecorder && state.isRecording) {
    state.mediaRecorder.stop();
    
    // Arrêter tous les flux audio
    if (state.mediaRecorder.stream) {
      state.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    setRecordingState({
      ...state,
      isRecording: false
    });
    
    toast.success("Enregistrement terminé");
  }
};

export const getAudioBlob = (state: RecordingState): Blob | null => {
  if (state.audioChunks.length === 0) return null;
  return new Blob(state.audioChunks, { type: "audio/wav" });
};
