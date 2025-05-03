
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

const queryClient = new QueryClient();

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
    // Set Gemini API key globally (instead of asking users)
    localStorage.setItem("geminiApiKey", "AIzaSyAdOinCnHfqjOyk6XBbTzQkR_IOdRvlliU");
    
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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Index />} />
                <Route path="/subscription" element={<Subscription />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AIAssistantWrapper />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
