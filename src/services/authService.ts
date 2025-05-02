
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  name?: string;
  avatar_url?: string;
}

// Fonction pour s'inscrire avec email et mot de passe
export const signUp = async (email: string, password: string, name: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      throw error;
    }

    toast.success("Inscription réussie ! Vérifiez votre email pour confirmer votre compte.");
    return data;
  } catch (error: any) {
    console.error("Erreur d'inscription:", error);
    
    if (error.message.includes("User already registered")) {
      toast.error("Cet email est déjà utilisé. Veuillez vous connecter.");
    } else {
      toast.error(`Erreur d'inscription: ${error.message}`);
    }
    throw error;
  }
};

// Fonction pour se connecter avec email et mot de passe
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    toast.success("Connexion réussie !");
    return data;
  } catch (error: any) {
    console.error("Erreur de connexion:", error);
    
    if (error.message.includes("Invalid login credentials")) {
      toast.error("Email ou mot de passe incorrect.");
    } else {
      toast.error(`Erreur de connexion: ${error.message}`);
    }
    throw error;
  }
};

// Fonction pour se déconnecter
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    toast.info("Vous avez été déconnecté.");
    return true;
  } catch (error: any) {
    console.error("Erreur de déconnexion:", error);
    toast.error(`Erreur de déconnexion: ${error.message}`);
    throw error;
  }
};

// Fonction pour récupérer l'utilisateur courant
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    if (!data.session) {
      return null;
    }
    
    return data.session.user;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return null;
  }
};

// Fonction pour mettre à jour le profil utilisateur
export const updateUserProfile = async (updates: { name?: string; avatar_url?: string }) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });

    if (error) {
      throw error;
    }

    toast.success("Profil mis à jour avec succès !");
    return data;
  } catch (error: any) {
    console.error("Erreur de mise à jour du profil:", error);
    toast.error(`Erreur: ${error.message}`);
    throw error;
  }
};

// Fonction pour réinitialiser le mot de passe
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });

    if (error) {
      throw error;
    }

    toast.success("Instructions de réinitialisation de mot de passe envoyées à votre email.");
    return true;
  } catch (error: any) {
    console.error("Erreur de réinitialisation de mot de passe:", error);
    toast.error(`Erreur: ${error.message}`);
    throw error;
  }
};
