
import { AIAnalysis } from '../types/note';
import { toast } from "sonner";

// Types pour les réponses API
interface TranscriptionResponse {
  text: string;
}

interface ChatResponse {
  generated_text: string;
}

// Clé API (à remplacer par l'utilisateur)
let huggingFaceApiKey = '';

export const setHuggingFaceApiKey = (key: string) => {
  huggingFaceApiKey = key;
  localStorage.setItem('huggingface_api_key', key);
};

export const getHuggingFaceApiKey = (): string => {
  if (!huggingFaceApiKey) {
    // Try to get from localStorage
    const storedKey = localStorage.getItem('huggingface_api_key');
    if (storedKey) {
      huggingFaceApiKey = storedKey;
    }
  }
  return huggingFaceApiKey;
};

export const checkApiKey = (): boolean => {
  return !!getHuggingFaceApiKey();
};

// Transcription audio avec Whisper
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  const apiKey = getHuggingFaceApiKey();
  if (!apiKey) {
    throw new Error("Clé API Hugging Face manquante");
  }

  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    
    const response = await fetch(
      'https://api-inference.huggingface.co/models/openai/whisper-small',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur lors de la transcription: ${response.statusText}`);
    }

    const result: TranscriptionResponse = await response.json();
    return result.text;
  } catch (error) {
    console.error("Erreur de transcription:", error);
    toast.error("Erreur lors de la transcription audio");
    return "";
  }
};

// Analyse de texte avec un modèle LLM
export const analyzeText = async (text: string): Promise<AIAnalysis> => {
  const apiKey = getHuggingFaceApiKey();
  if (!apiKey) {
    throw new Error("Clé API Hugging Face manquante");
  }

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `<s>[INST] Voici une note ou transcription. Je voudrais que tu me fournisses:
1. Un résumé bref (2-3 phrases)
2. Les points clés (liste de 3-5 points)
3. Le sentiment général exprimé (positif, négatif ou neutre)

Note: ${text} [/INST]</s>`,
          parameters: {
            max_new_tokens: 512,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur lors de l'analyse: ${response.statusText}`);
    }

    const result: ChatResponse = await response.json();
    
    // Parse la réponse générée
    const parsedResponse = parseAIResponse(result.generated_text);
    return parsedResponse;
  } catch (error) {
    console.error("Erreur d'analyse:", error);
    toast.error("Erreur lors de l'analyse du texte");
    return {
      summary: "Impossible d'analyser le texte",
      keyPoints: ["Erreur d'analyse"],
      sentiment: "neutre"
    };
  }
};

// Fonction auxiliaire pour extraire les informations de la réponse de l'IA
const parseAIResponse = (text: string): AIAnalysis => {
  // Extraction basique à partir de la réponse
  const summaryMatch = text.match(/résumé.*?:(.*?)(?:\n\n|\n\d|$)/is);
  const keyPointsMatch = text.match(/points clés.*?:(.*?)(?:\n\n|\n\d|$)/is);
  const sentimentMatch = text.match(/sentiment.*?:(.*?)(?:\n\n|$)/is);
  
  const summary = summaryMatch ? summaryMatch[1].trim() : "Pas de résumé disponible";
  
  // Extraire les points clés
  let keyPoints: string[] = [];
  if (keyPointsMatch && keyPointsMatch[1]) {
    const keyPointsText = keyPointsMatch[1].trim();
    // Essayer d'extraire les points sous forme de liste
    const points = keyPointsText.split(/\n-|\n•|\n\*|\n\d+\./);
    keyPoints = points
      .map(point => point.trim())
      .filter(point => point.length > 0);
    
    if (keyPoints.length === 0) {
      // Si aucun point n'a été extrait, utiliser le texte complet
      keyPoints = [keyPointsText];
    }
  } else {
    keyPoints = ["Pas de points clés disponibles"];
  }
  
  const sentiment = sentimentMatch 
    ? sentimentMatch[1].trim().toLowerCase().includes("positif") 
      ? "positif" 
      : sentimentMatch[1].trim().toLowerCase().includes("négatif") 
        ? "négatif" 
        : "neutre" 
    : "neutre";
  
  return {
    summary,
    keyPoints,
    sentiment
  };
};

// Chat avec l'IA à propos de la note
export const chatWithAI = async (message: string, context: string): Promise<string> => {
  const apiKey = getHuggingFaceApiKey();
  if (!apiKey) {
    throw new Error("Clé API Hugging Face manquante");
  }

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `<s>[INST] Contexte: ${context}

Question de l'utilisateur: ${message}

Réponds à cette question en te basant sur le contexte fourni. Si la réponse n'est pas dans le contexte, dis-le poliment. [/INST]</s>`,
          parameters: {
            max_new_tokens: 512,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur lors de la conversation: ${response.statusText}`);
    }

    const result: ChatResponse = await response.json();
    return result.generated_text;
  } catch (error) {
    console.error("Erreur de conversation:", error);
    toast.error("Erreur lors de la conversation avec l'IA");
    return "Désolé, je n'ai pas pu traiter votre demande en raison d'une erreur technique.";
  }
};
