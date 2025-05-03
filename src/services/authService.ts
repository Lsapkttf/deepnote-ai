
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  name?: string;
  avatar_url?: string;
}

// Messages d'erreur personnalisés
const ERROR_MESSAGES = {
  ALREADY_REGISTERED: "Cet email est déjà utilisé. Veuillez vous connecter.",
  INVALID_CREDENTIALS: "Email ou mot de passe incorrect.",
  WEAK_PASSWORD: "Le mot de passe doit contenir au moins 8 caractères, incluant un chiffre et un caractère spécial.",
  NETWORK_ERROR: "Problème de connexion au serveur. Vérifiez votre connexion internet.",
  GENERIC_ERROR: "Une erreur s'est produite. Veuillez réessayer plus tard.",
};

// Validation du mot de passe
const isPasswordStrong = (password: string): boolean => {
  const minLength = 8;
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && hasNumber && hasSpecialChar;
};

// Fonction pour s'inscrire avec email et mot de passe
export const signUp = async (email: string, password: string, name: string) => {
  try {
    // Validation des entrées
    if (!email || !password || !name) {
      toast.error("Tous les champs sont requis");
      throw new Error("Tous les champs sont requis");
    }
    
    // Validation du mot de passe
    if (!isPasswordStrong(password)) {
      toast.error(ERROR_MESSAGES.WEAK_PASSWORD);
      throw new Error(ERROR_MESSAGES.WEAK_PASSWORD);
    }
    
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
      toast.error(ERROR_MESSAGES.ALREADY_REGISTERED);
    } else if (error.message.includes("network")) {
      toast.error(ERROR_MESSAGES.NETWORK_ERROR);
    } else {
      // Si c'est une erreur personnalisée, on utilise directement le message
      if (Object.values(ERROR_MESSAGES).includes(error.message)) {
        toast.error(error.message);
      } else {
        toast.error(`Erreur d'inscription: ${error.message}`);
      }
    }
    throw error;
  }
};

// Fonction pour se connecter avec email et mot de passe
export const signIn = async (email: string, password: string) => {
  try {
    // Validation des entrées
    if (!email || !password) {
      toast.error("L'email et le mot de passe sont requis");
      throw new Error("L'email et le mot de passe sont requis");
    }

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
      toast.error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    } else if (error.message.includes("network")) {
      toast.error(ERROR_MESSAGES.NETWORK_ERROR);
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

// Fonction pour récupérer l'utilisateur courant avec gestion des erreurs
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Erreur lors de la récupération de la session:", error);
      return null;
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

// Fonction pour mettre à jour le profil utilisateur avec validation
export const updateUserProfile = async (updates: { name?: string; avatar_url?: string }) => {
  try {
    // Validation des entrées
    if (updates.name && updates.name.trim() === '') {
      toast.error("Le nom ne peut pas être vide");
      throw new Error("Le nom ne peut pas être vide");
    }

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
    // Validation de l'email
    if (!email) {
      toast.error("Veuillez fournir une adresse email");
      throw new Error("Email requis");
    }

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

// Fonction pour vérifier si l'utilisateur est connecté
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Erreur lors de la vérification de l'authentification:", error);
      return false;
    }
    
    return !!data.session;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'authentification:", error);
    return false;
  }
};
