import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, BrainCircuit, Code, ArrowRight, Globe, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface TaskCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  color: string;
  delay: number;
}

function TaskCard({ icon, title, description, link, color, delay }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Map colors to Tailwind classes to avoid dynamic class names which don't work
  const colorMap = {
    blue: {
      border: "hover:border-blue-500/50",
      bgBar: "bg-blue-500",
      textIcon: "text-blue-400",
      bgIcon: "bg-blue-500/10",
      textAction: "text-blue-400"
    },
    purple: {
      border: "hover:border-purple-500/50",
      bgBar: "bg-purple-500",
      textIcon: "text-purple-400",
      bgIcon: "bg-purple-500/10",
      textAction: "text-purple-400"
    },
    pink: {
      border: "hover:border-pink-500/50",
      bgBar: "bg-pink-500",
      textIcon: "text-pink-400",
      bgIcon: "bg-pink-500/10",
      textAction: "text-pink-400"
    }
  };
  
  const colorClasses = colorMap[color as keyof typeof colorMap];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
    >
      <Link href={link}>
        <Card 
          className={`cursor-pointer transition-all duration-300 h-full border border-gray-800
                     ${colorClasses.border} overflow-hidden group`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={`h-1 w-full ${colorClasses.bgBar}`}></div>
          <CardContent className="p-6 flex flex-col">
            <div className={`${colorClasses.textIcon} mb-4 p-3 rounded-lg ${colorClasses.bgIcon} w-fit`}>
              {icon}
            </div>
            <h3 className="text-xl font-bold mb-2 text-white group-hover:text-white/90">
              {title}
            </h3>
            <p className="text-gray-400 text-sm mb-4 flex-grow">
              {description}
            </p>
            <div className={`flex items-center ${colorClasses.textAction} text-sm font-medium`}>
              <span>Get Started</span>
              <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function Dashboard() {
  // Focus only on the core features
  const tasks = [
    {
      icon: <BrainCircuit size={24} />,
      title: "AI Assistant",
      description: "Ask questions, get AI-powered answers, and save these insights for future reference.",
      link: "/ai-chat",
      color: "blue"
    },
    {
      icon: <FileText size={24} />,
      title: "Report Generator",
      description: "Create comprehensive reports with rich formatting, and download as PDFs.",
      link: "/reports",
      color: "purple"
    },
    {
      icon: <Code size={24} />,
      title: "Code Generator",
      description: "Generate code in multiple languages and get detailed explanations of how it works.",
      link: "/code-generator",
      color: "pink"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Logo and Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
              <Sparkles size={30} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Taskify AI
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Welcome to your AI productivity workspace. Choose a tool to get started.
          </p>
        </motion.div>
        
        {/* Main Task Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {tasks.map((task, index) => (
            <TaskCard 
              key={index}
              icon={task.icon}
              title={task.title}
              description={task.description}
              link={task.link}
              color={task.color}
              delay={0.2 + index * 0.1}
            />
          ))}
        </div>
        
        {/* Feature Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 border border-gray-800"
        >
          <h2 className="text-2xl font-bold mb-4 text-white">Built with OpenRouter AI</h2>
          <p className="text-gray-300 mb-4">
            Taskify AI leverages powerful AI models to help you create, learn, and build with ease.
            All features are powered by state-of-the-art large language models for the best possible results.
          </p>
        </motion.div>
      </div>
      
      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="text-center text-gray-500 text-sm mt-16 py-4 border-t border-gray-800"
      >
        <div className="flex justify-center items-center gap-2">
          <span>© 2025 Taskify AI</span>
          <span className="text-gray-600">|</span>
          <a 
            href="https://sumanthcsy.netlify.app" 
            target="_blank" 
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Globe size={14} /> 
            Developed by Sumanth Csy
          </a>
        </div>
      </motion.footer>
    </div>
  );
}