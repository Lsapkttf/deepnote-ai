
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
import { setHuggingFaceApiKey, getHuggingFaceApiKey } from "@/services/aiService";
import { toast } from "@/components/ui/sonner";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApiKeyDialog = ({ open, onOpenChange }: ApiKeyDialogProps) => {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    // Charger la clé API existante si disponible
    const savedKey = getHuggingFaceApiKey();
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, [open]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error("La clé API ne peut pas être vide");
      return;
    }
    
    setHuggingFaceApiKey(apiKey.trim());
    toast.success("Clé API enregistrée avec succès");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurer l'API Hugging Face</DialogTitle>
          <DialogDescription>
            Entrez votre clé API Hugging Face pour utiliser les fonctionnalités d'IA.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Clé API Hugging Face</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="hf_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Vous pouvez obtenir une clé API gratuite sur <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline text-primary">huggingface.co</a>.</p>
            <p className="mt-1">Cette clé est stockée uniquement sur votre appareil.</p>
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

export default ApiKeyDialog;
