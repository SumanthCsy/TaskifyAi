import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  Search, 
  BookOpen, 
  Clock, 
  Settings,
  FileText,
  PenTool,
  Globe,
  Lightbulb
} from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar() {
  const [location] = useLocation();

  const menuItems = [
    { path: "/", label: "Dashboard", icon: <Home size={20} /> },
    { path: "/search", label: "Search", icon: <Search size={20} /> },
    { path: "/history", label: "History", icon: <Clock size={20} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  const categories = [
    { id: "science", label: "Science", icon: <Globe size={20} /> },
    { id: "technology", label: "Technology", icon: <PenTool size={20} /> },
    { id: "history", label: "History", icon: <BookOpen size={20} /> },
    { id: "business", label: "Business", icon: <FileText size={20} /> },
    { id: "arts", label: "Arts", icon: <Lightbulb size={20} /> },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card hidden md:block shrink-0">
      <div className="h-full flex flex-col p-4">
        <div className="space-y-1 py-2">
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <Button
                variant={location === item.path ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <a className="flex items-center space-x-2">
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              </Button>
            </Link>
          ))}
        </div>

        <Separator className="my-4" />
        
        <div className="space-y-1">
          <h3 className="px-4 text-sm font-medium text-muted-foreground mb-2">
            Categories
          </h3>
          {categories.map((category) => (
            <Link key={category.id} href={`/search?category=${category.id}`}>
              <Button
                variant="ghost"
                className="w-full justify-start"
                asChild
              >
                <a className="flex items-center space-x-2">
                  {category.icon}
                  <span>{category.label}</span>
                </a>
              </Button>
            </Link>
          ))}
        </div>

        <div className="mt-auto">
          <motion.div 
            className="rounded-lg p-4 bg-primary/10 border border-primary/20"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="font-semibold text-sm text-primary mb-2">Generate PDF Reports</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Create detailed PDF reports from any topic with one click.
            </p>
            <Link href="/search">
              <Button size="sm" className="w-full">
                <FileText size={16} className="mr-2" />
                Create Report
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </aside>
  );
}
