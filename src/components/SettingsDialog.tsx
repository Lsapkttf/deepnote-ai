
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { AppSettings } from "@/types/note";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: "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", // Clé Groq fixe
    darkMode: false,
    language: "fr"
  });

  useEffect(() => {
    // Charger les paramètres existants
    if (open) {
      const savedDarkMode = localStorage.getItem("darkMode") === "true";
      const savedLanguage = localStorage.getItem("language") as "fr" | "en" || "fr";
      
      setSettings({
        apiKey: "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", // Toujours utiliser la clé fixe
        darkMode: savedDarkMode,
        language: savedLanguage
      });
    }
  }, [open]);

  const handleSave = () => {
    // Sauvegarder les paramètres (sauf la clé API qui est fixe)
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
          
          <div className="space-y-1">
            <Label>Clé API Groq</Label>
            <p className="text-sm text-muted-foreground">
              La clé API Groq est configurée: {settings.apiKey.substring(0, 8)}...
            </p>
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
