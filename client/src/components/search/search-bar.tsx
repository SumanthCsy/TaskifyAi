import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface SearchBarProps {
  initialQuery?: string;
  isLoading?: boolean;
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  initialQuery = "",
  isLoading = false,
  onSearch,
  placeholder = "Search for any topic...",
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [_, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim());
      } else {
        setLocation(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full ${className}`}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex w-full max-w-3xl mx-auto">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {isLoading ? (
                <Loader2 size={18} className="animate-spin text-muted-foreground" />
              ) : (
                <Search size={18} className="text-muted-foreground" />
              )}
            </div>
            <Input
              type="search"
              className="pl-10 w-full shadow-sm"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="ml-2" 
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
