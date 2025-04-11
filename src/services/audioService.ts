
import { toast } from "sonner";

export interface RecordingState {
  isRecording: boolean;
  audioURL: string | null;
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
  duration: number;
  audioLevel: number;
}

// Démarrer l'enregistrement audio
export const startRecording = async (
  state: RecordingState,
  setRecordingState: (state: RecordingState) => void,
  onAudioLevel?: (level: number) => void
): Promise<void> => {
  try {
    // Demander les permissions et obtenir le flux audio
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    });
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    // Créer le MediaRecorder avec des options de qualité améliorée
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4'
    });
    
    const audioChunks: Blob[] = [];
    const startTime = Date.now();

    // Événement pour capturer les morceaux audio
    mediaRecorder.addEventListener("dataavailable", (event) => {
      audioChunks.push(event.data);
    });

    // Événement à la fin de l'enregistrement
    mediaRecorder.addEventListener("stop", () => {
      const audioBlob = new Blob(audioChunks, { 
        type: mediaRecorder.mimeType 
      });
      const audioURL = URL.createObjectURL(audioBlob);
      
      setRecordingState({
        ...state,
        isRecording: false,
        audioURL,
        audioChunks,
        duration: Math.floor((Date.now() - startTime) / 1000)
      });
      
      // Arrêter tous les flux audio
      stream.getTracks().forEach(track => track.stop());
      audioContext.close();
      
      // Libérer la mémoire
      window.URL.revokeObjectURL(state.audioURL || "");
    });

    // Mettre en place la mise à jour du niveau audio
    const updateAudioLevel = () => {
      if (analyser && state.isRecording) {
        analyser.getByteFrequencyData(dataArray);
        
        // Calculer le niveau audio moyen
        const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        
        // Normaliser entre 0 et 100
        const normalizedLevel = Math.min(100, average * 1.5);
        
        if (onAudioLevel) {
          onAudioLevel(normalizedLevel);
        }
        
        setRecordingState({
          ...state,
          audioLevel: normalizedLevel
        });
      }
    };
    
    const levelInterval = setInterval(updateAudioLevel, 100);
    
    // Suivi du temps d'enregistrement
    const durationInterval = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      setRecordingState({
        ...state,
        duration: elapsedTime
      });
    }, 1000);

    // Démarrer l'enregistrement
    mediaRecorder.start();
    
    setRecordingState({
      isRecording: true,
      audioURL: null,
      mediaRecorder,
      audioChunks,
      duration: 0,
      audioLevel: 0
    });
    
    // Sauvegarder les intervalles pour pouvoir les nettoyer plus tard
    (mediaRecorder as any)._levelInterval = levelInterval;
    (mediaRecorder as any)._durationInterval = durationInterval;
    
    toast.success("Enregistrement démarré");
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error);
    toast.error("Impossible d'accéder au microphone");
  }
};

// Arrêter l'enregistrement
export const stopRecording = (
  state: RecordingState,
  setRecordingState: (state: RecordingState) => void
): void => {
  if (state.mediaRecorder && state.isRecording) {
    // Nettoyer les intervalles
    if ((state.mediaRecorder as any)._levelInterval) {
      clearInterval((state.mediaRecorder as any)._levelInterval);
    }
    
    if ((state.mediaRecorder as any)._durationInterval) {
      clearInterval((state.mediaRecorder as any)._durationInterval);
    }
    
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

// Obtenir le blob audio
export const getAudioBlob = (state: RecordingState): Blob | null => {
  if (state.audioChunks.length === 0) return null;
  
  return new Blob(state.audioChunks, { 
    type: 'audio/wav'
  });
};

// Nettoyer les ressources d'enregistrement
export const cleanupRecording = (state: RecordingState): void => {
  if (state.audioURL) {
    window.URL.revokeObjectURL(state.audioURL);
  }
  
  if (state.mediaRecorder && state.mediaRecorder.stream) {
    state.mediaRecorder.stream.getTracks().forEach(track => track.stop());
  }
};
