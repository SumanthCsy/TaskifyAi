import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  Search, 
  BookmarkCheck, 
  Clock, 
  Settings,
  FileText,
  PenTool,
  BrainCircuit,
  Sparkles,
  Code
} from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar() {
  const [location] = useLocation();

  const menuItems = [
    { path: "/", label: "Home", icon: <Home size={20} /> },
    { path: "/search", label: "Ask AI", icon: <BrainCircuit size={20} /> },
    { path: "/code-generator", label: "Code Generator", icon: <Code size={20} /> },
    { path: "/favorites", label: "Favorites", icon: <BookmarkCheck size={20} /> },
    { path: "/history", label: "History", icon: <Clock size={20} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={20} /> },
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

        <div className="mt-auto">
          <motion.div 
            className="rounded-lg p-4 bg-primary/10 border border-primary/20"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="font-semibold text-sm text-primary mb-2">Generate PDF Reports</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Create detailed PDF reports from any AI response with one click.
            </p>
            <Link href="/search">
              <Button size="sm" className="w-full">
                <FileText size={16} className="mr-2" />
                Ask AI & Create Report
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </aside>
  );
}
