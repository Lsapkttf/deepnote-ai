
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
import { Save, Settings, Moon, SunMedium, Shield, UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    language: "fr",
    notifications: true,
    autoSave: true
  });
  const [activeTab, setActiveTab] = useState("general");
  const { user } = useAuth();

  useEffect(() => {
    // Charger les paramètres existants
    if (open) {
      const savedDarkMode = localStorage.getItem("darkMode") === "true";
      const savedLanguage = localStorage.getItem("language") as "fr" | "en" || "fr";
      const savedNotifications = localStorage.getItem("notifications") !== "false";
      const savedAutoSave = localStorage.getItem("autoSave") !== "false";
      
      setSettings({
        darkMode: savedDarkMode,
        language: savedLanguage,
        notifications: savedNotifications,
        autoSave: savedAutoSave
      });
    }
  }, [open]);

  const handleSave = () => {
    // Sauvegarder les paramètres
    localStorage.setItem("darkMode", settings.darkMode.toString());
    localStorage.setItem("language", settings.language);
    localStorage.setItem("notifications", settings.notifications.toString());
    localStorage.setItem("autoSave", settings.autoSave.toString());
    
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
            <TabsTrigger value="account" className="flex items-center gap-1">
              <UserCircle className="h-4 w-4" />
              <span>Compte</span>
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
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoSave" className="font-medium">Sauvegarde automatique</Label>
                <p className="text-sm text-muted-foreground">Enregistrer automatiquement les notes en cours d'édition</p>
              </div>
              <Switch 
                id="autoSave" 
                checked={settings.autoSave}
                onCheckedChange={(checked) => setSettings({...settings, autoSave: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications" className="font-medium">Notifications</Label>
                <p className="text-sm text-muted-foreground">Activer les notifications de l'application</p>
              </div>
              <Switch 
                id="notifications" 
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettings({...settings, notifications: checked})}
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

          <TabsContent value="account" className="space-y-6 py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <Label className="font-medium">Informations du compte</Label>
              </div>
              
              {user ? (
                <>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    
                    {user.user_metadata?.name && (
                      <>
                        <p className="text-sm font-medium mt-2">Nom</p>
                        <p className="text-sm text-muted-foreground">{user.user_metadata.name}</p>
                      </>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-4">
                      Compte créé le {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Connectez-vous pour voir les informations de votre compte.
                </p>
              )}
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
