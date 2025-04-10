
import { AIAnalysis } from '../types/note';
import { toast } from "sonner";

// Clé API Groq fixe fournie par l'utilisateur
const API_KEY = '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';

// Stockage en mémoire des conversations pour chaque note
interface ConversationMemory {
  [noteId: string]: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }[];
}

// Initialiser la mémoire de conversation
const conversationMemory: ConversationMemory = {};

// Fonction pour analyser le texte avec Groq (Llama 3)
export const analyzeText = async (text: string): Promise<AIAnalysis> => {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error("Aucun texte à analyser");
    }

    console.log("Démarrage de l'analyse avec Groq...");
    
    const prompt = `Voici une note: "${text.substring(0, 4000)}${text.length > 4000 ? '...' : ''}"

Je voudrais que tu me fournisses:
1. Un résumé bref (2-3 phrases)
2. Les points clés (liste de 3-5 points)
3. Le sentiment général exprimé (positif, négatif ou neutre)

Réponds avec un format clairement structuré:

Résumé:
[Ton résumé ici]

Points clés:
- [Premier point]
- [Deuxième point]
- [Troisième point]
- [Etc. si nécessaire]

Sentiment:
[positif/négatif/neutre]`;

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: "Tu es un assistant spécialisé dans l'analyse de texte en français."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 500,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur API Groq:", errorText);
      throw new Error(`Erreur de connexion: ${response.status}`);
    }

    const result = await response.json();
    console.log("Réponse brute:", result);
    
    if (result.choices && result.choices.length > 0 && result.choices[0].message) {
      const generatedText = result.choices[0].message.content;
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
    } else {
      throw new Error("Format de réponse inattendu");
    }
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
export const chatWithAI = async (message: string, noteContent: string, noteId?: string): Promise<string> => {
  try {
    if (!message || message.trim().length === 0) {
      throw new Error("Message vide");
    }

    console.log("Envoi au chat IA via Groq:", message);
    
    // Limiter la taille du contenu de la note pour éviter les dépassements
    const trimmedContent = noteContent.length > 3000 
      ? noteContent.substring(0, 3000) + "..." 
      : noteContent;
    
    const systemPrompt = "Tu es un assistant qui répond à des questions sur le contenu d'une note. Réponds uniquement en te basant sur les informations fournies dans la note. Si la réponse n'est pas dans le contenu, dis-le simplement.";
    
    // Construire les messages avec historique si disponible
    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      {
        role: "system",
        content: systemPrompt
      }
    ];
    
    // Ajouter l'historique de conversation si disponible pour cette note
    if (noteId && conversationMemory[noteId]) {
      const history = conversationMemory[noteId];
      // Limiter l'historique aux 10 derniers échanges pour éviter les dépassements de tokens
      const recentHistory = history.slice(-10);
      
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.role as 'user' | 'assistant', // Conversion explicite du type
          content: msg.content
        });
      });
    }
    
    // Ajouter le message actuel
    messages.push({
      role: "user", 
      content: `Contexte (contenu de la note): "${trimmedContent}"

Question: ${message}`
    });
    
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur API Groq chat:", errorText);
      throw new Error(`Erreur de connexion: ${response.status}`);
    }

    const result = await response.json();
    console.log("Réponse brute du chat:", result);
    
    if (result.choices && result.choices.length > 0 && result.choices[0].message) {
      const generatedText = result.choices[0].message.content;
      console.log("Réponse générée:", generatedText);
      
      // Sauvegarder dans l'historique de conversation si noteId est fourni
      if (noteId) {
        if (!conversationMemory[noteId]) {
          conversationMemory[noteId] = [];
        }
        
        // Sauvegarder la question de l'utilisateur
        conversationMemory[noteId].push({
          role: 'user',
          content: message,
          timestamp: new Date()
        });
        
        // Sauvegarder la réponse de l'assistant
        conversationMemory[noteId].push({
          role: 'assistant',
          content: generatedText,
          timestamp: new Date()
        });
      }
      
      return generatedText.trim();
    } else {
      throw new Error("Format de réponse inattendu");
    }
  } catch (error) {
    console.error("Erreur de chat:", error);
    
    if (error instanceof Error) {
      return `Désolé, je n'ai pas pu répondre. Erreur: ${error.message}`;
    } else {
      return "Désolé, une erreur est survenue lors de la communication avec l'IA.";
    }
  }
};

