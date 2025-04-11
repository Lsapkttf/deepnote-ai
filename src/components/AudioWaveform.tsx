
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
  color = 'hsl(var(--primary))', 
  barCount = 12 
}: AudioWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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
    
    if (!isRecording) {
      // Dessiner une ligne plate lorsque l'enregistrement est arrêté
      ctx.beginPath();
      ctx.moveTo(0, rect.height / 2);
      ctx.lineTo(rect.width, rect.height / 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();
      return;
    }
    
    // Dessiner la forme d'onde
    const barWidth = Math.max(2, rect.width / barCount - 2);
    const barSpacing = (rect.width - (barWidth * barCount)) / (barCount - 1);
    
    for (let i = 0; i < barCount; i++) {
      // Calculer la hauteur en fonction du niveau audio et d'une petite randomisation
      const randomFactor = Math.sin((Date.now() / 200) + i * 0.5) * 0.2 + 0.8;
      const barHeight = Math.max(
        2,
        Math.min(rect.height * 0.8, (audioLevel / 100) * rect.height * randomFactor)
      );
      
      const x = i * (barWidth + barSpacing);
      const y = (rect.height - barHeight) / 2;
      
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }, [audioLevel, isRecording, color, barCount]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-12 transition-opacity duration-200" 
      style={{ 
        opacity: isRecording ? 1 : 0.5 
      }}
    />
  );
};

export default AudioWaveform;
