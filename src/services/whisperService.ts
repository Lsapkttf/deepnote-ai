
import { toast } from "sonner";

// URL de l'espace Hugging Face
const WHISPER_API_URL = 'https://huggingface.co/spaces/Lsapk/whisper-asr/api/predict';
const HF_TOKEN = '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';

// Interface pour la réponse de l'API
interface WhisperResponse {
  data?: string[];
  error?: string;
}

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
    formData.append('audio', audioBlob, 'audio.webm');
    
    // Envoyer la requête à l'API Hugging Face
    const response = await fetch(WHISPER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`
      },
      body: formData
    });
    
    if (!response.ok) {
      console.error(`Erreur HTTP: ${response.status}`, await response.text());
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const result: WhisperResponse = await response.json();
    console.log("Réponse API Whisper:", result);
    
    // Vérifier les erreurs
    if (result.error) {
      throw new Error(`Erreur Whisper: ${result.error}`);
    }
    
    // Extraire la transcription (la structure exacte dépend de la réponse de l'API)
    const transcription = result.data && result.data.length > 0 ? result.data[0] : "";
    
    if (!transcription) {
      throw new Error("Aucune transcription reçue");
    }
    
    console.log("Transcription réussie:", transcription);
    toast.success("🎉 Transcription terminée", { 
      id: "transcription-status",
      description: "Le texte est prêt"
    });
    
    return transcription;
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
    const response = await fetch(WHISPER_API_URL, {
      method: 'OPTIONS',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`
      }
    });
    return response.ok;
  } catch (error) {
    console.error("Erreur de connexion à Whisper:", error);
    return false;
  }
};
