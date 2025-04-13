
import { toast } from "sonner";

/**
 * Transcrit un fichier audio en utilisant l'API Whisper sur Hugging Face
 * @param audioBlob - Le fichier audio à transcrire
 * @returns La transcription du fichier audio
 */
export const transcribeWithWhisper = async (audioBlob: Blob): Promise<string> => {
  try {
    toast.info("🎙️ Transcription en cours...", {
      description: "Conversion de l'audio en texte via Whisper AI",
      id: "transcription-status"
    });
    
    console.log("Début de la transcription avec Whisper...");
    console.log("Type du blob audio:", audioBlob.type);
    console.log("Taille du blob audio:", Math.round(audioBlob.size / 1024), "KB");
    
    // Créer un FormData pour envoyer le fichier audio
    const formData = new FormData();
    formData.append("data", audioBlob);
    
    try {
      const response = await fetch("https://lsapk-whisper-asr.hf.space/api/predict/", {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        console.error(`Erreur HTTP: ${response.status}`, await response.text());
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Réponse API Whisper:", result);
      
      // La réponse de Gradio sera dans result.data
      const transcription = result.data;
      
      if (!transcription || !Array.isArray(transcription) || transcription.length === 0) {
        throw new Error("Format de réponse invalide ou aucune transcription reçue");
      }
      
      // Pour les espaces Gradio, le résultat est généralement dans le premier élément du tableau
      const textTranscription = transcription[0];
      
      console.log("Transcription réussie:", textTranscription);
      toast.success("🎉 Transcription terminée", { 
        id: "transcription-status",
        description: "Le texte est prêt"
      });
      
      return textTranscription;
    } catch (error) {
      console.error("Erreur lors de la transcription:", error);
      throw error;
    }
  } catch (error) {
    console.error("Erreur de transcription:", error);
    toast.error("⚠️ Erreur de transcription", { 
      id: "transcription-status",
      description: error instanceof Error ? error.message : "Une erreur inconnue est survenue"
    });
    return "La transcription n'a pas pu être réalisée. Veuillez réessayer.";
  }
};

// Fonction pour vérifier si le service est disponible
export const testWhisperConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch("https://lsapk-whisper-asr.hf.space/api/predict/", {
      method: 'OPTIONS'
    });
    return response.ok;
  } catch (error) {
    console.error("Erreur de connexion à Whisper:", error);
    return false;
  }
};
