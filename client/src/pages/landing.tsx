import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { BrainCircuit, Sparkles, FileText, Code, Globe } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950 text-white flex flex-col">
      {/* Top Logo Section */}
      <div className="w-full flex justify-center pt-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
            <BrainCircuit size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Taskify AI
          </h1>
        </motion.div>
      </div>

      {/* Main Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center max-w-4xl"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="block">Your AI-Powered</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Productivity Platform
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Boost your productivity with AI-powered tools for generating reports, 
            code, and insights - all in one powerful platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                         text-white px-8 py-6 rounded-xl text-lg transition-all shadow-lg shadow-purple-900/30"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            </Link>
            <Link href="/ai-chat">
              <Button 
                variant="outline"
                className="border-2 border-purple-500/30 text-white hover:bg-purple-500/10
                         px-8 py-6 rounded-xl text-lg transition-all"
              >
                <BrainCircuit className="mr-2 h-5 w-5" />
                Try AI Chat
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 md:px-16 lg:px-32 max-w-7xl mx-auto mb-16"
      >
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm 
                      rounded-xl p-6 shadow-lg shadow-purple-900/20 border border-purple-500/10">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl inline-block mb-4">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-xl mb-2 text-blue-300">AI Report Generator</h3>
          <p className="text-gray-300">
            Generate comprehensive PDF reports with just a few clicks. Perfect for research, assignments, and presentations.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm 
                      rounded-xl p-6 shadow-lg shadow-purple-900/20 border border-purple-500/10">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl inline-block mb-4">
            <Code className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-xl mb-2 text-purple-300">Code Generator</h3>
          <p className="text-gray-300">
            Write code in multiple languages with AI assistance. Get explanations and examples to learn as you build.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-pink-900/30 to-blue-900/30 backdrop-blur-sm 
                      rounded-xl p-6 shadow-lg shadow-purple-900/20 border border-purple-500/10">
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-3 rounded-xl inline-block mb-4">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-xl mb-2 text-pink-300">AI Assistant</h3>
          <p className="text-gray-300">
            Get instant answers to your questions. Our AI chat assistant helps you learn, research, and solve problems.
          </p>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="border-t border-purple-900/30 py-8 backdrop-blur-sm bg-black/30">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <BrainCircuit size={20} className="text-purple-400" />
            <span className="text-purple-400 font-medium">Taskify AI</span>
          </div>
          
          <div className="text-gray-400 text-sm">
            © 2025 Taskify AI. Created by <a 
              href="https://sumanthcsy.netlify.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
            >
              Sumanth Csy <Globe size={14} />
            </a>
          </div>
          
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/dashboard">
              <span className="text-sm text-gray-400 hover:text-white transition-colors">Dashboard</span>
            </Link>
            <Link href="/ai-chat">
              <span className="text-sm text-gray-400 hover:text-white transition-colors">AI Chat</span>
            </Link>
            <Link href="/code-generator">
              <span className="text-sm text-gray-400 hover:text-white transition-colors">Code Generator</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}