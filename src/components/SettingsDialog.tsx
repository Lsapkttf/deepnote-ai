
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Settings, Moon, SunMedium, Globe, Key } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("general");

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
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres DeepNote
          </DialogTitle>
          <DialogDescription>
            Personnalisez DeepNote selon vos préférences
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="general" className="flex items-center gap-1">
              <SunMedium className="h-4 w-4" />
              <span>Général</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-1">
              <Key className="h-4 w-4" />
              <span>API</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="darkMode" className="font-medium">Mode sombre</Label>
                <p className="text-sm text-muted-foreground">Activer le thème sombre pour l'interface</p>
              </div>
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
                className="mt-2"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="fr" id="fr" />
                  <Label htmlFor="fr" className="flex items-center gap-2">
                    <span className="inline-block w-5 h-5 rounded-full overflow-hidden">
                      🇫🇷
                    </span>
                    Français
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="en" id="en" />
                  <Label htmlFor="en" className="flex items-center gap-2">
                    <span className="inline-block w-5 h-5 rounded-full overflow-hidden">
                      🇬🇧
                    </span>
                    English
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>
          
          <TabsContent value="api" className="space-y-6 py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="font-medium">Clé API Groq</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                La clé API Groq est configurée avec le modèle Llama 3.
              </p>
              <div className="p-3 bg-muted rounded-md text-sm font-mono overflow-x-auto">
                {settings.apiKey.substring(0, 12)}...{settings.apiKey.substring(settings.apiKey.length - 4)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Cette clé est utilisée pour les fonctionnalités d'analyse IA et de transcription vocale.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSave} className="gap-1">
            <Save className="h-4 w-4" />
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
