
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
  barCount = 24 
}: AudioWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Adjust canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    if (!isRecording) {
      // Draw a wavy line when at rest
      ctx.beginPath();
      const centerY = rect.height / 2;
      const amplitude = rect.height / 12;
      const frequency = 8;
      
      ctx.moveTo(0, centerY);
      for (let x = 0; x < rect.width; x++) {
        const y = centerY + Math.sin(x / frequency) * amplitude;
        ctx.lineTo(x, y);
      }
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }
    
    // Draw waveform
    const barWidth = Math.max(2, rect.width / barCount - 2);
    const barSpacing = (rect.width - (barWidth * barCount)) / (barCount - 1);
    const maxBarHeight = rect.height * 0.9;
    const centerY = rect.height / 2;
    
    for (let i = 0; i < barCount; i++) {
      // Create a more dynamic effect based on sin
      const now = Date.now() / 200;
      const normalizedPosition = i / barCount;
      const offset = normalizedPosition * Math.PI;
      
      const dynamicFactor = 0.6 + (Math.sin(now + offset * 4) * 0.4);
      const levelFactor = audioLevel / 100;
      const sizeFactor = Math.min(1, 0.2 + (normalizedPosition < 0.5 
        ? normalizedPosition * 2 
        : (1 - normalizedPosition) * 2));
      
      // Calculate bar height
      const barHeight = Math.max(
        4,
        maxBarHeight * levelFactor * dynamicFactor * sizeFactor
      );
      
      const x = i * (barWidth + barSpacing);
      const y = centerY - barHeight / 2;
      
      // Use a gradient for more visual appeal
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color + '80'); // Semi-transparent color at bottom
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }, [audioLevel, isRecording, color, barCount]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-16 transition-opacity duration-200" 
      style={{ 
        opacity: isRecording ? 1 : 0.6 
      }}
    />
  );
};

export default AudioWaveform;
