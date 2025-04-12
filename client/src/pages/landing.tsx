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
        <div className="rounded-lg overflow-hidden shadow-xl">
          <img 
            src="https://images.unsplash.com/photo-1677442135125-19bb22ae49a2?q=80&w=500&auto=format&fit=crop" 
            alt="AI Robot" 
            className="w-full h-60 object-cover"
          />
        </div>
        <div className="rounded-lg overflow-hidden shadow-xl">
          <img 
            src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=500&auto=format&fit=crop" 
            alt="Laptop with Colorful Display" 
            className="w-full h-60 object-cover"
          />
        </div>
      </div>
    </div>
  );
}