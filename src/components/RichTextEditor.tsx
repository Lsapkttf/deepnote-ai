
import React, { useRef, useState, useEffect } from "react";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3, ListOrdered, List, Image, Link, Type, Trash } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  onSave?: () => void;
  alwaysRich?: boolean;
}

// Font size options
const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36];

// Color options for text and background
const TEXT_COLORS = [
  { name: "Noir", value: "text-black dark:text-white", colorClass: "bg-black dark:bg-white" },
  { name: "Rouge", value: "text-red-500", colorClass: "bg-red-500" },
  { name: "Vert", value: "text-green-500", colorClass: "bg-green-500" },
  { name: "Bleu", value: "text-blue-500", colorClass: "bg-blue-500" },
  { name: "Violet", value: "text-purple-500", colorClass: "bg-purple-500" },
  { name: "Orange", value: "text-orange-500", colorClass: "bg-orange-500" },
];

const BG_COLORS = [
  { name: "Transparent", value: "bg-transparent", colorClass: "border border-gray-300 dark:border-gray-700 bg-transparent" },
  { name: "Gris clair", value: "bg-gray-100 dark:bg-gray-800", colorClass: "bg-gray-100 dark:bg-gray-800" },
  { name: "Jaune pâle", value: "bg-yellow-100 dark:bg-yellow-900", colorClass: "bg-yellow-100 dark:bg-yellow-900" },
  { name: "Vert pâle", value: "bg-green-100 dark:bg-green-900", colorClass: "bg-green-100 dark:bg-green-900" },
  { name: "Bleu pâle", value: "bg-blue-100 dark:bg-blue-900", colorClass: "bg-blue-100 dark:bg-blue-900" },
  { name: "Rouge pâle", value: "bg-red-100 dark:bg-red-900", colorClass: "bg-red-100 dark:bg-red-900" },
];

