
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { AIAnalysis, ChatMessage } from "@/types/note";
import { toast } from "sonner";

// Vérifier si la clé API est configurée
export const checkApiKey = (): boolean => {
  const apiKey = localStorage.getItem("geminiApiKey");
  return !!apiKey && apiKey.length > 0;
};

// Fonction pour analyser du texte
export const analyzeText = async (text: string): Promise<AIAnalysis> => {
  try {
    const apiKey = localStorage.getItem("geminiApiKey");
    
    if (!apiKey) {
      throw new Error("Clé API non configurée");
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash/generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyse le texte suivant et fournis un résumé concis, les points clés (format liste), et le sentiment général (positif, négatif, ou neutre). Réponds en français au format JSON exactement comme ceci sans explications supplémentaires: 
            {
              "summary": "Le résumé du texte",
              "keyPoints": ["Point clé 1", "Point clé 2", "Point clé 3"],
              "sentiment": "positif OU négatif OU neutre"
            }
            
            Texte à analyser: "${text}"`
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erreur API Gemini:", errorData);
      throw new Error(`Erreur API (${response.status}): ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    
    // Extraire la réponse au format texte
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error("Format de réponse inattendu");
    }
    
    // Extraire le JSON de la réponse (peut être entouré de ```json et ```)
    let jsonStr = responseText;
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
    }
    
    // Parser le JSON
    const analysis = JSON.parse(jsonStr);
    
    return {
      summary: analysis.summary || "Aucun résumé disponible",
      keyPoints: analysis.keyPoints || [],
      sentiment: analysis.sentiment?.toLowerCase() || "neutre"
    };
  } catch (error) {
    console.error("Erreur d'analyse:", error);
    throw error;
  }
};

// Fonction pour discuter avec l'IA à propos d'une note
export const chatWithAI = async (message: string, noteContent: string, noteId?: string): Promise<string> => {
  try {
    const apiKey = localStorage.getItem("geminiApiKey");
    
    if (!apiKey) {
      throw new Error("Clé API non configurée");
    }
    
    // Construction du contexte avec le contenu de la note
    const context = noteContent ? `Contexte - contenu de la note: ${noteContent}\n\n` : "";
    
    // Enrichir la demande avec des instructions pour des réponses plus engageantes
    const enhancedPrompt = `${context}${message}\n\nRéponds de manière utile, amicale et engageante. Utilise des emojis appropriés et un style conversationnel. Sois précis et direct dans ta réponse.`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash/generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: enhancedPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erreur API Gemini:", errorData);
      throw new Error(`Erreur API (${response.status}): ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    
    // Extraire la réponse au format texte
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error("Format de réponse inattendu");
    }
    
    // Enregistrer la conversation si connecté et si noteId est fourni
    if (noteId) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          // On pourrait enregistrer l'historique des conversations dans une table Supabase
          // si nécessaire dans le futur
        }
      } catch (error) {
        console.error("Erreur d'enregistrement de conversation:", error);
      }
    }
    
    return responseText;
  } catch (error) {
    console.error("Erreur de conversation:", error);
    toast.error(`Erreur IA: ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    throw error;
  }
};

// Fonction pour récupérer l'historique des conversations
export const getChatHistory = (noteId: string): ChatMessage[] => {
  // Pour le moment, on retourne un tableau vide car on n'a pas encore implémenté
  // la persistance des conversations. Cela pourrait être ajouté dans le futur.
  return [];
};

// Fonction pour transcrire de l'audio
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const apiKey = localStorage.getItem("geminiApiKey");
    
    if (!apiKey) {
      throw new Error("Clé API non configurée");
    }
    
    // Pour la transcription, on utilisera la méthode du service whisperService.ts
    // qui est déjà implémentée
    
    return "Transcription en cours...";
  } catch (error) {
    console.error("Erreur de transcription:", error);
    throw error;
  }
};
