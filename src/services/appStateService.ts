
import { toast } from "sonner";

// Vérifier si l'application peut être installée
export const checkIfPWAInstallable = (): boolean => {
  // Vérifier si nous sommes dans un navigateur et non déjà en mode standalone
  const isInBrowser = window.matchMedia('(display-mode: browser)').matches;
  
  // Vérifier si l'API d'installation est disponible
  const hasInstallPrompt = 'beforeinstallprompt' in window;
  
  // Vérifier si c'est Safari sur iOS (qui a sa propre méthode d'installation)
  const isSafariIOS = 
    /iP(ad|hone|od)/.test(navigator.userAgent) && 
    /WebKit/.test(navigator.userAgent) && 
    !/(CriOS|FxiOS|OPiOS|mercury)/.test(navigator.userAgent);
  
  // Vérifier si nous sommes sur un appareil mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  console.log("Installation PWA - État:", { 
    isInBrowser, 
    hasInstallPrompt, 
    isSafariIOS, 
    isMobile,
    userAgent: navigator.userAgent
  });
  
  // L'application peut être installée si:
  // 1. Nous sommes dans un navigateur (pas déjà installé)
  // 2. Et soit l'API d'installation est disponible, soit c'est Safari sur iOS
  return (isInBrowser && (hasInstallPrompt || (isSafariIOS && isMobile)));
};

// Sauvegarder l'état de l'application avant la fermeture
export const saveAppState = (state: any): void => {
  try {
    localStorage.setItem('app_state', JSON.stringify(state));
    console.log("État de l'application sauvegardé");
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'état de l'application:", error);
  }
};

// Charger l'état de l'application au démarrage
export const loadAppState = (): any => {
  try {
    const state = localStorage.getItem('app_state');
    if (state) {
      console.log("État de l'application chargé");
      return JSON.parse(state);
    }
    return null;
  } catch (error) {
    console.error("Erreur lors du chargement de l'état de l'application:", error);
    return null;
  }
};

// Gérer le mode hors ligne
export const handleOfflineMode = () => {
  const updateOnlineStatus = () => {
    const isOnline = navigator.onLine;
    document.body.classList.toggle('offline', !isOnline);
    
    if (isOnline) {
      toast.success("Connexion rétablie", {
        description: "Synchronisation des données en cours..."
      });
      // Déclencher une synchronisation
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
          // Vérifier si sync est disponible sur ce navigateur
          if ('sync' in registration) {
            (registration as any).sync.register('sync-notes').catch((err: Error) => {
              console.error("Erreur lors de l'enregistrement de la synchronisation:", err);
            });
          } else {
            console.log("L'API de synchronisation n'est pas disponible dans ce navigateur");
          }
        });
      }
    } else {
      toast.warning("Mode hors ligne activé", {
        description: "Les modifications seront synchronisées lors de la reconnexion"
      });
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Initialiser l'état
  updateOnlineStatus();
};

// Vérifier si l'application est installée
export const isPWAInstalled = (): boolean => {
  // Vérifier le mode d'affichage (standalone = PWA installée)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Vérifier la propriété standalone de Safari (iOS uniquement)
  const isSafariStandalone = ((window.navigator as any).standalone === true);
  
  // Vérifier si lancé depuis une app Android
  const isAndroidApp = document.referrer.includes('android-app://');
  
  console.log("État PWA:", { isStandalone, isSafariStandalone, isAndroidApp });
  
  return isStandalone || isSafariStandalone || isAndroidApp;
};

// Vérifier les mises à jour de l'application
export const checkForUpdates = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      // Vérifier les mises à jour
      registration.update().catch(err => {
        console.error("Erreur lors de la vérification des mises à jour:", err);
      });
      
      // Écouter les messages du service worker
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          toast.info("Mise à jour disponible", {
            description: "Redémarrez l'application pour appliquer la mise à jour",
            action: {
              label: "Redémarrer",
              onClick: () => window.location.reload()
            },
            duration: 10000
          });
        }
      });
    });
  }
};

// Préparer l'application pour l'installation PWA
export const preparePWAInstallation = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker enregistré avec succès. Portée:', registration.scope);
          
          // Vérifier les mises à jour périodiquement
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Vérifier toutes les heures
        })
        .catch(err => {
          console.error('Erreur d\'enregistrement du ServiceWorker:', err);
        });
    });
  }
  
  // Ajouter un event listener pour le beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    // Empêcher Chrome d'afficher automatiquement la boîte de dialogue
    e.preventDefault();
    
    // Stocker l'événement pour l'utiliser plus tard
    (window as any).deferredPrompt = e;
    
    // Informer l'utilisateur que l'application peut être installée
    console.log("L'application peut être installée", e);
    toast.info("💡 DeepNote peut être installée sur votre appareil", {
      description: "Pour une meilleure expérience, installez l'application",
      duration: 8000
    });
  });
  
  // Détecter quand l'application est installée
  window.addEventListener('appinstalled', () => {
    // Effacer le prompt différé
    (window as any).deferredPrompt = null;
    
    // Enregistrer que l'application a été installée
    localStorage.setItem('pwa_installed', 'true');
    
    toast.success("🎉 DeepNote a été installée avec succès!");
    console.log("PWA installée avec succès");
  });
};
