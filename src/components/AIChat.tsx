
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/types/note";
import { Send, ArrowLeft } from "lucide-react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput("");
    
    // Envoyer le message de l'utilisateur
    onSendMessage(userMessage, 'user');
    
    // Traiter la réponse de l'IA
    setIsLoading(true);
    try {
      console.log("Envoi de la demande à l'IA...");
      const response = await chatWithAI(userMessage, noteContent);
      console.log("Réponse reçue de l'IA:", response ? response.substring(0, 50) + "..." : "aucune réponse");
      onSendMessage(response, 'assistant');
    } catch (error) {
      console.error("Erreur de chat:", error);
      toast.error("Erreur lors de la conversation avec l'IA");
      onSendMessage("Désolé, je n'ai pas pu traiter votre demande. Veuillez vérifier votre clé API et réessayer.", 'assistant');
    } finally {
      setIsLoading(false);
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
            onClick={handleSendMessage}
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
