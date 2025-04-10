
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, Bot, Loader2, Plus, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";
import { chatWithAI } from "@/services/aiService";
import { ChatMessage } from "@/types/note";
import useNoteStore from "@/store/noteStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const AIAssistant = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addNote } = useNoteStore();

  useEffect(() => {
    scrollToBottom();
    // Focus sur l'input quand l'assistant s'ouvre
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    const messageToSend = input.trim();
    if (!messageToSend) return;
    
    setInput("");
    
    // Ajouter le message de l'utilisateur
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageToSend,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Utiliser une chaîne vide comme contexte pour le chat général
      const response = await chatWithAI(messageToSend, "", "general");
      
      // Ajouter la réponse de l'assistant
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Erreur de chat:", error);
      toast.error("Erreur lors de la communication avec l'IA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading && input.trim()) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateNote = async (content: string) => {
    try {
      await addNote("Note créée par l'IA", content, "text", "blue");
      toast.success("Note créée avec succès");
    } catch (error) {
      console.error("Erreur lors de la création de la note:", error);
      toast.error("Erreur lors de la création de la note");
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const WelcomeMessage = () => (
    <Card className="border-dashed bg-muted/40 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-lg">Assistant DeepNote</CardTitle>
        <CardDescription className="text-center">
          Je peux vous aider avec vos notes et répondre à vos questions
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center text-muted-foreground">
        <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto mt-2">
          {[
            "Crée une note sur les bonnes pratiques de productivité",
            "Comment organiser mes notes efficacement ?",
            "Rédige un résumé de réunion",
            "Génère une checklist pour un projet"
          ].map((suggestion, i) => (
            <Button 
              key={i} 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => {
                setInput(suggestion);
                inputRef.current?.focus();
              }}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full fixed right-6 bottom-6 shadow-md hover:shadow-lg z-50 bg-primary text-primary-foreground hover:bg-primary/90">
          <MessageSquare className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full">
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Assistant DeepNote
            </SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>
        
        <ScrollArea className="flex-1 px-4 py-4">
          {messages.length === 0 ? (
            <WelcomeMessage />
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
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
                        <MessageSquare className="h-4 w-4 text-primary-foreground" /> : 
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
                        
                        {message.role === "assistant" && (
                          <div className="mt-2 pt-2 border-t border-border/30 flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 text-xs"
                              onClick={() => handleCreateNote(message.content)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Créer une note
                            </Button>
                          </div>
                        )}
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
              ))}
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
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <Input
              ref={inputRef}
              placeholder="Posez une question ou demandez de l'aide..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
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
      </SheetContent>
    </Sheet>
  );
};

export default AIAssistant;
