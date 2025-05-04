
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Subscription from "./pages/Subscription";
import AIAssistant from "./components/AIAssistant";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Configuration du QueryClient avec gestion des erreurs
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      meta: {
        onError: (error: unknown) => {
          console.error("Query error:", error);
        }
      }
    },
    mutations: {
      retry: 1,
      meta: {
        onError: (error: unknown) => {
          console.error("Mutation error:", error);
        }
      }
    }
  }
});

// Location-aware component to conditionally render AIAssistant
const AIAssistantWrapper = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";
  
  if (isAuthPage) {
    return null;
  }
  
  return <AIAssistant />;
};

const App: React.FC = () => {
  useEffect(() => {
    // Set Gemini API key globally
    localStorage.setItem("geminiApiKey", "AIzaSyDEPP28PMCmQN1c8hR9JZd9-osYVkXpcLY");
    
    // Empêcher le zoom sur les dispositifs mobiles
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Mettre en place les gestionnaires d'événements
    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    
    // Initialiser le mode sombre si sauvegardé
    if (localStorage.getItem("darkMode") === "true") {
      document.documentElement.classList.add("dark");
    }
    
    // Nettoyage à la destruction du composant
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner position="top-right" />
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={
                    <ErrorBoundary fallback={
                      <div className="flex flex-col items-center justify-center h-screen">
                        <h1 className="text-xl mb-4">Impossible de charger la page principale</h1>
                        <button 
                          onClick={() => window.location.reload()}
                          className="bg-primary text-white px-4 py-2 rounded-md"
                        >
                          Réessayer
                        </button>
                      </div>
                    }>
                      <Index />
                    </ErrorBoundary>
                  } />
                  <Route path="/subscription" element={<Subscription />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
              <AIAssistantWrapper />
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
