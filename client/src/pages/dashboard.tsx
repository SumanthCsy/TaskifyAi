import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, FileSpreadsheet, Presentation, MessageSquare, Code, Image } from "lucide-react";

interface TaskCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}

function TaskCard({ icon, title, description, link }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Link href={link}>
      <Card 
        className={`cursor-pointer transition-all duration-300 h-full
                   ${isHovered ? 'bg-gray-800 transform scale-105' : 'bg-gray-900'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-6 flex flex-col items-center">
          <div className={`text-4xl mb-4 transition-colors ${isHovered ? 'text-purple-400' : 'text-gray-300'}`}>
            {icon}
          </div>
          <h3 className={`text-xl font-bold mb-2 transition-colors ${isHovered ? 'text-white' : 'text-gray-200'}`}>
            {title}
          </h3>
          <p className="text-gray-400 text-center text-sm">
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Dashboard() {
  const tasks = [
    {
      icon: <FileText strokeWidth={1.5} />,
      title: "PDF Assignment",
      description: "Generate complete PDF assignments with AI assistance",
      link: "/prompt-view" 
    },
    {
      icon: <Presentation strokeWidth={1.5} />,
      title: "PowerPoint",
      description: "Create engaging presentations automatically",
      link: "/prompt-view/ppt"
    },
    {
      icon: <FileSpreadsheet strokeWidth={1.5} />,
      title: "Excel Sheets",
      description: "Generate data-rich Excel spreadsheets",
      link: "/prompt-view/excel"
    },
    {
      icon: <Image strokeWidth={1.5} />,
      title: "Image Generation",
      description: "Create custom images from text descriptions",
      link: "/prompt-view/image"
    },
    {
      icon: <Code strokeWidth={1.5} />,
      title: "Code Generation",
      description: "Generate code snippets and solutions",
      link: "/prompt-view/code"
    },
    {
      icon: <MessageSquare strokeWidth={1.5} />,
      title: "AI Chat",
      description: "Chat with our AI assistant for help",
      link: "/chat"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12">Choose Your Task</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task, index) => (
            <TaskCard 
              key={index}
              icon={task.icon}
              title={task.title}
              description={task.description}
              link={task.link}
            />
          ))}
        </div>
      </div>
      
      <footer className="text-center text-gray-500 text-xs mt-16">
        All Copyrights Reserved by Taskify AI | Designed & Developed By @Sumanth Csy
      </footer>
    </div>
  );
}