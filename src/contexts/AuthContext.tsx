
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Définir l'écouteur d'événements de changement d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Mise à jour des notes de l'utilisateur lors d'un changement de session
        if (event === 'SIGNED_IN') {
          toast.success("Connecté avec succès");
        } else if (event === 'SIGNED_OUT') {
          toast.info("Vous avez été déconnecté");
        }
      }
    );

    // Vérifier la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    }).catch(error => {
      console.error("Erreur lors de la récupération de la session:", error);
      toast.error("Erreur de connexion");
      setIsLoading(false);
    });

    // Nettoyer l'écouteur lors du démontage
    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