const RichTextEditor = ({ 
  value, 
  onChange, 
  className, 
  placeholder = "Note",
  onSave,
  alwaysRich = false
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState<number>(16);
  const [selectedTextColor, setSelectedTextColor] = useState<string>(TEXT_COLORS[0].value);
  const [selectedBgColor, setSelectedBgColor] = useState<string>(BG_COLORS[0].value);
  
  // Handle keyboard shortcut to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (onSave) onSave();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSave]);
  
  // Ensure editor gets correct initial content and cursor position
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value, editorRef.current]);
  
  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    updateContent();
    editorRef.current?.focus();
  };
  
  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };
  
  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    document.execCommand('fontSize', false, '7');
    const fontElements = document.querySelectorAll('font[size="7"]');
    fontElements.forEach((el) => {
      el.removeAttribute('size');
      (el as HTMLElement).style.fontSize = `${size}px`;
    });
    updateContent();
  };
  
  const handleTextColorChange = (color: string) => {
    setSelectedTextColor(color);
    document.execCommand('styleWithCSS', false, 'true');
    
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.className = color;
      
      try {
        range.surroundContents(span);
        selection.removeAllRanges();
        selection.addRange(range);
        updateContent();
      } catch (e) {
        console.error("Couldn't apply text color", e);
        // Fallback for complex selections
        document.execCommand('foreColor', false, getComputedStyle(document.createElement(`span`)).color);
      }
    }
  };
  
  const handleBgColorChange = (color: string) => {
    setSelectedBgColor(color);
    document.execCommand('styleWithCSS', false, 'true');
    
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.className = color;
      
      try {
        range.surroundContents(span);
        selection.removeAllRanges();
        selection.addRange(range);
        updateContent();
      } catch (e) {
        console.error("Couldn't apply background color", e);
        // Fallback for complex selections
        document.execCommand('hiliteColor', false, getComputedStyle(document.createElement(`span`)).backgroundColor);
      }
    }
  };

  const clearFormatting = () => {
    document.execCommand('removeFormat', false);
    updateContent();
    editorRef.current?.focus();
  };

  return (
    <div className={cn("flex flex-col border rounded-lg overflow-hidden", className)}>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30 overflow-x-auto">
        <ToggleGroup type="multiple" className="flex flex-wrap">
          <ToggleGroupItem value="bold" aria-label="Gras" title="Gras" onClick={() => execCommand('bold')}>
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italique" title="Italique" onClick={() => execCommand('italic')}>
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Souligné" title="Souligné" onClick={() => execCommand('underline')}>
            <Underline className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        
        <div className="h-6 w-px bg-border mx-1" />
        
        <ToggleGroup type="single" className="flex flex-wrap">
          <ToggleGroupItem value="left" aria-label="Aligner à gauche" title="Aligner à gauche" onClick={() => execCommand('justifyLeft')}>
            <AlignLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Centrer" title="Centrer" onClick={() => execCommand('justifyCenter')}>
            <AlignCenter className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Aligner à droite" title="Aligner à droite" onClick={() => execCommand('justifyRight')}>
            <AlignRight className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        
        <div className="h-6 w-px bg-border mx-1" />
        
        <ToggleGroup type="single" className="flex flex-wrap">
          <ToggleGroupItem value="h1" aria-label="Titre 1" title="Titre 1" onClick={() => execCommand('formatBlock', 'h1')}>
            <Heading1 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="h2" aria-label="Titre 2" title="Titre 2" onClick={() => execCommand('formatBlock', 'h2')}>
            <Heading2 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="h3" aria-label="Titre 3" title="Titre 3" onClick={() => execCommand('formatBlock', 'h3')}>
            <Heading3 className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        
        <div className="h-6 w-px bg-border mx-1" />
        
        <ToggleGroup type="single" className="flex flex-wrap">
          <ToggleGroupItem value="ul" aria-label="Liste à puces" title="Liste à puces" onClick={() => execCommand('insertUnorderedList')}>
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="ol" aria-label="Liste numérotée" title="Liste numérotée" onClick={() => execCommand('insertOrderedList')}>
            <ListOrdered className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        
        <div className="h-6 w-px bg-border mx-1" />
        
        {/* Font size control */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 flex items-center">
              <Type className="h-4 w-4" />
              <span className="text-xs">{fontSize}px</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="space-y-4">
              <div className="text-sm font-medium">Taille du texte</div>
              <Slider
                value={[fontSize]}
                min={FONT_SIZES[0]}
                max={FONT_SIZES[FONT_SIZES.length - 1]}
                step={1}
                onValueChange={(value) => handleFontSizeChange(value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{FONT_SIZES[0]}px</span>
                <span>{FONT_SIZES[FONT_SIZES.length - 1]}px</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Text color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 flex items-center">
              <div className={cn("h-4 w-4 rounded-full border border-border", 
                TEXT_COLORS.find(c => c.value === selectedTextColor)?.colorClass || "bg-black dark:bg-white")} />
              <span className="text-xs">Couleur</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="space-y-2">
              <div className="text-sm font-medium">Couleur du texte</div>
              <div className="grid grid-cols-3 gap-1">
                {TEXT_COLORS.map((color) => (
                  <Button 
                    key={color.value}
                    variant="outline" 
                    size="sm"
                    className={cn("h-8 p-0 w-full relative", selectedTextColor === color.value && "ring-2 ring-primary")}
                    onClick={() => handleTextColorChange(color.value)}
                  >
                    <span className={cn("w-full h-full flex items-center justify-center", color.value)}>
                      {color.name}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Background color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 flex items-center">
              <div className={cn("h-4 w-4 rounded-full border border-border", 
                BG_COLORS.find(c => c.value === selectedBgColor)?.colorClass || "bg-transparent")} />
              <span className="text-xs">Fond</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="space-y-2">
              <div className="text-sm font-medium">Couleur d'arrière-plan</div>
              <div className="grid grid-cols-3 gap-1">
                {BG_COLORS.map((color) => (
                  <Button 
                    key={color.value}
                    variant="outline" 
                    size="sm"
                    className={cn("h-8 p-0 w-full relative", selectedBgColor === color.value && "ring-2 ring-primary")}
                    onClick={() => handleBgColorChange(color.value)}
                  >
                    <span className={cn("w-full h-full flex items-center justify-center", color.value)}>
                      {color.name}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear formatting button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 ml-auto"
          onClick={clearFormatting}
          title="Effacer le formatage"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      
      <div
        ref={editorRef}
        className="flex-1 p-3 focus:outline-none min-h-[200px] max-h-[600px] overflow-auto text-black dark:text-white"
        contentEditable
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={updateContent}
        onBlur={updateContent}
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
