import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/types/note";
import { Send, ArrowLeft, RefreshCw, User, Bot, Loader2, Sparkles, FileEdit } from "lucide-react";
import { chatWithAI, getChatHistory } from "@/services/aiService";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AIChatProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, role: 'user' | 'assistant') => void;
  noteContent: string;
  noteId?: string;
  onBack: () => void;
  onAddToNote?: (content: string) => void;
}

const AIChat = ({ messages, onSendMessage, noteContent, noteId, onBack, onAddToNote }: AIChatProps) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
    setTimeout(() => inputRef.current?.focus(), 100);
    
    if (noteId && messages.length === 0) {
      const history = getChatHistory(noteId);
      if (history && history.length > 0) {
        history.forEach(msg => {
          onSendMessage(msg.content, msg.role);
        });
      }
    }
  }, [messages, noteId, onSendMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const enhanceResponseWithEmojis = (response: string): string => {
    if (!response) return response;
    
    const emojiMappings = [
      { keywords: ['résumé', 'synthèse', 'récapitulatif'], emoji: '📝' },
      { keywords: ['important', 'crucial', 'essentiel', 'vital'], emoji: '⚠️' },
      { keywords: ['remarque', 'note', 'attention'], emoji: '📌' },
      { keywords: ['exemple', 'illustration'], emoji: '💡' },
      { keywords: ['conseil', 'astuce', 'recommandation'], emoji: '✨' },
      { keywords: ['étape', 'phase', 'procédure'], emoji: '🔄' },
      { keywords: ['succès', 'réussite', 'accomplissement'], emoji: '🎯' },
      { keywords: ['point', 'élément'], emoji: '•' },
      { keywords: ['avantage', 'bénéfice', 'plus'], emoji: '✅' },
      { keywords: ['inconvénient', 'désavantage', 'moins'], emoji: '❌' },
      { keywords: ['information', 'info', 'donnée'], emoji: 'ℹ️' },
      { keywords: ['question', 'interrogation'], emoji: '❓' },
      { keywords: ['temps', 'durée', 'période'], emoji: '⏱️' },
      { keywords: ['argent', 'budget', 'coût', 'prix'], emoji: '💰' },
      { keywords: ['idée', 'concept'], emoji: '💭' },
      { keywords: ['problème', 'difficulté', 'obstacle'], emoji: '🚧' },
      { keywords: ['solution', 'résolution'], emoji: '🔑' }
    ];
    
    const enhanceTitles = (text: string): string => {
      return text.replace(/^(#+)\s+(.+)$/gm, (match, hashes, title) => {
        let emoji = '✨';
        
        for (const mapping of emojiMappings) {
          if (mapping.keywords.some(keyword => title.toLowerCase().includes(keyword))) {
            emoji = mapping.emoji;
            break;
          }
        }
        
        return `${hashes} ${emoji} ${title}`;
      });
    };
    
    const enhanceLists = (text: string): string => {
      return text.replace(/^([*-])\s+(.+)$/gm, (match, bullet, item) => {
        let emoji = '•';
        
        for (const mapping of emojiMappings) {
          if (mapping.keywords.some(keyword => item.toLowerCase().includes(keyword))) {
            emoji = mapping.emoji;
            break;
          }
        }
        
        return `${bullet} ${emoji} ${item}`;
      });
    };
    
    let enhancedResponse = enhanceTitles(response);
    enhancedResponse = enhanceLists(enhancedResponse);
    
    return enhancedResponse;
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
      
      const response = await chatWithAI(messageToSend, noteContent, noteId);
      console.log("Réponse reçue:", response);
      
      if (response) {
        const enhancedResponse = enhanceResponseWithEmojis(response);
        onSendMessage(enhancedResponse, 'assistant');
      } else {
        throw new Error("Réponse vide");
      }
    } catch (error) {
      console.error("Erreur de chat:", error);
      
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

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleAddLastResponseToNote = () => {
    const lastAssistantMessage = [...messages]
      .reverse()
      .find(msg => msg.role === 'assistant');
      
    if (lastAssistantMessage && onAddToNote) {
      onAddToNote(lastAssistantMessage.content);
      toast.success("Contenu ajouté à la note");
    } else {
      toast.error("Aucune réponse à ajouter");
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-card">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Retour à la note
        </Button>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          DeepNote Assistant
        </CardTitle>
        
        {onAddToNote && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddLastResponseToNote}
            disabled={!messages.some(msg => msg.role === 'assistant')}
            className="gap-1"
          >
            <FileEdit className="h-4 w-4" />
            <span className="hidden sm:inline">Ajouter à la note</span>
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-6 max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <Card className="border-dashed bg-muted/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Posez des questions sur votre note
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                <p className="mb-3">L'IA se basera sur le contenu de votre note pour répondre à vos questions.</p>
                <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto mt-4">
                  {[
                    "✨ Fais un résumé de cette note",
                    "📋 Quelles sont les étapes mentionnées ?",
                    "🔍 Quels sont les points importants ?",
                    "💡 Donne des idées complémentaires"
                  ].map((suggestion, i) => (
                    <Button 
                      key={i} 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => handleSendMessage(suggestion.substring(3))}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[85%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  } items-start gap-2`}
                >
                  <div className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${
                    message.role === "user" ? "bg-primary" : "bg-muted"
                  }`}>
                    {message.role === "user" ? 
                      <User className="h-4 w-4 text-primary-foreground" /> : 
                      <Bot className="h-4 w-4 text-foreground" />
                    }
                  </div>
                  <div className="flex flex-col">
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <div className="whitespace-pre-line">{message.content}</div>
                    </div>
                    <div 
                      className={`text-xs text-muted-foreground mt-1 ${
                        message.role === "user" ? "text-right mr-1" : "ml-1"
                      }`}
                    >
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-muted">
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
            <div className="flex justify-center my-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2" 
                onClick={handleRetry}
              >
                <RefreshCw className="h-3 w-3" />
                Réessayer
              </Button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-card">
        <div className="flex items-center space-x-2 max-w-3xl mx-auto">
          <Input
            ref={inputRef}
            placeholder="Posez une question sur cette note..."
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
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
