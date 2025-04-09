
import { AIAnalysis } from '../types/note';
import { toast } from "sonner";

// Types pour les réponses API
interface TranscriptionResponse {
  text: string;
}

interface ChatResponse {
  choices: [{
    message: {
      content: string;
    }
  }];
  generated_text?: string;
}

// Clé API par défaut (clé de l'utilisateur)
const DEFAULT_API_KEY = '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';
let huggingFaceApiKey = DEFAULT_API_KEY;

export const setHuggingFaceApiKey = (key: string) => {
  huggingFaceApiKey = key;
  localStorage.setItem('huggingface_api_key', key);
};

export const getHuggingFaceApiKey = (): string => {
  // Toujours utiliser la clé par défaut fournie par l'utilisateur
  return DEFAULT_API_KEY;
};

export const checkApiKey = (): boolean => {
  return !!getHuggingFaceApiKey();
};

// Transcription audio avec Whisper
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  const apiKey = getHuggingFaceApiKey();
  
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
      const errorText = await response.text();
      console.error("Erreur API:", errorText);
      throw new Error(`Erreur lors de la transcription: ${response.status} ${response.statusText}`);
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
  
  if (!text || text.trim().length === 0) {
    toast.error("Aucun texte à analyser");
    throw new Error("Aucun texte à analyser");
  }

  try {
    console.log("Démarrage de l'analyse avec le texte:", text.substring(0, 100) + "...");
    
    const prompt = `<s>[INST] Voici une note ou transcription. Je voudrais que tu me fournisses:
1. Un résumé bref (2-3 phrases)
2. Les points clés (liste de 3-5 points)
3. Le sentiment général exprimé (positif, négatif ou neutre)

Note: ${text} [/INST]</s>`;

    console.log("Envoi de la requête à Hugging Face");
    
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 512,
            temperature: 0.7,
            return_full_text: false
          },
        }),
      }
    );

    console.log("Statut de la réponse:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur API détaillée:", errorText);
      throw new Error(`Erreur lors de l'analyse: ${response.status} ${response.statusText}`);
    }

    // Récupérer le texte brut pour le debugging
    const responseText = await response.text();
    console.log("Réponse brute de l'API:", responseText.substring(0, 200) + "...");
    
    // Parser la réponse JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error("Erreur de parsing JSON:", e);
      throw new Error("Format de réponse invalide");
    }
    
    console.log("Réponse analysée:", result);
    
    // Extraction du texte généré
    let generatedText = "";
    if (Array.isArray(result) && result.length > 0 && result[0].generated_text) {
      generatedText = result[0].generated_text;
    } else if (result.generated_text) {
      generatedText = result.generated_text;
    } else if (result.choices && result.choices.length > 0) {
      generatedText = result.choices[0].message.content;
    } else {
      console.error("Format de réponse inattendu:", result);
      throw new Error("Format de réponse inattendu de l'API");
    }
    
    console.log("Texte généré extrait:", generatedText.substring(0, 150) + "...");
    
    // Si le texte généré est vide, lever une erreur
    if (!generatedText || generatedText.trim() === "") {
      throw new Error("Réponse vide du modèle");
    }
    
    // Parse la réponse générée
    const parsedResponse = parseAIResponse(generatedText);
    console.log("Analyse parsée:", parsedResponse);
    return parsedResponse;
  } catch (error) {
    console.error("Erreur d'analyse détaillée:", error);
    toast.error("Erreur lors de l'analyse du texte");
    return {
      summary: "Impossible d'analyser le texte",
      keyPoints: ["Erreur d'analyse", "Vérifiez votre connexion internet", "Réessayez plus tard"],
      sentiment: "neutre"
    };
  }
};

