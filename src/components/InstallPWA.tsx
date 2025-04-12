
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, X, Share2, Plus, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { checkIfPWAInstallable, isPWAInstalled } from "@/services/appStateService";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    // Vérifier si c'est un appareil iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOSDevice(isIOS);
    
    // Gestionnaire pour l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("Événement beforeinstallprompt intercepté");
      
      // Empêcher Chrome de montrer automatiquement le prompt d'installation
      e.preventDefault();
      
      // Stocker l'événement pour l'utiliser plus tard
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Montrer notre propre UI d'installation
      setShowInstallPrompt(true);
    };

    // Écouter l'événement d'installation
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Vérifier si l'app peut être installée
    const checkInstallable = () => {
      // Si nous n'avons pas d'événement différé, vérifions manuellement
      if (!deferredPrompt) {
        const installable = checkIfPWAInstallable();
        const alreadyInstalled = isPWAInstalled();
        
        console.log("Vérification manuelle d'installation:", { installable, alreadyInstalled });
        
        // Montrer le prompt uniquement si installable et pas déjà installé
        if (installable && !alreadyInstalled) {
          setShowInstallPrompt(true);
        } else {
          setShowInstallPrompt(false);
        }
      }
    };
    
    // Vérifier après un court délai
    const timeoutId = setTimeout(checkInstallable, 2000);
    
    // Nettoyer
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timeoutId);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    // Pour les navigateurs compatibles (Chrome, Edge, etc.)
    if (deferredPrompt) {
      try {
        // Montrer le prompt d'installation
        await deferredPrompt.prompt();
        
        // Attendre la réponse de l'utilisateur
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          toast.success("DeepNote a été installé avec succès!");
        } else {
          toast.info("Installation annulée");
        }
        
        // On ne peut utiliser le prompt qu'une fois
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      } catch (error) {
        console.error("Erreur lors de l'installation:", error);
        toast.error("Erreur lors de l'installation");
      }
    }
    // Pour Safari iOS (qui n'a pas d'API d'installation)
    else if (isIOSDevice) {
      toast.info("Pour installer DeepNote sur iOS:", { 
        duration: 10000,
        description: "Appuyez sur l'icône Partager, puis sur 'Ajouter à l'écran d'accueil'"
      });
    }
  };

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
    
    // Enregistrer la préférence pour ne pas redemander trop souvent
    localStorage.setItem('install_prompt_dismissed', new Date().toISOString());
  };

  // Ne rien afficher si le prompt ne doit pas être montré
  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-5 left-0 right-0 z-50 mx-auto max-w-md p-4 bg-card shadow-xl border rounded-lg animate-fade-in">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="font-semibold">Installer DeepNote</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isIOSDevice 
              ? "Installez l'application pour un accès rapide et hors ligne"
              : "Accédez à vos notes sans connexion internet et profitez d'une expérience optimale"}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={dismissPrompt}
          className="h-8 w-8 rounded-full -mt-1 -mr-1"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-3 flex justify-end space-x-2">
        {isIOSDevice ? (
          <Button 
            variant="default" 
            className="flex items-center" 
            onClick={handleInstallClick}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Comment installer
          </Button>
        ) : (
          <Button 
            variant="default" 
            className="flex items-center" 
            onClick={handleInstallClick}
          >
            <Download className="mr-2 h-4 w-4" />
            Installer l'application
          </Button>
        )}
      </div>
    </div>
  );
};

export default InstallPWA;
