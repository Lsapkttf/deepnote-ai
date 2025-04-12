
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
    // Vérifier si l'API est disponible
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Votre navigateur ne supporte pas l'enregistrement audio");
      return;
    }
    
    // Demander les permissions et obtenir le flux audio
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    });
    
    // Créer le contexte audio et l'analyseur
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    // Vérifier les formats supportés
    let mimeType = 'audio/webm';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'audio/mp4';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = '';
      }
    }
    
    // Créer le MediaRecorder
    const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    
    const audioChunks: Blob[] = [];
    const startTime = Date.now();

    // Gestion des chunks audio
    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    });

    // Gestion de la fin d'enregistrement
    mediaRecorder.addEventListener("stop", () => {
      // Combiner les chunks en un blob
      const audioBlob = new Blob(audioChunks, { 
        type: mediaRecorder.mimeType || 'audio/webm' 
      });
      const audioURL = URL.createObjectURL(audioBlob);
      
      // Mettre à jour l'état
      setRecordingState({
        ...state,
        isRecording: false,
        audioURL,
        audioChunks,
        duration: Math.floor((Date.now() - startTime) / 1000)
      });
      
      // Arrêter les flux audio
      stream.getTracks().forEach(track => track.stop());
      audioContext.close().catch(err => console.error("Erreur lors de la fermeture du contexte audio:", err));
      
      // Libérer la mémoire
      window.URL.revokeObjectURL(state.audioURL || "");
      
      // Nettoyer les intervalles
      if ((mediaRecorder as any)._levelInterval) {
        clearInterval((mediaRecorder as any)._levelInterval);
      }
      
      if ((mediaRecorder as any)._durationInterval) {
        clearInterval((mediaRecorder as any)._durationInterval);
      }
      
      toast.success("Enregistrement terminé");
    });

    // Gestion des erreurs
    mediaRecorder.addEventListener("error", (event) => {
      console.error("Erreur MediaRecorder:", event);
      toast.error("Erreur lors de l'enregistrement");
      stopRecording(state, setRecordingState);
    });

    // Mettre en place la mise à jour du niveau audio
    const updateAudioLevel = () => {
      if (analyser && state.isRecording) {
        analyser.getByteFrequencyData(dataArray);
        
        // Utiliser les basses fréquences pour la voix humaine
        const average = Array.from(dataArray)
          .slice(0, 20)
          .reduce((acc, val) => acc + val, 0) / 20;
        
        // Normaliser entre 0 et 100 avec facteur d'amplification
        const normalizedLevel = Math.min(100, average * 2);
        
        if (onAudioLevel) {
          onAudioLevel(normalizedLevel);
        }
        
        setRecordingState({
          ...state,
          audioLevel: normalizedLevel
        });
      }
    };
    
    const levelInterval = setInterval(updateAudioLevel, 50);
    
    // Suivi du temps d'enregistrement
    const durationInterval = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      setRecordingState({
        ...state,
        duration: elapsedTime
      });
    }, 1000);

    // Démarrer l'enregistrement avec chunks réguliers
    mediaRecorder.start(1000);
    
    // Mettre à jour l'état
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
    
    if ((error as any).name === 'NotAllowedError') {
      toast.error("L'accès au microphone a été refusé");
    } else if ((error as any).name === 'NotFoundError') {
      toast.error("Aucun microphone détecté");
    } else {
      toast.error("Impossible d'accéder au microphone");
    }
  }
};

// Arrêter l'enregistrement
export const stopRecording = (
  state: RecordingState,
  setRecordingState: (state: RecordingState) => void
): void => {
  if (!state.mediaRecorder || !state.isRecording) return;
  
  try {
    // Nettoyer les intervalles
    if ((state.mediaRecorder as any)._levelInterval) {
      clearInterval((state.mediaRecorder as any)._levelInterval);
    }
    
    if ((state.mediaRecorder as any)._durationInterval) {
      clearInterval((state.mediaRecorder as any)._durationInterval);
    }
    
    // Arrêter l'enregistrement s'il est en cours
    if (state.mediaRecorder.state !== 'inactive') {
      state.mediaRecorder.stop();
    }
    
    // Arrêter tous les flux audio
    if (state.mediaRecorder.stream) {
      state.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    // Mettre à jour l'état
    setRecordingState({
      ...state,
      isRecording: false
    });
  } catch (error) {
    console.error("Erreur lors de l'arrêt de l'enregistrement:", error);
    
    // Forcer la mise à jour de l'état en cas d'erreur
    setRecordingState({
      ...state,
      isRecording: false
    });
  }
};

// Obtenir le blob audio
export const getAudioBlob = (state: RecordingState): Blob | null => {
  if (state.audioChunks.length === 0) return null;
  
  return new Blob(state.audioChunks, { 
    type: state.mediaRecorder?.mimeType || 'audio/webm'
  });
};

// Nettoyer les ressources d'enregistrement
export const cleanupRecording = (state: RecordingState): void => {
  // Libérer les URL
  if (state.audioURL) {
    try {
      window.URL.revokeObjectURL(state.audioURL);
    } catch (e) {
      console.error("Erreur lors de la libération de l'URL:", e);
    }
  }
  
  // Arrêter les flux
  if (state.mediaRecorder && state.mediaRecorder.stream) {
    try {
      state.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    } catch (e) {
      console.error("Erreur lors de l'arrêt des flux:", e);
    }
  }
};
