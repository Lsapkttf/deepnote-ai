
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Empêcher Chrome de montrer automatiquement le prompt d'installation
      e.preventDefault();
      
      // Stocker l'événement pour l'utiliser plus tard
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Montrer notre propre UI d'installation
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Vérifier si l'app est déjà installée
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone || 
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setShowInstallPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Montrer le prompt d'installation
    deferredPrompt.prompt();

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
  };

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-5 left-0 right-0 z-50 mx-auto max-w-md p-4 bg-card shadow-xl border rounded-lg animate-fade-in">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="font-semibold">Installer DeepNote</h3>
          <p className="text-sm text-muted-foreground mt-1">Accédez à vos notes sans connexion internet et profitez d'une expérience optimale</p>
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
        <Button 
          variant="default" 
          className="flex items-center" 
          onClick={handleInstallClick}
        >
          <Download className="mr-2 h-4 w-4" />
          Installer
        </Button>
      </div>
    </div>
  );
};

export default InstallPWA;