// Fonction pour récupérer l'historique des conversations pour une note
export const getChatHistory = (noteId: string) => {
  return conversationMemory[noteId] || [];
};

// Fonction pour la transcription audio
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    console.log("Début de la transcription audio...");
    
    // Créer un FormData pour envoyer le fichier audio
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');
    
    const response = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      console.error("Erreur API transcription:", await response.text());
      return "La transcription audio n'est pas disponible. Veuillez entrer le texte manuellement.";
    }

    const result = await response.json();
    console.log("Transcription réussie:", result);
    return result.text || "";
  } catch (error) {
    console.error("Erreur de transcription:", error);
    toast.error("Erreur lors de la transcription audio");
    return "La transcription audio n'est pas disponible actuellement. Veuillez entrer le texte manuellement.";
  }
};

// Fonctions utilitaires pour extraire les informations de la réponse de l'IA
function extractSummary(text: string): string {
  // Rechercher le résumé entre "Résumé:" et la prochaine section
  const summaryMatch = text.match(/Résumé\s*:(.*?)(?=Points clés|$)/is);
  if (summaryMatch && summaryMatch[1]) {
    return summaryMatch[1].trim();
  }
  
  // Fallback: prendre les premières lignes qui ne contiennent pas "Points clés" ou "Sentiment"
  const lines = text.split('\n').filter(line => {
    const lowerLine = line.toLowerCase();
    return !lowerLine.includes('points clés') && !lowerLine.includes('sentiment');
  });
  
  if (lines.length > 0) {
    return lines.slice(0, 3).join(' ').trim();
  }
  
  return "Résumé non disponible";
}

function extractKeyPoints(text: string): string[] {
  // Chercher la section des points clés
  const keyPointsMatch = text.match(/Points clés\s*:(.*?)(?=Sentiment|$)/is);
  
  if (keyPointsMatch && keyPointsMatch[1]) {
    // Extraire les points (format liste avec tirets)
    const pointsText = keyPointsMatch[1].trim();
    const points = pointsText.split(/\n-|\n•|\n\*/)
      .map(point => point.trim())
      .filter(point => point.length > 0 && !point.startsWith('Points clés'));
    
    if (points.length > 0) {
      return points;
    }
  }
  
  // Rechercher des lignes qui ressemblent à des points de liste dans tout le texte
  const listItems = text.match(/(?:^|\n)[-•*]\s*(.*?)(?=$|\n)/g);
  if (listItems && listItems.length > 0) {
    return listItems.map(item => item.replace(/^[-•*\s]+/, '').trim());
  }
  
  return ["Points clés non disponibles"];
}

function extractSentiment(text: string): string {
  // Rechercher la mention explicite du sentiment
  const sentimentMatch = text.match(/Sentiment\s*:(.*?)(?=$)/is);
  
  if (sentimentMatch && sentimentMatch[1]) {
    const sentimentText = sentimentMatch[1].trim().toLowerCase();
    
    if (sentimentText.includes("positif")) {
      return "positif";
    }
    else if (sentimentText.includes("négatif")) {
      return "négatif";
    }
  }
  
  // Rechercher des mots-clés de sentiment dans tout le texte
  const lowerText = text.toLowerCase();
  if (lowerText.includes("sentiment") && lowerText.includes("positif")) {
    return "positif";
  }
  else if (lowerText.includes("sentiment") && lowerText.includes("négatif")) {
    return "négatif";
  }
  
  return "neutre";
}

// Pour compatibilité avec le code existant
export const setHuggingFaceApiKey = (key: string) => {
  console.log("Note: La clé API est maintenant fixe (Groq)");
  localStorage.setItem('groq_api_key', API_KEY);
};

export const getHuggingFaceApiKey = (): string => {
  return API_KEY;
};

export const checkApiKey = (): boolean => {
  return true; // Toujours vrai car la clé est fixe
};
