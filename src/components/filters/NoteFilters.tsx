
import React from 'react';
import { Filter, LayoutGrid, LayoutList, Mic, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import FuturisticButton from '@/components/FuturisticButton';

interface NoteFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  handleNewTranscription: () => void;
  handleNewTextNote: () => void;
  isMobile: boolean;
}

const NoteFilters: React.FC<NoteFiltersProps> = ({
  selectedCategory,
  setSelectedCategory,
  viewMode,
  setViewMode,
  handleNewTranscription,
  handleNewTextNote,
  isMobile
}) => {
  if (isMobile) return null;

  return (
    <div className="flex flex-wrap gap-2 sm:flex-nowrap">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => setSelectedCategory("notes")}
          >
            Toutes les notes
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => setSelectedCategory("recent")}
          >
            Notes récentes
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => setSelectedCategory("archive")}
          >
            Archive
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <div className="flex border rounded-md overflow-hidden">
        <Button 
          variant={viewMode === "grid" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("grid")}
          className="rounded-none border-0"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button 
          variant={viewMode === "list" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("list")}
          className="rounded-none border-0"
        >
          <LayoutList className="h-4 w-4" />
        </Button>
      </div>
      
      <FuturisticButton 
        variant="outline" 
        size="sm"
        onClick={handleNewTranscription}
        className="h-9"
      >
        <Mic className="h-4 w-4 mr-2" />
        Transcription vocale
      </FuturisticButton>
      
      <FuturisticButton 
        size="sm"
        gradient
        glow
        onClick={handleNewTextNote}
        className="h-9"
      >
        <Plus className="h-4 w-4 mr-2" />
        Nouvelle note
      </FuturisticButton>
    </div>
  );
};

export default NoteFilters;
