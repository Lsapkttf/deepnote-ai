
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppSettings } from "@/types/note";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    language: "fr",
    notifications: true,
    autoSave: true,
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("appSettings");
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({
          ...settings,
          ...parsedSettings
        });
      } catch (error) {
        console.error("Error parsing settings:", error);
      }
    }
    
    // Initialize dark mode
    if (localStorage.getItem("darkMode") === "true") {
      document.documentElement.classList.add("dark");
      setSettings(prev => ({ ...prev, darkMode: true }));
    }
  }, []);

  const saveSettings = () => {
    // Save to localStorage
    localStorage.setItem("appSettings", JSON.stringify(settings));
    
    // Apply dark mode
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  };

  // Save when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      saveSettings();
    }
    onOpenChange(open);
  };

  // Toggle dark mode immediately for better UX
  const handleDarkModeChange = (checked: boolean) => {
    setSettings({ ...settings, darkMode: checked });
    
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Paramètres</DialogTitle>
          <DialogDescription>
            Personnalisez votre application DeepNote.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="flex flex-col gap-1">
              <span>Mode sombre</span>
              <span className="text-xs text-muted-foreground">
                Thème sombre pour l'application
              </span>
            </Label>
            <Switch
              id="dark-mode"
              checked={settings.darkMode}
              onCheckedChange={handleDarkModeChange}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications" className="flex flex-col gap-1">
              <span>Notifications</span>
              <span className="text-xs text-muted-foreground">
                Activer les notifications
              </span>
            </Label>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notifications: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-save" className="flex flex-col gap-1">
              <span>Sauvegarde automatique</span>
              <span className="text-xs text-muted-foreground">
                Enregistrer automatiquement les notes
              </span>
            </Label>
            <Switch
              id="auto-save"
              checked={settings.autoSave}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, autoSave: checked })
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label>Langue</Label>
            <RadioGroup
              value={settings.language}
              onValueChange={(value) =>
                setSettings({
                  ...settings,
                  language: value as "fr" | "en",
                })
              }
              className="flex"
            >
              <div className="flex items-center space-x-2 mr-4">
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
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
