import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X } from "lucide-react";
import { motion } from "framer-motion";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    document.body.classList.toggle("sidebar-open");
  };

  return (
    <header className="border-b border-border bg-card shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden mr-2" 
            onClick={toggleSidebar}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          
          <Link href="/">
            <a className="flex items-center space-x-2">
              <motion.div 
                className="bg-gradient-to-br from-primary to-purple-500 h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                T
              </motion.div>
              <span className="text-xl font-display font-bold hidden sm:inline-block">Taskify AI</span>
            </a>
          </Link>
        </div>

        {location !== "/search" && (
          <form onSubmit={handleSearch} className="max-w-md w-full mx-4 hidden md:flex">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={18} className="text-muted-foreground" />
              </div>
              <Input
                type="search"
                placeholder="Search for any topic..."
                className="pl-10 w-full bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" className="ml-2">
              Search
            </Button>
          </form>
        )}

        <div className="flex items-center space-x-3">
          {location !== "/search" && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setLocation("/search")}
            >
              <Search size={20} />
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setLocation("/settings")}
            className="hidden sm:flex"
          >
            Settings
          </Button>
        </div>
      </div>
    </header>
  );
}
