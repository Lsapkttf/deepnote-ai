
import { toast } from "sonner";

// Vérifier si l'application peut être installée
export const checkIfPWAInstallable = (): boolean => {
  return !!(
    window.matchMedia('(display-mode: browser)').matches && 
    'BeforeInstallPromptEvent' in window
  );
};

// Sauvegarder l'état de l'application avant la fermeture
export const saveAppState = (state: any): void => {
  try {
    localStorage.setItem('app_state', JSON.stringify(state));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'état de l'application:", error);
  }
};

// Récupérer l'état de l'application au démarrage
export const loadAppState = (): any => {
  try {
    const state = localStorage.getItem('app_state');
    return state ? JSON.parse(state) : null;
  } catch (error) {
    console.error("Erreur lors du chargement de l'état de l'application:", error);
    return null;
  }
};

// Gérer les ressources en ligne/hors ligne
export const handleOfflineMode = () => {
  window.addEventListener('online', () => {
    toast.success("Connexion rétablie");
    // Synchroniser les données
  });

  window.addEventListener('offline', () => {
    toast.warning("Mode hors ligne activé", {
      description: "Les modifications seront synchronisées lors de la reconnexion"
    });
  });
};

// Fonction pour vérifier si la PWA est installée
export const isPWAInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
};

// Vérifier les mises à jour de l'application
export const checkForUpdates = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.update();
    });
  }
};

// Préparer l'appli pour l'installation PWA
export const preparePWAInstallation = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(err => {
          console.error('ServiceWorker registration failed: ', err);
        });
    });
  }
};
