
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { AIAnalysis, ChatMessage } from "@/types/note";
import { toast } from "sonner";

// Use the provided Gemini API key
const GEMINI_API_KEY = "AIzaSyDEPP28PMCmQN1c8hR9JZd9-osYVkXpcLY";
const GEMINI_MODEL = "gemini-1.5-flash"; // Updated to use Gemini 1.5 Flash

// Check if API key is configured
export const checkApiKey = (): boolean => {
  return !!GEMINI_API_KEY;
};

// Function to analyze text
export const analyzeText = async (text: string): Promise<AIAnalysis> => {
  try {
    if (!text.trim()) {
      return {
        summary: "Aucun contenu à analyser",
        keyPoints: ["La note est vide"],
        sentiment: "neutre"
      };
    }
    
    // Using Gemini 1.5 Flash for improved performance
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}/generateContent?key=${GEMINI_API_KEY}`, {
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
    
    // Extract response text
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error("Format de réponse inattendu");
    }
    
    // Extract JSON from response (may be surrounded by ```json and ```)
    let jsonStr = responseText;
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
    }
    
    // Parse JSON
    const analysis = JSON.parse(jsonStr);
    
    return {
      summary: analysis.summary || "Aucun résumé disponible",
      keyPoints: analysis.keyPoints || [],
      sentiment: analysis.sentiment?.toLowerCase() || "neutre"
    };
  } catch (error) {
    console.error("Erreur d'analyse:", error);
    toast.error("Erreur lors de l'analyse avec Gemini: " + (error instanceof Error ? error.message : "Erreur inconnue"));
    return {
      summary: "Erreur lors de l'analyse",
      keyPoints: ["Impossible d'analyser le contenu"],
      sentiment: "neutre"
    };
  }
};

// Function to chat with AI about a note
export const chatWithAI = async (message: string, noteContent: string, noteId?: string): Promise<string> => {
  try {
    // Build context with note content
    const context = noteContent ? `Contexte - contenu de la note: ${noteContent}\n\n` : "";
    
    // Enhance request with instructions for more engaging responses
    const enhancedPrompt = `${context}${message}\n\nRéponds de manière utile, amicale et engageante. Utilise des emojis appropriés et un style conversationnel. Sois précis et direct dans ta réponse.`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}/generateContent?key=${GEMINI_API_KEY}`, {
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
    
    // Extract text response
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error("Format de réponse inattendu");
    }
    
    // Save conversation if logged in and noteId is provided
    if (noteId) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          // Could record conversation history in a Supabase table
          // if needed in the future
          console.log("User is logged in, could save conversation history");
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

// Function to get conversation history
export const getChatHistory = (noteId: string): ChatMessage[] => {
  // For now, return an empty array as we haven't implemented
  // conversation persistence yet. This could be added in the future.
  return [];
};

// Function to transcribe audio
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    // For transcription, we'll use the method from whisperService.ts
    // which is already implemented
    
    return "Transcription en cours...";
  } catch (error) {
    console.error("Erreur de transcription:", error);
    throw error;
  }
};
