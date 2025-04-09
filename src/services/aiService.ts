
import { AIAnalysis } from '../types/note';
import { toast } from "sonner";

// Clé API fixe fournie par l'utilisateur
const API_KEY = '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';

// Fonction pour analyser le texte avec Mistral
export const analyzeText = async (text: string): Promise<AIAnalysis> => {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error("Aucun texte à analyser");
    }

    console.log("Démarrage de l'analyse...");
    
    const prompt = `<s>[INST] Voici une note: "${text.substring(0, 4000)}${text.length > 4000 ? '...' : ''}"

Je voudrais que tu me fournisses:
1. Un résumé bref (2-3 phrases)
2. Les points clés (liste de 3-5 points)
3. Le sentiment général exprimé (positif, négatif ou neutre)
[/INST]</s>`;

    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            return_full_text: false
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur API:", errorText);
      throw new Error(`Erreur de connexion: ${response.status}`);
    }

    const result = await response.json();
    console.log("Réponse brute:", result);
    
    let generatedText = "";
    if (Array.isArray(result) && result.length > 0 && result[0].generated_text) {
      generatedText = result[0].generated_text;
    } else if (result.generated_text) {
      generatedText = result.generated_text;
    } else {
      throw new Error("Format de réponse inattendu");
    }

    console.log("Texte généré:", generatedText);
    
    // Extraction des parties du texte
    const summary = extractSummary(generatedText);
    const keyPoints = extractKeyPoints(generatedText);
    const sentiment = extractSentiment(generatedText);

    return {
      summary,
      keyPoints,
      sentiment
    };
  } catch (error) {
    console.error("Erreur d'analyse:", error);
    toast.error("Erreur lors de l'analyse du texte");
    
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      summary: "Impossible d'analyser le texte",
      keyPoints: ["Erreur lors de l'analyse", "Veuillez réessayer ultérieurement"],
      sentiment: "neutre"
    };
  }
};

// Fonction pour le chat IA
export const chatWithAI = async (message: string, noteContent: string): Promise<string> => {
  try {
    if (!message || message.trim().length === 0) {
      throw new Error("Message vide");
    }

    console.log("Envoi au chat IA:", message);
    
    // Limiter la taille du contenu de la note pour éviter les dépassements
    const trimmedContent = noteContent.length > 3000 
      ? noteContent.substring(0, 3000) + "..." 
      : noteContent;
    
    const prompt = `<s>[INST] Contexte (contenu de la note): "${trimmedContent}"

Question: ${message}

Réponds à cette question en te basant uniquement sur le contenu de la note. Si la réponse n'est pas dans le contexte, dis-le simplement. [/INST]</s>`;

    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            return_full_text: false
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur API chat:", errorText);
      throw new Error(`Erreur de connexion: ${response.status}`);
    }

    const result = await response.json();
    console.log("Réponse brute du chat:", result);
    
    let generatedText = "";
    if (Array.isArray(result) && result.length > 0 && result[0].generated_text) {
      generatedText = result[0].generated_text;
    } else if (result.generated_text) {
      generatedText = result.generated_text;
    } else {
      throw new Error("Format de réponse inattendu");
    }

    console.log("Réponse générée:", generatedText);
    
    return generatedText.trim();
  } catch (error) {
    console.error("Erreur de chat:", error);
    
    if (error instanceof Error) {
      return `Désolé, je n'ai pas pu répondre. Erreur: ${error.message}`;
    } else {
      return "Désolé, une erreur est survenue lors de la communication avec l'IA.";
    }
  }
};

// Fonction pour la transcription audio
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    
    const response = await fetch(
      'https://api-inference.huggingface.co/models/openai/whisper-small',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur API transcription:", errorText);
      throw new Error(`Erreur lors de la transcription: ${response.status}`);
    }

    const result = await response.json();
    return result.text || "";
  } catch (error) {
    console.error("Erreur de transcription:", error);
    toast.error("Erreur lors de la transcription audio");
    return "";
  }
};

// Fonctions utilitaires pour extraire les informations de la réponse de l'IA
function extractSummary(text: string): string {
  // Rechercher les motifs courants pour le résumé
  const summaryPatterns = [
    /résumé\s*:([^]*?)(?=points clés|points-clés|sentiment|$)/i,
    /^([^]*?)(?=points clés|points-clés|sentiment|$)/i,
  ];
  
  for (const pattern of summaryPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Prendre les premières lignes comme résumé par défaut
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  if (lines.length > 0) {
    return lines[0].trim();
  }
  
  return "Résumé non disponible";
}

function extractKeyPoints(text: string): string[] {
  // Rechercher des sections de points clés
  const keyPointsSection = text.match(/points clés\s*:([^]*?)(?=sentiment|$)/i) || 
                          text.match(/points-clés\s*:([^]*?)(?=sentiment|$)/i);
  
  if (keyPointsSection && keyPointsSection[1]) {
    // Extraire chaque point (format liste)
    const points = keyPointsSection[1].split(/\n-|\n•|\n\*|\n\d+\./)
      .map(point => point.trim())
      .filter(point => point.length > 0);
    
    if (points.length > 0) {
      return points;
    }
  }
  
  // Rechercher des lignes qui ressemblent à des points de liste dans tout le texte
  const listItems = text.match(/(?:^|\n)[-•*]\s*(.*?)(?=$|\n)/g);
  if (listItems && listItems.length > 0) {
    return listItems.map(item => item.replace(/^[-•*\s]+/, '').trim());
  }
  
  // Rechercher des lignes numérotées
  const numberedItems = text.match(/(?:^|\n)\d+\.\s*(.*?)(?=$|\n)/g);
  if (numberedItems && numberedItems.length > 0) {
    return numberedItems.map(item => item.replace(/^\d+\.\s*/, '').trim());
  }
  
  // Si aucun point n'est trouvé, retourner un message par défaut
  return ["Points clés non disponibles"];
}

function extractSentiment(text: string): string {
  // Rechercher des mentions explicites de sentiment
  const sentimentSection = text.match(/sentiment\s*:([^]*?)(?=$)/i);
  
  if (sentimentSection && sentimentSection[1]) {
    const sentimentText = sentimentSection[1].trim().toLowerCase();
    
    if (sentimentText.includes("positif")) {
      return "positif";
    }
    else if (sentimentText.includes("négatif")) {
      return "négatif";
    }
  }
  
  // Rechercher des mots-clés de sentiment dans tout le texte
  const lowerText = text.toLowerCase();
  if (lowerText.includes("sentiment") && lowerText.includes("positif") && !lowerText.includes("négatif")) {
    return "positif";
  }
  else if (lowerText.includes("sentiment") && lowerText.includes("négatif") && !lowerText.includes("positif")) {
    return "négatif";
  }
  
  // Par défaut, retourner neutre
  return "neutre";
}

// Pour compatibilité avec le code existant
export const setHuggingFaceApiKey = (key: string) => {
  console.log("Note: La clé API est maintenant fixe");
  localStorage.setItem('huggingface_api_key', API_KEY);
};

export const getHuggingFaceApiKey = (): string => {
  return API_KEY;
};

export const checkApiKey = (): boolean => {
  return true; // Toujours vrai car la clé est fixe
};
