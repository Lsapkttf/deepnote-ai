
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  className?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  className,
  searchQuery = '',
  onSearchChange = () => {}
}) => {
  return (
    <div className={`relative w-full max-w-sm ${className || ''}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Rechercher dans les notes..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 pr-9 w-full bg-background/80 backdrop-blur-sm border-muted"
      />
      {searchQuery && (
        <button
          onClick={() => onSearchChange("")}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
