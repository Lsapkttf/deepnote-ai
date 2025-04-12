
import { toast } from "sonner";

// URL de l'espace Hugging Face - Mise à jour avec votre espace
const WHISPER_API_URL = 'https://huggingface.co/spaces/Lsapk/whisper-asr/api/run/predict';

// Interface pour la réponse de l'API
interface WhisperResponse {
  data: [string] | string | null;
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
    
    console.log("Début de la transcription avec Whisper HF Space...");
    console.log("Type du blob audio:", audioBlob.type);
    console.log("Taille du blob audio:", Math.round(audioBlob.size / 1024), "KB");
    
    // Convertir le Blob en Base64
    const base64Audio = await blobToBase64(audioBlob);
    const base64Data = base64Audio.split(',')[1]; // Enlève le préfixe data:audio/...;base64,
    
    // Préparer les données pour l'API
    const payload = {
      data: [
        base64Data,
        null, // Utiliser le modèle par défaut
        "transcribe" // Mode de transcription
      ]
    };
    
    // Envoyer la requête à l'API
    const response = await fetch(WHISPER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
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
    let transcription = "";
    if (Array.isArray(result.data) && result.data.length > 0) {
      transcription = result.data[0] || "";
    } else if (typeof result.data === 'string') {
      transcription = result.data;
    }
    
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

// Fonction utilitaire pour convertir un Blob en Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Fonction pour vérifier si le service est disponible
export const testWhisperConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://huggingface.co/spaces/Lsapk/whisper-asr');
    return response.ok;
  } catch (error) {
    console.error("Erreur de connexion à l'espace Whisper:", error);
    return false;
  }
};
