
import { toast } from "sonner";

// Check if the application can be installed
export const checkIfPWAInstallable = (): boolean => {
  return !!(
    window.matchMedia('(display-mode: browser)').matches && 
    'BeforeInstallPromptEvent' in window
  );
};

// Save application state before closing
export const saveAppState = (state: any): void => {
  try {
    localStorage.setItem('app_state', JSON.stringify(state));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'état de l'application:", error);
  }
};

// Load application state on startup
export const loadAppState = (): any => {
  try {
    const state = localStorage.getItem('app_state');
    return state ? JSON.parse(state) : null;
  } catch (error) {
    console.error("Erreur lors du chargement de l'état de l'application:", error);
    return null;
  }
};

// Handle online/offline resources
export const handleOfflineMode = () => {
  window.addEventListener('online', () => {
    toast.success("Connexion rétablie");
    // Synchronize data
  });

  window.addEventListener('offline', () => {
    toast.warning("Mode hors ligne activé", {
      description: "Les modifications seront synchronisées lors de la reconnexion"
    });
  });
};

// Function to check if PWA is installed
export const isPWAInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         // The standalone property only exists on Safari iOS
         (window.navigator as any).standalone === true;
};

// Check for application updates
export const checkForUpdates = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.update();
    });
  }
};

// Prepare app for PWA installation
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
