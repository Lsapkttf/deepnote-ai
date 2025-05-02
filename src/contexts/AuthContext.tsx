
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up the auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setUser(currentSession?.user ?? null);
        setSession(currentSession);
        setIsLoading(false);
        
        // Notifications for auth state changes
        if (event === 'SIGNED_IN') {
          toast.success("Connecté avec succès");
        } else if (event === 'SIGNED_OUT') {
          toast.info("Vous avez été déconnecté");
        }
      }
    );

    // Then check the current session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setUser(currentSession?.user ?? null);
      setSession(currentSession);
      setIsLoading(false);
    }).catch(error => {
      console.error("Erreur lors de la récupération de la session:", error);
      toast.error("Erreur de connexion");
      setIsLoading(false);
    });

    // Clean up subscription when component unmounts
    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
