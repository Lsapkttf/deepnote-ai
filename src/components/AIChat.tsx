
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/types/note";
import { Send, ArrowLeft, RefreshCw, User, Bot } from "lucide-react";
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
    // Focus sur l'input quand le chat s'ouvre
    setTimeout(() => inputRef.current?.focus(), 100);
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
      console.log("Envoi de la demande à l'IA via Groq...");
      
      const response = await chatWithAI(messageToSend, noteContent);
      console.log("Réponse reçue:", response);
      
      if (response) {
        onSendMessage(response, 'assistant');
      } else {
        throw new Error("Réponse vide");
      }
    } catch (error) {
      console.error("Erreur de chat:", error);
      
      // Stocker le message pour permettre une nouvelle tentative
      setRetryMessage(messageToSend);
      
      toast.error("Erreur lors de la conversation avec l'IA");
      onSendMessage("Erreur lors de la communication avec l'IA. Veuillez réessayer.", 'assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryMessage) {
      handleSendMessage(retryMessage, true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading && input.trim()) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-card">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la note
        </Button>
        <h2 className="text-lg font-semibold">Chat avec VoxNote IA (Groq)</h2>
        <div className="w-20"></div> {/* Spacer pour centrer le titre */}
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-60 items-center justify-center">
              <div className="text-center text-muted-foreground max-w-md">
                <p className="mb-2 text-lg">Posez des questions sur votre note</p>
                <p className="text-sm">L'IA se basera sur le contenu de votre note pour répondre à vos questions. Essayez par exemple de demander un résumé ou des informations spécifiques.</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start max-w-[85%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${
                    message.role === "user" ? "bg-primary ml-2" : "bg-muted mr-2"
                  }`}>
                    {message.role === "user" ? 
                      <User className="h-4 w-4 text-primary-foreground" /> : 
                      <Bot className="h-4 w-4 text-foreground" />
                    }
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <div className="whitespace-pre-line">{message.content}</div>
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-muted mr-2">
                  <Bot className="h-4 w-4 text-foreground" />
                </div>
                <div className="rounded-lg p-3 bg-muted">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {retryMessage && !isLoading && (
            <div className="flex justify-center my-2">
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
      </ScrollArea>

      <div className="p-4 border-t bg-card">
        <div className="flex items-center space-x-2">
          <Input
            ref={inputRef}
            placeholder="Tapez votre message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
