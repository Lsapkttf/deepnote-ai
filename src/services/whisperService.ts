
import { toast } from "sonner";

// URL de l'espace Hugging Face
const WHISPER_API_URL = 'https://api-inference.huggingface.co/models/openai/whisper-large-v3';
const HF_TOKEN = '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';

// Interface pour la réponse de l'API
interface WhisperResponse {
  text?: string;
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
    
    // Envoyer la requête à l'API Hugging Face directement
    const response = await fetch(WHISPER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`
      },
      body: audioBlob
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
    
    // Extraire la transcription
    const transcription = result.text || "";
    
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

