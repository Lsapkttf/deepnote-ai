
import { useState, useEffect } from "react";
import Login from "@/components/Auth/Login";
import Register from "@/components/Auth/Register";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger vers la page d'accueil si déjà authentifié
    if (isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Ne rien afficher pendant le chargement pour éviter un flash d'interface
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container mx-auto flex flex-col items-center justify-center flex-1 p-4 md:p-8">
        <div className="w-full max-w-md mb-8 flex flex-col items-center">
          <Logo />
          <h1 className="text-2xl font-bold mt-4">DeepNote</h1>
          <p className="text-muted-foreground text-sm">Notes & Transcription avec IA</p>
        </div>
        
        {mode === "login" ? (
          <Login onSwitchToRegister={() => setMode("register")} />
        ) : (
          <Register onSwitchToLogin={() => setMode("login")} />
        )}
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>En vous connectant, vous acceptez nos conditions d'utilisation</p>
          <p className="mt-1">et notre politique de confidentialité.</p>
        </div>
      </div>
      
      <footer className="py-4 text-center text-xs text-muted-foreground bg-background border-t">
        <p>&copy; 2025 DeepNote App. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default Auth;