// Fonction auxiliaire pour extraire les informations de la réponse de l'IA
const parseAIResponse = (text: string): AIAnalysis => {
  if (!text) {
    return {
      summary: "Pas de texte à analyser",
      keyPoints: ["Erreur: réponse vide"],
      sentiment: "neutre"
    };
  }
  
  console.log("Texte à parser (longueur):", text.length);
  
  // Extraction basique à partir de la réponse
  const summaryMatch = text.match(/résumé.*?:(.*?)(?:\n\n|\n\d|$)/is);
  const keyPointsMatch = text.match(/points clés.*?:(.*?)(?:\n\n|\n\d|$)/is);
  const sentimentMatch = text.match(/sentiment.*?:(.*?)(?:\n\n|$)/is);
  
  // Tentative d'extraction sans les marqueurs spécifiques si les regex précédentes échouent
  const fallbackSummaryMatch = !summaryMatch && text.match(/^(.*?)(?:\n\n|\n\d|$)/s);
  
  const summary = summaryMatch && summaryMatch[1] 
    ? summaryMatch[1].trim() 
    : fallbackSummaryMatch && fallbackSummaryMatch[1]
    ? fallbackSummaryMatch[1].trim()
    : "Pas de résumé disponible";
  
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
    // Tentative d'extraction de points clés sans marqueur spécifique
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.match(/^[•\-*]|^\d+\./));
    
    if (lines.length > 0) {
      keyPoints = lines.map(line => line.replace(/^[•\-*]|^\d+\./, '').trim());
    } else {
      keyPoints = ["Pas de points clés disponibles"];
    }
  }
  
  // S'assurer qu'il y a au moins un point clé
  if (keyPoints.length === 0) {
    keyPoints = ["Pas de points clés détectés"];
  }
  
  // Déterminer le sentiment
  let sentiment = "neutre";
  if (sentimentMatch && sentimentMatch[1]) {
    const sentimentText = sentimentMatch[1].trim().toLowerCase();
    if (sentimentText.includes("positif")) {
      sentiment = "positif";
    } else if (sentimentText.includes("négatif")) {
      sentiment = "négatif";
    }
  } else {
    // Recherche de mots-clés de sentiment dans tout le texte
    const fullText = text.toLowerCase();
    if (fullText.includes("positif") && !fullText.includes("négatif")) {
      sentiment = "positif";
    } else if (fullText.includes("négatif") && !fullText.includes("positif")) {
      sentiment = "négatif";
    }
  }
  
  return {
    summary,
    keyPoints,
    sentiment
  };
};

// Chat avec l'IA à propos de la note
export const chatWithAI = async (message: string, context: string): Promise<string> => {
  const apiKey = getHuggingFaceApiKey();
  
  try {
    console.log("Envoi de message au chat IA:", message);
    console.log("Contexte fourni (extrait):", context.substring(0, 100) + "...");
    
    // Limiter la taille du contexte si nécessaire
    const maxContextLength = 2000;
    const trimmedContext = context.length > maxContextLength 
      ? context.substring(0, maxContextLength) + "..." 
      : context;
    
    const prompt = `<s>[INST] Contexte: ${trimmedContext}

Question de l'utilisateur: ${message}

Réponds à cette question en te basant sur le contexte fourni. Si la réponse n'est pas dans le contexte, dis-le poliment. [/INST]</s>`;

    console.log("Prompt complet (extrait):", prompt.substring(0, 150) + "...");
    
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 512,
            temperature: 0.7,
            return_full_text: false
          },
        }),
      }
    );

    console.log("Statut de la réponse:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur API:", errorText);
      throw new Error(`Erreur lors de la conversation: ${response.status} ${response.statusText}`);
    }

    // Récupérer le texte brut pour le debugging
    const responseText = await response.text();
    console.log("Réponse brute (texte):", responseText.substring(0, 300) + "...");
    
    // Tenter de parser la réponse JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error("Erreur de parsing JSON:", e);
      throw new Error("Format de réponse invalide");
    }
    
    console.log("Réponse du chat parsée:", result);
    
    // Extraction du texte généré en fonction du format de réponse
    let generatedText = "";
    if (Array.isArray(result) && result.length > 0) {
      if (result[0].generated_text !== undefined) {
        generatedText = result[0].generated_text;
      }
    } else if (result.generated_text) {
      generatedText = result.generated_text;
    } else if (result.choices && result.choices.length > 0) {
      generatedText = result.choices[0].message.content;
    }
    
    console.log("Texte de réponse extrait:", generatedText.substring(0, 150) + "...");
    
    // Si la réponse est vide après toutes les tentatives d'extraction
    if (!generatedText || generatedText.trim() === "") {
      console.error("Réponse vide après extraction");
      return "Le modèle n'a pas généré de réponse. Veuillez reformuler votre question.";
    }
    
    // Nettoyer la réponse (supprimer les balises d'instruction si présentes)
    let cleanResponse = generatedText;
    const instPattern = /<s>\[INST\].*?\[\/INST\]<\/s>/s;
    
    if (instPattern.test(cleanResponse)) {
      cleanResponse = cleanResponse.replace(instPattern, '').trim();
    }
    
    // Si après nettoyage la réponse est vide
    if (!cleanResponse || cleanResponse.trim() === "") {
      return "Le modèle n'a pas généré de réponse valide. Veuillez réessayer.";
    }
    
    return cleanResponse;
  } catch (error) {
    console.error("Erreur de conversation détaillée:", error);
    let errorMessage = "Désolé, je n'ai pas pu traiter votre demande.";
    
    if (error instanceof Error) {
      errorMessage += " Erreur: " + error.message;
    }
    
    return errorMessage;
  }
};
