import React, { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Trash, Archive, Pin, MessageCircle, PenSquare, MoreVertical, X } from 'lucide-react';
import { Note, NoteColor } from '@/types/note';
import { useIsMobile } from '@/hooks/use-mobile';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
  note: Note | null;
  onSave: (title: string, content: string, color: NoteColor) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Note>) => Promise<void>;
  onBack: () => void;
  aiAnalysis: string | null;
  setAIAnalysis: (analysis: string | null) => void;
  onStartChat: () => void;
}

const colorOptions: { value: NoteColor; label: string; bg: string }[] = [
  { value: 'yellow', label: 'Défaut', bg: 'bg-note-yellow/0 dark:bg-transparent border' },
  { value: 'red', label: 'Rouge', bg: 'bg-note-red dark:bg-red-950' },
  { value: 'yellow', label: 'Jaune', bg: 'bg-note-yellow dark:bg-yellow-950' },
  { value: 'green', label: 'Vert', bg: 'bg-note-green dark:bg-green-950' },
  { value: 'blue', label: 'Bleu', bg: 'bg-note-blue dark:bg-blue-950' },
  { value: 'purple', label: 'Violet', bg: 'bg-note-purple dark:bg-purple-950' },
  { value: 'orange', label: 'Orange', bg: 'bg-note-orange dark:bg-orange-950' }
];

const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onUpdate,
  onBack,
  aiAnalysis,
  setAIAnalysis,
  onStartChat
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [color, setColor] = useState<NoteColor>(note?.color || 'yellow');
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setColor(note.color || 'yellow');
    } else {
      setTitle('');
      setContent('');
      setColor('yellow');
    }
  }, [note]);

  const handleSave = async () => {
    if (note?.id) {
      await onUpdate(note.id, { title, content, color });
    } else {
      await onSave(title, content, color);
    }
  };

  const handleTogglePin = async () => {
    if (note?.id) {
      await onUpdate(note.id, { pinned: !note.pinned });
    }
  };

  const handleArchiveNote = async () => {
    if (note?.id) {
      await onUpdate(note.id, { archived: true });
      onBack();
    }
  };
  
  const toggleColorPicker = () => {
    setShowColorPicker(!showColorPicker);
  };

  return (
    <div className={cn(
      "flex flex-col h-full",
      color === 'yellow' && 'bg-note-yellow dark:bg-yellow-950/30',
      color === 'red' && 'bg-note-red dark:bg-red-950/30',
      color === 'green' && 'bg-note-green dark:bg-green-950/30',
      color === 'blue' && 'bg-note-blue dark:bg-blue-950/30',
      color === 'purple' && 'bg-note-purple dark:bg-purple-950/30',
      color === 'orange' && 'bg-note-orange dark:bg-orange-950/30',
    )}>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-2 border-b bg-background/70 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          {!isMobile && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSave}
              className="h-9"
            >
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {!isMobile && note && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onStartChat}
              className="h-9 w-9"
              title="Discuter avec l'IA"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          )}
          
          <Button 
            variant={note?.pinned ? "secondary" : "ghost"}
            size="icon" 
            onClick={handleTogglePin}
            className="h-9 w-9"
            disabled={!note?.id}
          >
            <Pin className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleColorPicker}
            className="h-9 w-9"
          >
            <span className="h-4 w-4 rounded-full border flex items-center justify-center overflow-hidden">
              <span className={cn(
                "h-3 w-3 rounded-full",
                color === 'yellow' && 'bg-note-yellow',
                color === 'red' && 'bg-note-red',
                color === 'green' && 'bg-note-green',
                color === 'blue' && 'bg-note-blue',
                color === 'purple' && 'bg-note-purple',
                color === 'orange' && 'bg-note-orange',
              )}></span>
            </span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={handleArchiveNote}
                disabled={!note?.id}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archiver
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!note?.id}
                onClick={onStartChat}
                className="md:hidden"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Analyser avec l'IA
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Color Picker */}
      {showColorPicker && (
        <div className="p-4 border-b bg-background/70 backdrop-blur-sm">
          <h3 className="font-medium mb-3">Couleur</h3>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setColor(option.value);
                  setShowColorPicker(false);
                }}
                className={`h-10 w-10 rounded-full flex items-center justify-center ${option.bg} border ${
                  color === option.value ? 'ring-2 ring-primary' : ''
                }`}
                title={option.label}
              >
                {color === option.value && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Note Content */}
      <div className="flex-1 overflow-auto p-4">
        <Input
          type="text"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 mb-4"
        />
        
        <RichTextEditor 
          value={content} 
          onChange={setContent} 
          className="min-h-[300px]"
          alwaysRich={true}
        />
      </div>

      {/* Mobile Bottom Actions */}
      {isMobile && (
        <div className="sticky bottom-0 p-2 border-t bg-background/70 backdrop-blur-sm">
          <Button 
            onClick={handleSave} 
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      )}
    </div>
  );
};

const Check = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default NoteEditor;
