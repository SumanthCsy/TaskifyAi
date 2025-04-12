import { Loader2, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
  className?: string;
  type?: "default" | "sparkles" | "pulse" | "dots";
}

export default function LoadingSpinner({ 
  size = 40, 
  text = "Loading...",
  className = "",
  type = "default"
}: LoadingSpinnerProps) {
  const [dots, setDots] = useState("");
  
  // Animated dots effect
  useEffect(() => {
    if (type === "dots") {
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev.length >= 3) return "";
          return prev + ".";
        });
      }, 400);
      
      return () => clearInterval(interval);
    }
  }, [type]);

  const pulseAnimation = {
    scale: [1, 1.1, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };
  
  const generateAnimation = {
    opacity: [0, 1],
    y: [20, 0],
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  };
  
  const sparkleVariants = {
    animate: {
      scale: [1, 1.2, 0.9, 1.1, 1],
      rotate: [0, 5, -5, 3, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
  
  const pathVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
        repeatType: "reverse"
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center justify-center py-8 ${className}`}
    >
      {type === "default" && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <Loader2 size={size} className="text-primary mb-3" />
        </motion.div>
      )}
      
      {type === "sparkles" && (
        <motion.div className="relative" variants={sparkleVariants} animate="animate">
          <Sparkles size={size} className="text-primary mb-3" />
          <motion.div 
            className="absolute inset-0 rounded-full bg-primary/20"
            animate={pulseAnimation}
          />
        </motion.div>
      )}
      
      {type === "pulse" && (
        <div className="relative">
          <motion.div 
            className="absolute inset-0 rounded-full bg-primary/10"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.8, 0.2, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            <Zap size={size} className="text-primary mb-3" />
          </motion.div>
        </div>
      )}
      
      {type === "dots" && (
        <motion.div 
          className="flex items-center justify-center space-x-2 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 rounded-full bg-primary"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1, 0] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      )}
      
      <motion.p 
        className="text-muted-foreground text-sm"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {text}{type === "dots" ? dots : ""}
      </motion.p>
    </motion.div>
  );
}
