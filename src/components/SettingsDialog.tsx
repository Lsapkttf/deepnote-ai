
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { setHuggingFaceApiKey, getHuggingFaceApiKey } from "@/services/aiService";
import { toast } from "sonner";
import { AppSettings } from "@/types/note";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: "",
    darkMode: false,
    language: "fr"
  });

  // Clé API par défaut
  const defaultKey = "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";

  useEffect(() => {
    // Charger les paramètres existants
    if (open) {
      const savedApiKey = getHuggingFaceApiKey();
      const savedDarkMode = localStorage.getItem("darkMode") === "true";
      const savedLanguage = localStorage.getItem("language") as "fr" | "en" || "fr";
      
      setSettings({
        apiKey: savedApiKey,
        darkMode: savedDarkMode,
        language: savedLanguage
      });
    }
  }, [open]);

  const handleSave = () => {
    // Sauvegarder tous les paramètres
    if (settings.apiKey && settings.apiKey.trim() !== "") {
      setHuggingFaceApiKey(settings.apiKey.trim());
    } else {
      // Si la clé est vide, utiliser la clé par défaut
      setHuggingFaceApiKey(defaultKey);
      setSettings(prev => ({ ...prev, apiKey: defaultKey }));
    }
    
    localStorage.setItem("darkMode", settings.darkMode.toString());
    localStorage.setItem("language", settings.language);
    
    // Appliquer le dark mode si nécessaire
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    toast.success("Paramètres enregistrés avec succès");
    onOpenChange(false);
  };

  const handleReset = () => {
    // Réinitialiser à la clé par défaut
    setSettings(prev => ({ ...prev, apiKey: defaultKey }));
    toast.info("Clé API réinitialisée à la valeur par défaut");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Paramètres de l'application</DialogTitle>
          <DialogDescription>
            Personnalisez VoxNote selon vos préférences
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="apiKey">Clé API Hugging Face</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReset} 
                className="text-xs"
              >
                Réinitialiser
              </Button>
            </div>
            <Input
              id="apiKey"
              type="password"
              placeholder="hf_..."
              value={settings.apiKey}
              onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
            />
            <p className="text-xs text-muted-foreground">
              Nécessaire pour les fonctionnalités d'IA. Obtenez une clé sur <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline text-primary">huggingface.co</a>
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="darkMode">Mode sombre</Label>
            <Switch 
              id="darkMode" 
              checked={settings.darkMode}
              onCheckedChange={(checked) => setSettings({...settings, darkMode: checked})}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Langue</Label>
            <RadioGroup 
              value={settings.language} 
              onValueChange={(value) => setSettings({...settings, language: value as "fr" | "en"})}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fr" id="fr" />
                <Label htmlFor="fr">Français</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="en" id="en" />
                <Label htmlFor="en">English</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
