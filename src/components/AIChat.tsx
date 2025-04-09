
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/types/note";
import { Send, ArrowLeft, RefreshCw } from "lucide-react";
import { chatWithAI } from "@/services/aiService";
import { toast } from "sonner";

interface AIChatProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, role: 'user' | 'assistant') => void;
  noteContent: string;
  onBack: () => void;
}

const AIChat = ({ messages, onSendMessage, noteContent, onBack }: AIChatProps) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (messageToSend = input.trim(), retry = false) => {
    if (!messageToSend) return;
    
    if (!retry) {
      setInput("");
      onSendMessage(messageToSend, 'user');
    }
    
    setIsLoading(true);
    setRetryMessage(null);
    
    try {
      console.log("Envoi de la demande à l'IA...");
      console.log("Contenu de la note envoyé:", noteContent.substring(0, 100) + "...");
      
      const response = await chatWithAI(messageToSend, noteContent);
      console.log("Réponse complète reçue de l'IA:", response);
      
      if (response && response.trim()) {
        // Traiter la réponse pour supprimer les balises d'instructions si présentes
        let cleanResponse = response;
        
        // Si la réponse contient un message d'erreur technique ou est vide, proposer de réessayer
        if (cleanResponse.includes("erreur") || 
            cleanResponse.includes("n'a pas pu") || 
            cleanResponse.includes("reformuler") ||
            cleanResponse.includes("n'a pas généré")) {
          setRetryMessage(messageToSend);
        }
        
        onSendMessage(cleanResponse, 'assistant');
      } else {
        throw new Error("Réponse vide ou invalide du modèle IA");
      }
    } catch (error) {
      console.error("Erreur complète de chat:", error);
      
      // Stocker le message pour permettre une nouvelle tentative
      setRetryMessage(messageToSend);
      
      toast.error("Erreur lors de la conversation avec l'IA");
      onSendMessage("Le modèle n'a pas généré de réponse. Veuillez reformuler votre question.", 'assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryMessage) {
      handleSendMessage(retryMessage, true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-card">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la note
        </Button>
        <h2 className="text-lg font-semibold">Chat avec VoxNote IA</h2>
        <div className="w-20"></div> {/* Spacer pour centrer le titre */}
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="mb-2">Posez des questions sur votre note</p>
              <p className="text-sm">L'IA se basera sur le contenu de votre note pour répondre</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-muted">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        {retryMessage && !isLoading && (
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center" 
              onClick={handleRetry}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-card">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Tapez votre message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
