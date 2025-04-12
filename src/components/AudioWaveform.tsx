
import { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  audioLevel: number;
  isRecording: boolean;
  color?: string;
  barCount?: number;
}

const AudioWaveform = ({ 
  audioLevel, 
  isRecording, 
  color = '#6d28d9', 
  barCount = 32 
}: AudioWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Fonction utilitaire pour vérifier si une couleur est valide
  const isValidColor = (color: string): boolean => {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ajuster la taille du canvas
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Garantir que la couleur est valide
    const safeColor = isValidColor(color) ? color : '#6d28d9';
    
    if (!isRecording) {
      // Dessiner une ligne ondulée au repos
      ctx.beginPath();
      const centerY = rect.height / 2;
      const amplitude = rect.height / 16;
      const frequency = 10;
      
      ctx.moveTo(0, centerY);
      for (let x = 0; x < rect.width; x++) {
        const y = centerY + Math.sin(x / frequency) * amplitude;
        ctx.lineTo(x, y);
      }
      
      // Créer un dégradé
      const gradient = ctx.createLinearGradient(0, 0, rect.width, 0);
      gradient.addColorStop(0, safeColor + '90');
      gradient.addColorStop(0.5, safeColor);
      gradient.addColorStop(1, safeColor + '90');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }
    
    // Dessiner la forme d'onde
    const barWidth = Math.max(1, rect.width / barCount - 1);
    const barSpacing = (rect.width - (barWidth * barCount)) / (barCount - 1);
    const maxBarHeight = rect.height * 0.8;
    const centerY = rect.height / 2;
    
    // Créer un dégradé vertical avec une couleur sécurisée
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
    
    // Utiliser rgba pour les dégradés au lieu d'ajouter des caractères à la chaîne
    try {
      gradient.addColorStop(0, safeColor);
      gradient.addColorStop(0.5, safeColor);
      gradient.addColorStop(1, safeColor);
    } catch (e) {
      // Fallback en cas d'erreur avec le dégradé
      console.error("Erreur de dégradé:", e);
      ctx.fillStyle = '#6d28d9';
    }
    
    // Animer selon le temps
    const now = Date.now() / 150;
    
    for (let i = 0; i < barCount; i++) {
      // Créer un effet dynamique basé sur les sinus
      const normalizedPosition = i / barCount;
      const offset = normalizedPosition * Math.PI * 2;
      
      // Calculer des facteurs dynamiques
      const waveFactor = Math.sin(now + offset * 2) * 0.4 + 0.6;
      const levelFactor = audioLevel / 100;
      
      // Calculer la courbe en cloche pour accentuer le centre
      const bellCurve = Math.sin(normalizedPosition * Math.PI);
      
      // Calculer la hauteur de la barre
      const barHeight = Math.max(
        2,
        maxBarHeight * levelFactor * waveFactor * bellCurve
      );
      
      const x = i * (barWidth + barSpacing);
      const y = centerY - barHeight / 2;
      
      // Dessiner avec un style arrondi
      ctx.beginPath();
      ctx.moveTo(x, y + barHeight);
      ctx.lineTo(x, y);
      ctx.lineTo(x + barWidth, y);
      ctx.lineTo(x + barWidth, y + barHeight);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Ajouter un effet de lueur si le niveau est élevé
      if (audioLevel > 60) {
        ctx.shadowColor = safeColor;
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    }
    
    // Réinitialiser les effets
    ctx.shadowBlur = 0;
    
  }, [audioLevel, isRecording, color, barCount]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-16 transition-opacity duration-300" 
      style={{ 
        opacity: isRecording ? 1 : 0.7
      }}
    />
  );
};

export default AudioWaveform;
