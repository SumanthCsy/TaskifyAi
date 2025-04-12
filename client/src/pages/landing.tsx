import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center px-4 max-w-3xl"
      >
        <h1 className="text-5xl font-bold mb-6">
          <span className="text-blue-400">Welcome to </span>
          <span className="text-purple-400">Taskify AI</span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-2">
          Taskify AI – Your Smart Assignment Assistant!
        </p>
        <p className="text-lg text-gray-400 mb-2">
          Taskify AI – Automate, Learn, Succeed!
        </p>
        <p className="text-lg text-gray-400 mb-6">
          Taskify AI – Smartly Complete, Effortlessly Create!
        </p>
        
        <p className="text-2xl text-purple-400 mb-10">
          Learn Faster - Work Smarter!
        </p>
        
        <Link href="/dashboard">
          <Button 
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 
                     text-white px-10 py-6 rounded-md text-lg transition-all"
          >
            Continue
          </Button>
        </Link>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 px-6">
        <div className="rounded-lg overflow-hidden shadow-xl bg-gray-800 flex items-center justify-center h-60">
          <div className="text-blue-400 text-8xl">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-32 h-32">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v4" />
              <line x1="8" y1="16" x2="8" y2="16" />
              <line x1="16" y1="16" x2="16" y2="16" />
              <path d="M9 11v-4a3 3 0 0 1 6 0v4" />
            </svg>
          </div>
        </div>
        <div className="rounded-lg overflow-hidden shadow-xl bg-gray-800 flex items-center justify-center h-60">
          <div className="text-purple-400 text-8xl">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-32 h-32">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
              <path d="M6 8h.01M6 12h.01M6 16h.01M10 8h.01M10 12h.01M10 16h.01M14 8h.01M14 12h.01M14 16h.01M18 8h.01M18 12h.01M18 16h.01" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}